# AI Prompts

I used GitHub Copilot to help me with the project. The prompts I have used are listed below.

## Base Prompt

I used the prompt from [cloudflare workers prompting](https://developers.cloudflare.com/workers/get-started/prompting/) doc as the base prompt for github copilot.

## Prompts for building the project

**Change the AI model to workers-ai**

- I want to change the AI model from openai to workers-ai-provider. What else should I do after adding the following code in server.ts:

  ```
  import { createWorkersAI } from 'workers-ai-provider';

  const workersai = createWorkersAI({ binding: env.AI });
  const model = workersai('@cf/meta/llama-3.1-8b-instruct', {
    // additional settings
    safePrompt: true,
  });
  ```

**Explain the starter code**

- After sending the message "What's the weather like in Pittsburgh today" in the app, what would happen? how does the inputs and outputs pass between frontend and backend modules?

**Add multiple conversations**

- Please revise app.tsx and server.jsx, so that the application can manage multiple conversations, and ensure state persistency with memory and Durable Object

**Tools**

- Local time
  - Use `Intl.DateTimeFormat` to enable `getLocalTime` tool to return the real local time, and handle errors correctly
- Email
  - If I want to add an email-writing feature with a human-in-the-loop step that lets the user decide whether to send the email, what's the best practice for organizing the tools and frontend structure within the existing framework?
  - If I don’t want the agent to send emails via an API, but only need to open a preview in the user’s email client, can I simply provide a button that opens a mailto: link?
  - Please implement the email tool invocation card as a separate UI component, and let ToolInvocationCard decide whether to render this email card component.
