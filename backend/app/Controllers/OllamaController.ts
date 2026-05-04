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
}
