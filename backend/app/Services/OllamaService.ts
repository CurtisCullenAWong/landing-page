/**
 * Ollama Service
 * Handles the actual interaction with the Ollama API/process.
 * This is separated from the frontend to allow for potential 
 * migration to a standalone backend (e.g., Laravel, Express).
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OllamaService {
  private baseUrl: string;

  constructor() {
    // Hardcoded to enforce strict operational boundaries for the company chatbot
    this.baseUrl = 'http://localhost:11434';
  }

  async chat(messages: Message[]) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }

  async generate(prompt: string) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
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
    const response = await fetch(`${this.baseUrl}/api/version`);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      ok: true,
      ...data,
    };
  }

  async models() {
    const response = await fetch(`${this.baseUrl}/api/tags`);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }

  async pull(name: string) {
    if (!name) {
      throw new Error('Invalid request: name is required');
    }

    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }

  async train(name: string, baseModel: string) {
    if (!name || !baseModel) {
      throw new Error('Invalid request: name and base_model are required');
    }

    const modelfile = [
      `FROM ${baseModel}`,
      'SYSTEM """You are the Boss Cargo Express company assistant. Answer using accurate information about Boss Cargo Express, its services, careers, and contact details."""',
    ].join('\n');

    const response = await fetch(`${this.baseUrl}/api/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, modelfile, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return response.json();
  }
}
