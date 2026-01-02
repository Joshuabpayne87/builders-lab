import { GoogleGenAI, Type, Schema } from "@google/genai";
import { createGeminiClient } from "@/lib/gemini";
import { AnalysisResult, VariableResult } from "../types";

// Helper to clean JSON string if markdown blocks are present
const cleanJson = (text: string): string => {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '');
  }
  return clean;
};

export const analyzePromptWithGemini = async (promptText: string): Promise<AnalysisResult> => {
  try {
    const ai = createGeminiClient();
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Score from 0 to 100 representing prompt quality." },
        summary: { type: Type.STRING, description: "A brief summary of the prompt's intent." },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of strong points."
        },
        weaknesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of areas for improvement."
        },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER, description: "Index of the best option (0-based)." },
              explanation: { type: Type.STRING, description: "Why this is the best option." }
            },
            required: ["id", "question", "options", "correctIndex", "explanation"]
          },
          description: "3 multiple choice questions to help the user understand how to improve this specific prompt."
        }
      },
      required: ["score", "summary", "strengths", "weaknesses", "questions"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following prompt for an LLM. Score it on clarity, structure, and effectiveness. 
      Provide actionable feedback and generate 3 multiple-choice questions that would help the user understand the specific weaknesses of their prompt.
      
      Prompt to analyze:
      "${promptText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.3,
      }
    });

    const text = response.text || "{}";
    return JSON.parse(cleanJson(text)) as AnalysisResult;
  } catch (error) {
    console.error("[PromptStash] Analysis failed:", error);
    throw error;
  }
};

export const rewritePromptWithGemini = async (originalPrompt: string, critique: AnalysisResult): Promise<string> => {
  try {
    const ai = createGeminiClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Prompt Engineer. Rewrite the following prompt to be highly effective, structured, and clear for an LLM.
      
      Original Prompt: "${originalPrompt}"
      
      Consider the following weaknesses identified: ${critique.weaknesses.join(', ')}.
      
      The rewritten prompt should use best practices (personas, clear instructions, constraints, output format). 
      Return ONLY the rewritten prompt text. Do not add markdown formatting or explanations outside the prompt.`,
    });

    return response.text || "";
  } catch (error) {
    console.error("[PromptStash] Rewrite failed:", error);
    throw error;
  }
};

export const extractVariablesWithGemini = async (promptText: string): Promise<VariableResult> => {
  try {
    const ai = createGeminiClient();
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        template: { type: Type.STRING, description: "The prompt text with dynamic parts replaced by handlebars syntax {{variableName}}." },
        variables: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              defaultValue: { type: Type.STRING }
            },
            required: ["name", "description", "defaultValue"]
          }
        }
      },
      required: ["template", "variables"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Identify dynamic variables in this prompt (e.g., specific names, topics, numbers, tones). 
      Convert the prompt into a template using {{variableName}} syntax.
      Provide a list of these variables with descriptions and suggested default values based on the original text.
      
      Prompt: "${promptText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text || "{}";
    return JSON.parse(cleanJson(text)) as VariableResult;
  } catch (error) {
    console.error("[PromptStash] Extraction failed:", error);
    throw error;
  }
};
