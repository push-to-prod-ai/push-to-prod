import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { config } from "../config/index.js";
import { DatabaseService } from "./database.js";
import type { AIPrompt, AISummary, ServiceResponse } from "../types/index.js";

// Minimal emergency fallbacks in case of catastrophic failure
const EMERGENCY_SYSTEM_INSTRUCTIONS = "You analyze code changes and create clear, concise PR descriptions.";
const EMERGENCY_PR_PROMPT = "Summarize these code changes: {{diffs}}";

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
   * Get default templates from Firestore
   * @returns Promise resolving to default templates
   */
  private async getDefaultTemplates() {
    try {
      // Get default templates from config collection
      const db = this.databaseService.getFirestoreInstance();
      const defaultTemplatesDoc = await db
        .collection('config')
        .doc('default_templates')
        .get();
      
      if (!defaultTemplatesDoc.exists) {
        console.error("Default templates not found in Firestore, using emergency fallbacks");
        return {
          systemInstructions: EMERGENCY_SYSTEM_INSTRUCTIONS,
          prAnalysisPrompt: EMERGENCY_PR_PROMPT,
        };
      }
      
      const data = defaultTemplatesDoc.data();
      return {
        systemInstructions: data?.systemInstructions || EMERGENCY_SYSTEM_INSTRUCTIONS,
        prAnalysisPrompt: data?.prAnalysisPrompt || EMERGENCY_PR_PROMPT,
      };
    } catch (error) {
      console.error("Error fetching default templates:", error);
      // Use emergency fallbacks in case of error
      return {
        systemInstructions: EMERGENCY_SYSTEM_INSTRUCTIONS,
        prAnalysisPrompt: EMERGENCY_PR_PROMPT,
      };
    }
  }

  /**
   * Get system instructions, using custom ones if available for the user
   * @param userId The user ID to get custom instructions for
   * @returns The system instructions to use
   */
  async getSystemInstructions(userId: string): Promise<string> {
    // Try to get user's custom template
    const customTemplates = await this.databaseService.getPromptTemplates(userId);
    
    if (customTemplates.systemInstructions) {
      return customTemplates.systemInstructions;
    }
    
    // No custom template, get default from Firestore
    const defaultTemplates = await this.getDefaultTemplates();
    return defaultTemplates.systemInstructions;
  }
  
  /**
   * Get PR analysis prompt template, using custom one if available for the user
   * @param userId The user ID to get custom prompt for
   * @returns The PR analysis prompt template to use
   */
  async getPrAnalysisPrompt(userId: string): Promise<string> {
    // Try to get user's custom template
    const customTemplates = await this.databaseService.getPromptTemplates(userId);
    
    if (customTemplates.prAnalysisPrompt) {
      return customTemplates.prAnalysisPrompt;
    }
    
    // No custom template, get default from Firestore
    const defaultTemplates = await this.getDefaultTemplates();
    return defaultTemplates.prAnalysisPrompt;
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