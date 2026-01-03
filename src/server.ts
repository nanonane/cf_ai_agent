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

Try to use the available tools to complete the task. Answer directly to the question with best of your knowledge if the tool is not found.

If the function call is not formatted correctly, refer to the format specified in the prompt, correct it, and try again.

${getSchedulePrompt({ date: new Date() })}

If the user asks to schedule a task, use the scheduleReminder tool to schedule the reminder.
`,

          messages: convertToModelMessages(processedMessages),
          model,
          tools: allTools,
          // Type boundary: streamText expects specific tool types, but base class uses ToolSet
          // This is safe because our tools satisfy ToolSet interface (verified by 'satisfies' in tools.ts)
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
          stopWhen: stepCountIs(10)
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    return createUIMessageStreamResponse({ stream });
  }

  async executeReminder(description: string, _task: Schedule<string>) {
    // Add reminder message to chat
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
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

  /**
   * Cancel all scheduled reminders for this agent instance
   * Called when user deletes or switches conversations
   */
  async cancelAllReminders() {
    try {
      const schedules = this.getSchedules();
      if (schedules && schedules.length > 0) {
        for (const schedule of schedules) {
          await this.cancelSchedule(schedule.id);
        }
        console.log(
          `[${new Date().toISOString()}] Cancelled ${schedules.length} scheduled reminders`
        );
      }
    } catch (error) {
      console.error("Error cancelling all reminders:", error);
    }
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
