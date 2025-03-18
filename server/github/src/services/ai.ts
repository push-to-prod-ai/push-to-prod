import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { config } from "../config/index.js";
import type { AIPrompt, AISummary, ServiceResponse } from "../types/index.js";

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: config.ai.model });
  }

  async generateContent(prompt: AIPrompt): ServiceResponse<AISummary> {
    const response = await this.model.generateContent(prompt);
    return response.response.text();
  }
} 