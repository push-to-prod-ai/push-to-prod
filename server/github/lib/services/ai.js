import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/index.js";
export class AIService {
    genAI;
    model;
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: config.ai.model });
    }
    async generateContent(prompt) {
        const response = await this.model.generateContent(prompt);
        return response.response.text();
    }
}
//# sourceMappingURL=ai.js.map