import fs from 'fs';
import path from 'path';
import { Message } from './ollama-service';

export class OllamaController {
  private baseUrl: string;
  private baseModel: string;
  private cloudModel: string;
  private cloudApiKey?: string;
  private cloudUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL!;
    this.baseModel = process.env.NEXT_PUBLIC_OLLAMA_BASE_MODEL!;
    this.cloudModel = process.env.NEXT_PUBLIC_OLLAMA_CLOUD_MODEL!;
    this.cloudApiKey = process.env.NEXT_PUBLIC_OLLAMA_CLOUD_API_KEY!;
    this.cloudUrl = 'https://ollama.com';
  }

  private getSystemPromptFromModelfile(): string | null {
    try {
      const modelfilePath = path.join(process.cwd(), 'Modelfile');
      if (fs.existsSync(modelfilePath)) {
        const content = fs.readFileSync(modelfilePath, 'utf8');
        const tripleQuotesMatch = content.match(/SYSTEM\s+"""([\s\S]*?)"""/);
        if (tripleQuotesMatch && tripleQuotesMatch[1]) {
          return tripleQuotesMatch[1].trim();
        }
        const doubleQuotesMatch = content.match(/SYSTEM\s+"([^"]*?)"/);
        if (doubleQuotesMatch && doubleQuotesMatch[1]) {
          return doubleQuotesMatch[1].trim();
        }
        const singleQuotesMatch = content.match(/SYSTEM\s+'([^']*?)'/);
        if (singleQuotesMatch && singleQuotesMatch[1]) {
          return singleQuotesMatch[1].trim();
        }
      }
    } catch (e) {
      console.warn('Error reading system prompt from Modelfile:', e);
    }
    return null;
  }

  async chat(req: { messages?: Message[], prompt?: string } | Message[]) {
    let messages: Message[] | null = null;
    if (Array.isArray(req)) {
      messages = req;
    } else if (req && (req.messages || req.prompt)) {
      messages = req.messages || (req.prompt ? [{ role: 'user', content: req.prompt }] : null);
    }

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid request: messages array or prompt is required');
    }

    // Sanitize messages to ensure strictly alternating user/assistant starting with user
    // This prevents errors with strict cloud APIs (like Anthropic)
    messages = messages.reduce((acc: Message[], curr) => {
      if (acc.length === 0) {
        if (curr.role === 'assistant') {
          acc.push({ role: 'user', content: 'Hello' });
        }
        acc.push({ ...curr });
      } else {
        const last = acc[acc.length - 1];
        if (last.role === curr.role) {
          last.content += '\n\n' + curr.content;
        } else {
          acc.push({ ...curr });
        }
      }
      return acc;
    }, []);

    // 1. Try local base model
    try {
      let response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.baseModel,
          messages,
          stream: false,
        }),
      });

      // If model not found, auto-pull it and retry
      if (response.status === 404 || !response.ok) {
        const errorText = await response.text().catch(() => '');
        if (response.status === 404 || errorText.includes('not found') || errorText.includes('model')) {
          console.log(`[OllamaService] Model '${this.baseModel}' not found locally. Auto-pulling from registry...`);
          const pullRes = await fetch(`${this.baseUrl}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.baseModel, stream: false }),
          });
          if (!pullRes.ok) {
            const pullErrText = await pullRes.text().catch(() => '');
            throw new Error(`Failed to pull model '${this.baseModel}': ${pullErrText || pullRes.statusText}`);
          }
          console.log(`[OllamaService] Successfully pulled '${this.baseModel}'. Retrying chat request...`);
          response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.baseModel,
              messages,
              stream: false,
            }),
          });
        } else {
          throw new Error(`Ollama API error (${response.status}): ${errorText || response.statusText}`);
        }
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Ollama API error (${response.status}): ${errText || response.statusText}`);
      }

      return await response.json();
    } catch (localError: any) {
      console.warn(`[OllamaService] Local chat call failed: ${localError.message}. Retrying with Cloud Model...`);

      // 2. Fallback to cloud model before throwing error
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.cloudApiKey) {
          headers['Authorization'] = `Bearer ${this.cloudApiKey}`;
        }

        const systemPrompt = this.getSystemPromptFromModelfile();
        let cloudMessages = [...messages];
        if (systemPrompt) {
          cloudMessages.unshift({ role: 'system', content: systemPrompt });
        }

        const response = await fetch(`${this.cloudUrl}/api/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.cloudModel,
            messages: cloudMessages,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Cloud Ollama API error (${response.status}): ${errText || response.statusText}`);
        }

        return await response.json();
      } catch (cloudError: any) {
        console.error('[OllamaService] Cloud chat error:', cloudError.message);
        throw new Error(`Ollama API error: Local and Cloud fallbacks failed. Local: ${localError.message}. Cloud: ${cloudError.message}`);
      }
    }
  }

  async generate(req: { prompt: string } | string) {
    const prompt = typeof req === 'string' ? req : req?.prompt;
    if (!prompt) {
      throw new Error('Invalid request: prompt is required');
    }

    // 1. Try local base model
    try {
      let response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.baseModel,
          prompt,
          stream: false,
        }),
      });

      if (response.status === 404 || !response.ok) {
        const errorText = await response.text().catch(() => '');
        if (response.status === 404 || errorText.includes('not found') || errorText.includes('model')) {
          console.log(`[OllamaService] Model '${this.baseModel}' not found locally. Auto-pulling from registry...`);
          const pullRes = await fetch(`${this.baseUrl}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.baseModel, stream: false }),
          });
          if (!pullRes.ok) {
            const pullErrText = await pullRes.text().catch(() => '');
            throw new Error(`Failed to pull model '${this.baseModel}': ${pullErrText || pullRes.statusText}`);
          }
          console.log(`[OllamaService] Successfully pulled '${this.baseModel}'. Retrying generate request...`);
          response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.baseModel,
              prompt,
              stream: false,
            }),
          });
        } else {
          throw new Error(`Ollama API error (${response.status}): ${errorText || response.statusText}`);
        }
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Ollama API error (${response.status}): ${errText || response.statusText}`);
      }

      return await response.json();
    } catch (localError: any) {
      console.warn(`[OllamaService] Local generate call failed: ${localError.message}. Retrying with Cloud Model...`);

      // 2. Fallback to cloud model before throwing error
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.cloudApiKey) {
          headers['Authorization'] = `Bearer ${this.cloudApiKey}`;
        }

        const systemPrompt = this.getSystemPromptFromModelfile();

        const response = await fetch(`${this.cloudUrl}/api/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.cloudModel,
            prompt,
            system: systemPrompt || undefined,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Cloud Ollama API error (${response.status}): ${errText || response.statusText}`);
        }

        return await response.json();
      } catch (cloudError: any) {
        console.error('[OllamaService] Cloud generate error:', cloudError.message);
        throw new Error(`Ollama API error: Local and Cloud fallbacks failed. Local: ${localError.message}. Cloud: ${cloudError.message}`);
      }
    }
  }

  async status() {
    let localOnline = false;
    let cloudOnline = false;

    // 1. Check local
    try {
      const response = await fetch(`${this.baseUrl}/api/version`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) localOnline = true;
    } catch (error) {
      console.warn('Ollama local instance offline for status check');
    }

    // 2. Check cloud if local is offline (or always check both? Let's just check cloud if we have a key)
    if (this.cloudApiKey) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        headers['Authorization'] = `Bearer ${this.cloudApiKey}`;
        const response = await fetch(`${this.cloudUrl}/api/tags`, {
          headers,
        });
        // using /api/tags because it's a standard endpoint that should return 200 if auth is valid
        if (response.ok) cloudOnline = true;
      } catch (error) {
        console.warn('Ollama cloud instance offline for status check');
      }
    }

    if (localOnline) {
      return { ok: true, status: 'online', mode: 'local' };
    } else if (cloudOnline) {
      return { ok: true, status: 'online', mode: 'cloud' };
    }

    return { ok: false, status: 'offline', mode: 'offline' };
  }

  async models() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Ollama API error: ${response.statusText}`);
    } catch (error: any) {
      console.warn('Ollama instance offline for models check:', error.message);
      throw new Error(`Ollama API error: ${error.message}. Please ensure Ollama is running locally on ${this.baseUrl}`);
    }
  }

  async pull(req: { name: string } | string) {
    const name = typeof req === 'string' ? req : req?.name;
    if (!name) {
      throw new Error('Invalid request: name is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, stream: false }),
      });

      if (response.ok) {
        return await response.json();
      }
      const errText = await response.text().catch(() => '');
      throw new Error(`Ollama API error (${response.status}): ${errText || response.statusText}`);
    } catch (error: any) {
      console.warn('Ollama instance offline for pull:', error.message);
      throw new Error(`Ollama API error: ${error.message}. Please ensure Ollama is running locally on ${this.baseUrl}`);
    }
  }

  async train(req: { name: string; base_model: string } | string, baseModelParam?: string) {
    const name = typeof req === 'string' ? req : req?.name;
    const baseModel = typeof req === 'string' ? baseModelParam : req?.base_model;

    if (!name || !baseModel) {
      throw new Error('Invalid request: name and base_model are required');
    }

    let modelfile = `FROM ${baseModel}`;
    try {
      const modelfilePath = path.join(process.cwd(), 'Modelfile');
      if (fs.existsSync(modelfilePath)) {
        modelfile = fs.readFileSync(modelfilePath, 'utf8');
      }
    } catch (e) {
      console.warn('Could not read Modelfile, using default FROM', e);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, modelfile, stream: false }),
      });

      if (response.ok) {
        return await response.json();
      }
      const errText = await response.text().catch(() => '');
      throw new Error(`Ollama API error (${response.status}): ${errText || response.statusText}`);
    } catch (error: any) {
      console.warn('Ollama instance offline for train:', error.message);
      throw new Error(`Ollama API error: ${error.message}. Please ensure Ollama is running locally on ${this.baseUrl}`);
    }
  }
}
