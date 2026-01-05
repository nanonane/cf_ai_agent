import { routeAgentRequest, type Schedule } from "agents";

import { getSchedulePrompt } from "agents/schedule";

import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  stepCountIs,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet
} from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { processToolCalls, cleanupMessages } from "./utils";
import { tools, executions } from "./tools";
import { env } from "cloudflare:workers";

const workersAI = createWorkersAI({ binding: env.AI });
// biome-ignore lint/suspicious/noExplicitAny: Required for Workers AI model instantiation
const model = workersAI("@cf/meta/llama-3.3-70b-instruct-fp8-fast" as any);

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools
      // ...this.mcp.getAITools() // Temporarily removed to avoid MCP initialization error
    };

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: cleanedMessages,
          dataStream: writer,
          tools: allTools,
          executions
        });

        const result = streamText({
          system: `You are a helpful and friendly personal assistant that can do various tasks.

CRITICAL TOOL USAGE INSTRUCTIONS:
- Use tools automatically when the user asks for information that requires them. Try to use provided tools to complete the user's request as much as possible.
- When a tool call is needed, directly call the tool function, then return tool results to the user. Do NOT return messages like "your function call is:" or show tool call parameters JSON to the user.
- If a tool fails, fix the issue and retry next time.

${getSchedulePrompt({ date: new Date() })}

- When users ask to "set a reminder", "schedule something", or similar, use scheduleReminder tool.
- When user asks to "list all the reminders", "show all the tasks", or similar, call getScheduledTasks tool.
- When user asks to "cancel the reminder", use cancelScheduledTask or cancelAllScheduledTasks tool, based on user's message.
- IMPORTANT: Messages starting with "Reminder:" are SYSTEM-GENERATED notifications from previously scheduled tasks. NEVER use any tools when you see these messages. Do not respond to them as if they were user requests. 
- For each reminder, you should only call the scheduleReminder tool once per user request. Do not create duplicate reminders.
`,

          messages: convertToModelMessages(processedMessages),
          model,
          tools: allTools,
          // Type boundary: streamText expects specific tool types, but base class uses ToolSet
          // This is safe because our tools satisfy ToolSet interface (verified by 'satisfies' in tools.ts)
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
          onError: (error) => {
            // Handle tool call formatting errors by triggering a retry
            console.log("Tool call error detected:", error);
            // The error will be handled by the framework, but we can log it for debugging
          },
          stopWhen: stepCountIs(10)
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    return createUIMessageStreamResponse({ stream });
  }

  async executeReminder(description: string, _task: Schedule<string>) {
    // Check if the conversation still exists and has messages
    // If not, cancel this orphaned reminder task
    if (this.messages.length === 0) {
      console.log(
        "Skipping and cancelling orphaned reminder for deleted conversation"
      );
      try {
        await this.cancelSchedule(_task.id);
        console.log(`Cancelled orphaned reminder task: ${_task.id}`);
      } catch (error) {
        console.error(
          `Failed to cancel orphaned reminder task ${_task.id}:`,
          error
        );
      }
      return;
    }

    // Add reminder message to chat as assistant message to avoid triggering new reminder creation
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `Reminder: ${description}`
          }
        ],
        metadata: {
          createdAt: new Date(),
          isReminder: true
        }
      }
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/check-ai-binding") {
      const hasAIBinding = !!env.AI;
      return Response.json({
        success: hasAIBinding
      });
    }
    if (!env.AI) {
      console.error(
        "AI binding is not set, ensure it is configured in wrangler.jsonc and deployed"
      );
    }
    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
