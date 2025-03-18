import type { AIPrompt, AISummary, ServiceResponse } from "../types/index.js";
export declare class AIService {
    private genAI;
    private model;
    constructor();
    generateContent(prompt: AIPrompt): ServiceResponse<AISummary>;
}
