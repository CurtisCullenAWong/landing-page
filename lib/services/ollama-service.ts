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
  private baseUrl: string;
  private baseModel: string;
  private cloudModel: string;
  private cloudApiKey?: string;
  private systemPrompt?: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL!;
    this.baseModel = process.env.NEXT_PUBLIC_OLLAMA_BASE_MODEL!;
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

        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.cloudModel,
            messages,
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

        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.cloudModel,
            prompt,
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
    try {
      const response = await fetch(`${this.baseUrl}/api/version`, {
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
      throw new Error(`Ollama API error: ${response.statusText}`);
    } catch (error: any) {
      console.warn('Ollama instance offline for status check:', error.message);
      throw new Error(`Ollama API error: ${error.message}. Please ensure Ollama is running locally on ${this.baseUrl}`);
    }
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

    const modelfile = [
      `FROM ${baseModel}`,
      this.systemPrompt ? `SYSTEM """${this.systemPrompt}"""` : '',
    ].filter(Boolean).join('\n');

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

export { OllamaService as OllamaController };
