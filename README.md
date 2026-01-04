# 🤖 AI Chat Agent

An AI-powered chat assistant built using Cloudflare's Agent platform, based on [agents-starter](https://github.com/cloudflare/agents-starter/). Features a React interface with real-time streaming, tool integrations, and task reminder scheduling capabilities.

## Features

- 🤖 AI-Powered Assistant: Powered by Llama 3.3 70B Instruct model via Cloudflare Workers AI
- 💬 Interactive chat interface
  - Multiple chat sessions with a sidebar interface
  - Modern responsive UI, real-time streaming responses
  - Dark/Light Theme
- 🔄 Contextual Memory: Maintains conversation history with Durable Objects for Agent instances (server) and localStorage (client)
- 🛠️ Tool System
  - Local time lookup: Get current time for a specified location
  - Email composition with an option to open in mail client
  - Reminder scheduling with banner notifications
  - // TODO: Plan todo list for given tasks, and set up reminders
- 📅 Advanced Task Scheduling
  - Schedule reminders for specific dates and times (one-time, delayed, and recurring via cron)
  - Task Management: List, cancel individual, or cancel all scheduled tasks
  - Reminder Notifications: Automated reminder banner appear in chat

## Prerequisites

- Node.js (v16 or higher)
- Cloudflare account with Workers AI enabled
- Wrangler CLI (`npm install -g wrangler`)

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure AI binding:**
   Ensure `wrangler.jsonc` includes Workers AI binding:

   ```jsonc
   {
     "ai": {
       "binding": "AI"
     }
   }
   ```

3. **Run locally:**

   ```bash
   npm start
   ```

4. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```

## Configuration

### AI Model Setup

The app uses Llama 3.3 70B Instruct model by default. To use a different model, modify the model instantiation in `src/server.ts`:

```typescript
const model = workersAI("@cf/meta/llama-3.3-70b-instruct-fp8-fast" as any);
```

## Project Structure

```
├── src/
│   ├── app.tsx                    # Main React chat interface component
│   ├── server.ts                  # Agent implementation on the server side
│   ├── tools.ts                   # Tool definitions and executions
│   ├── client.tsx                 # Client-side entry point
│   ├── components/                # React UI components
│   └── ...
├── wrangler.jsonc                # Cloudflare Workers configuration
└── ...
```

## License

MIT
