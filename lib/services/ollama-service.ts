/**
 * Ollama Service
 * Handles communication with the Ollama-based Company Assistant API.
 * Methods are based on the Postman collection.
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


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const ollamaService = {
  /**
   * Send a chat request to the configured model.
   */
  async chat(request: ChatRequest, signal?: AbortSignal) {
    const response = await fetch(`${BASE_URL}/ollama/chat`, {
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
   * Generate a single response for a prompt.
   */
  async generate(request: GenerateRequest, signal?: AbortSignal) {
    const response = await fetch(`${BASE_URL}/ollama/generate`, {
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
};

