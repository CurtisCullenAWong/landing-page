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
// Defaults to '/api' to ensure reliable relative fetching regardless of domain/environment.
let clientBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
if (clientBaseUrl.includes('ollama.com') || (!clientBaseUrl.startsWith('http') && !clientBaseUrl.startsWith('/'))) {
  clientBaseUrl = '/api';
}

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
    return response.json();
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
    return response.json();
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
  private model: string;
  private headers: Record<string, string>;

  constructor() {
    // Dynamic configuration replacing hardcoded values
    this.baseUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2:3b';

    this.headers = {
      'Content-Type': 'application/json',
    };

    const apiKey = process.env.NEXT_PUBLIC_OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY;
    if (apiKey) {
      this.headers['Authorization'] = `Bearer ${apiKey}`;
    }
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

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }

  async generate(req: { prompt: string } | string) {
    const prompt = typeof req === 'string' ? req : req?.prompt;
    if (!prompt) {
      throw new Error('Invalid request: prompt is required');
    }

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }

  async status() {
    const response = await fetch(`${this.baseUrl}/api/version`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      ok: true,
      status: 'online',
      ...data,
    };
  }

  async models() {
    const response = await fetch(`${this.baseUrl}/api/tags`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }

  async pull(req: { name: string } | string) {
    const name = typeof req === 'string' ? req : req?.name;
    if (!name) {
      throw new Error('Invalid request: name is required');
    }

    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ name, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }

  async train(req: { name: string; base_model: string } | string, baseModelParam?: string) {
    const name = typeof req === 'string' ? req : req?.name;
    const baseModel = typeof req === 'string' ? baseModelParam : req?.base_model;

    if (!name || !baseModel) {
      throw new Error('Invalid request: name and base_model are required');
    }

    const systemPrompt = process.env.OLLAMA_SYSTEM_PROMPT || 'You are the Boss Cargo Express company assistant. Answer using accurate information about Boss Cargo Express, its services, careers, and contact details.';

    const modelfile = [
      `FROM ${baseModel}`,
      `SYSTEM """${systemPrompt}"""`,
    ].join('\n');

    const response = await fetch(`${this.baseUrl}/api/create`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ name, modelfile, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }
}

export { OllamaService as OllamaController };
