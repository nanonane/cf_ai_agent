# AI Prompts for Buiding the Project

I used GitHub Copilot to help me with the project. The prompts I used are listed below.

### Change the AI model to workers-ai

I want to change the AI model from openai to workers-ai-provider. What else should I do after adding the following code in server.ts:

```
import { createWorkersAI } from 'workers-ai-provider';

const workersai = createWorkersAI({ binding: env.AI });
const model = workersai('@cf/meta/llama-3.1-8b-instruct', {
  // additional settings
  safePrompt: true,
});
```
