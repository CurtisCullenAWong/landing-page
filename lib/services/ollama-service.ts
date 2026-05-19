/**
 * Ollama Client Service
 * Handles client-side communication with Next.js API routes.
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
      if (data.mode) {
        return data.mode;
      }
      return data.status === 'online' || data.ok === true ? 'local' : 'offline';
    } catch (e) {
      return 'offline';
    }
  },
};
