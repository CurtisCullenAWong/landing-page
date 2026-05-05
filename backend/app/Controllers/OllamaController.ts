import { OllamaService } from '../Services/OllamaService';

/**
 * Ollama Controller
 * Handles incoming requests and maps them to the Ollama Service.
 */
export class OllamaController {
  private ollamaService: OllamaService;

  constructor() {
    this.ollamaService = new OllamaService();
  }

  async chat(req: { messages?: any[], prompt?: string }) {
    const messages = req.messages || (req.prompt ? [{ role: 'user', content: req.prompt }] : null);
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid request: messages array or prompt is required');
    }
    return await this.ollamaService.chat(messages);
  }

  async generate(req: { prompt: string }) {
    if (!req.prompt) {
      throw new Error('Invalid request: prompt is required');
    }
    return await this.ollamaService.generate(req.prompt);
  }

  async status() {
    return await this.ollamaService.status();
  }

  async models() {
    return await this.ollamaService.models();
  }

  async pull(req: { name: string }) {
    if (!req.name) {
      throw new Error('Invalid request: name is required');
    }

    return await this.ollamaService.pull(req.name);
  }

  async train(req: { name: string; base_model: string }) {
    if (!req.name || !req.base_model) {
      throw new Error('Invalid request: name and base_model are required');
    }

    return await this.ollamaService.train(req.name, req.base_model);
  }
}
