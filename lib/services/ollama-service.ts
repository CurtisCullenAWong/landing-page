/**
 * Ollama Service & Controller (Merged)
 * Handles both client-side communication with Next.js API routes
 * and server-side communication with the Ollama AI instance.
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  prompt?: string;
  messages: Message[];
}

export interface GenerateRequest {
  prompt: string;
}

// ==========================================
// CLIENT-SIDE SERVICE (Calls Next.js API Routes)
// ==========================================

// Determine appropriate base URL for calling Next.js API routes.
const clientBaseUrl = '/api';

export const ollamaService = {
  /**
   * Send a chat request to the configured model via Next.js API.
   */
  async chat(request: ChatRequest, signal?: AbortSignal) {
    const response = await fetch(`${clientBaseUrl}/ollama/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }
    return data;
  },

  /**
   * Generate a single response for a prompt via Next.js API.
   */
  async generate(request: GenerateRequest, signal?: AbortSignal) {
    const response = await fetch(`${clientBaseUrl}/ollama/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }
    return data;
  },

  /**
   * Check if the service is available via Next.js API.
   */
  async checkStatus() {
    try {
      const response = await fetch(`${clientBaseUrl}/ollama/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      const data = await response.json();
      return data.status === 'online' || data.ok === true;
    } catch (e) {
      return false;
    }
  },
};

// ==========================================
// SERVER-SIDE SERVICE & CONTROLLER (Calls Ollama Instance)
// ==========================================

export class OllamaService {
  private localBaseUrl: string;
  private localModel: string;
  private cloudBaseUrl: string;
  private cloudModel: string;
  private cloudApiKey: string;
  private systemPrompt?: string;

  constructor() {
    this.localBaseUrl = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL!;
    this.localModel = process.env.NEXT_PUBLIC_OLLAMA_CLOUD_MODEL!;
    this.cloudBaseUrl = process.env.NEXT_PUBLIC_OLLAMA_CLOUD_BASE_URL!;
    this.cloudModel = process.env.NEXT_PUBLIC_OLLAMA_CLOUD_MODEL!;
    this.cloudApiKey = process.env.NEXT_PUBLIC_OLLAMA_CLOUD_API_KEY!;
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

    try {
      const response = await fetch(`${this.localBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.localModel,
          messages,
          stream: false,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Local Ollama API error: ${response.statusText}`);
    } catch (localError: any) {
      console.warn('Local Ollama instance offline or failed, falling back to Ollama Cloud:', localError.message);

      const cloudHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cloudApiKey}`,
      };

      let response = await fetch(`${this.cloudBaseUrl}/api/chat`, {
        method: 'POST',
        headers: cloudHeaders,
        body: JSON.stringify({
          model: this.cloudModel,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.warn(`Ollama Cloud custom model '${this.cloudModel}' failed (${response.status}), attempting fallback to standard cloud model 'deepseek-r1t2-chimera'...`);
        response = await fetch(`${this.cloudBaseUrl}/api/chat`, {
          method: 'POST',
          headers: cloudHeaders,
          body: JSON.stringify({
            model: 'deepseek-r1t2-chimera',
            messages,
            stream: false,
          }),
        });
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Ollama Cloud API error (${response.status}): ${errText || response.statusText}`);
      }

      return await response.json();
    }
  }

  async generate(req: { prompt: string } | string) {
    const prompt = typeof req === 'string' ? req : req?.prompt;
    if (!prompt) {
      throw new Error('Invalid request: prompt is required');
    }

    try {
      const response = await fetch(`${this.localBaseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.localModel,
          prompt,
          stream: false,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Local Ollama API error: ${response.statusText}`);
    } catch (localError: any) {
      console.warn('Local Ollama instance offline or failed, falling back to Ollama Cloud:', localError.message);

      const cloudHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cloudApiKey}`,
      };

      let response = await fetch(`${this.cloudBaseUrl}/api/generate`, {
        method: 'POST',
        headers: cloudHeaders,
        body: JSON.stringify({
          model: this.cloudModel,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.warn(`Ollama Cloud custom model '${this.cloudModel}' failed (${response.status}), attempting fallback to standard cloud model 'curtiscullenagustinwong/company-chatbot'...`);
        response = await fetch(`${this.cloudBaseUrl}/api/generate`, {
          method: 'POST',
          headers: cloudHeaders,
          body: JSON.stringify({
            model: 'curtiscullenagustinwong/company-chatbot',
            prompt,
            stream: false,
          }),
        });
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Ollama Cloud API error (${response.status}): ${errText || response.statusText}`);
      }

      return await response.json();
    }
  }

  async status() {
    try {
      const response = await fetch(`${this.localBaseUrl}/api/version`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          ok: true,
          status: 'online',
          mode: 'localhost',
          ...data,
        };
      }
      throw new Error(`Local Ollama API error: ${response.statusText}`);
    } catch (localError: any) {
      console.warn('Local Ollama instance offline for status check, checking Ollama Cloud:', localError.message);

      const cloudHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cloudApiKey}`,
      };

      const response = await fetch(`${this.cloudBaseUrl}/api/version`, {
        headers: cloudHeaders,
      });

      if (!response.ok) {
        throw new Error(`Ollama Cloud API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ok: true,
        status: 'online',
        mode: 'cloud',
        ...data,
      };
    }
  }

  async models() {
    try {
      const response = await fetch(`${this.localBaseUrl}/api/tags`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Local Ollama API error: ${response.statusText}`);
    } catch (localError: any) {
      console.warn('Local Ollama instance offline for models check, checking Ollama Cloud:', localError.message);

      const cloudHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cloudApiKey}`,
      };

      const response = await fetch(`${this.cloudBaseUrl}/api/tags`, {
        headers: cloudHeaders,
      });

      if (!response.ok) {
        throw new Error(`Ollama Cloud API error: ${response.statusText}`);
      }

      return await response.json();
    }
  }

  async pull(req: { name: string } | string) {
    const name = typeof req === 'string' ? req : req?.name;
    if (!name) {
      throw new Error('Invalid request: name is required');
    }

    try {
      const response = await fetch(`${this.localBaseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, stream: false }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Local Ollama API error: ${response.statusText}`);
    } catch (localError: any) {
      console.warn('Local Ollama instance offline for pull, attempting Ollama Cloud:', localError.message);

      const cloudHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cloudApiKey}`,
      };

      const response = await fetch(`${this.cloudBaseUrl}/api/pull`, {
        method: 'POST',
        headers: cloudHeaders,
        body: JSON.stringify({ name, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`Ollama Cloud API error: ${response.statusText}`);
      }

      return await response.json();
    }
  }

  async train(req: { name: string; base_model: string } | string, baseModelParam?: string) {
    const name = typeof req === 'string' ? req : req?.name;
    const baseModel = typeof req === 'string' ? baseModelParam : req?.base_model;

    if (!name || !baseModel) {
      throw new Error('Invalid request: name and base_model are required');
    }

    const modelfile = [
      `FROM ${baseModel}`,
      this.systemPrompt ? `SYSTEM """${this.systemPrompt}"""` : '',
    ].filter(Boolean).join('\n');

    try {
      const response = await fetch(`${this.localBaseUrl}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, modelfile, stream: false }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Local Ollama API error: ${response.statusText}`);
    } catch (localError: any) {
      console.warn('Local Ollama instance offline for train, attempting Ollama Cloud:', localError.message);

      const cloudHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cloudApiKey}`,
      };

      const response = await fetch(`${this.cloudBaseUrl}/api/create`, {
        method: 'POST',
        headers: cloudHeaders,
        body: JSON.stringify({ name, modelfile, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`Ollama Cloud API error: ${response.statusText}`);
      }

      return await response.json();
    }
  }
}

export { OllamaService as OllamaController };
