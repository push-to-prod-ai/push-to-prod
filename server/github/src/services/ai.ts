import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { config } from "../config/index.js";
import { systemInstructions } from "../templates/index.js";
import type { AIPrompt, AISummary, ServiceResponse } from "../types/index.js";

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: config.ai.model,
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.8,
      },
    });
  }

  async generateContent(prompt: AIPrompt): ServiceResponse<AISummary> {
    // Start a chat with system instructions
    const chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstructions }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'll follow these instructions for summarizing GitHub Pull Requests." }],
        },
      ],
    });

    // Send the actual prompt as a follow-up message
    const response = await chat.sendMessage(prompt);
    return response.response.text();
  }
} 