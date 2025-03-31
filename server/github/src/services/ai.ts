import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { config } from "../config/index.js";
import { systemInstructions as defaultSystemInstructions, prAnalysisPrompt as defaultPrAnalysisPrompt } from "../templates/index.js";
import { DatabaseService } from "./database.js";
import type { AIPrompt, AISummary, ServiceResponse } from "../types/index.js";

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private databaseService: DatabaseService;

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
    this.databaseService = new DatabaseService();
  }

  /**
   * Get system instructions, using custom ones if available for the user
   * @param userId The user ID to get custom instructions for
   * @returns The system instructions to use
   */
  async getSystemInstructions(userId: string): Promise<string> {
    const customTemplates = await this.databaseService.getPromptTemplates(userId);
    return customTemplates.systemInstructions || defaultSystemInstructions;
  }
  
  /**
   * Get PR analysis prompt template, using custom one if available for the user
   * @param userId The user ID to get custom prompt for
   * @returns The PR analysis prompt template to use
   */
  async getPrAnalysisPrompt(userId: string): Promise<string> {
    const customTemplates = await this.databaseService.getPromptTemplates(userId);
    return customTemplates.prAnalysisPrompt || defaultPrAnalysisPrompt;
  }

  /**
   * Generate content using AI model with custom instructions if available
   * @param prompt The prompt to send
   * @param userId The user ID for retrieving custom templates
   * @returns The generated content
   */
  async generateContent(prompt: AIPrompt, userId: string = 'default'): ServiceResponse<AISummary> {
    // Get custom or default system instructions
    const instructions = await this.getSystemInstructions(userId);
    
    // Start a chat with system instructions
    const chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: instructions }],
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