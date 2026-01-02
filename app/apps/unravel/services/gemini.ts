import { GoogleGenAI, Type } from "@google/genai";
import { createGeminiClient } from "@/lib/gemini";
import { UnravelResponse, OutputFormat } from "../types";

const getSystemInstruction = (format: OutputFormat, urlOrContext: string) => {
  const baseInstruction = `You are an expert editor and content strategist. Your task is to process the following content: ${urlOrContext}`;

  const strictGrounding = `
      CRITICAL - GROUNDING & FACTUALITY:
      1. **NO INVENTIONS**: You must ONLY use the information actually present in the source text. Do NOT invent details, quotes, or statistics to fill space.
      2. **NO GUESSING**: If the provided URL leads to a login page, paywall, or empty content, do NOT guess the content based on the URL words. Instead, indicate that access is denied.
      3. **VERIFY SOURCE**: Ensure the content you are summarizing is the actual article or thread, not a cookie banner or navigation menu.
  `;

  if (format === OutputFormat.SOCIAL) {
    return `
      ${baseInstruction}
      ${strictGrounding}
      
      TRANSFORM GOAL: Rewrite this content into a **high-engagement social media post** (optimized for LinkedIn or Twitter long-form).
      
      GUIDELINES:
      - **Hook**: Start with a punchy, attention-grabbing one-liner from the source material.
      - **Style**: Conversational, direct, and energetic. Use short paragraphs and ample whitespace.
      - **Formatting**: Use bullet points for lists. Use bolding (**text**) for emphasis on key insights.
      - **Emojis**: Use relevant emojis tastefully to break up text and add personality 🧵 👇 🚀.
      - **Ending**: End with a thought-provoking question or a Call to Action (CTA).
      - **Noise**: Remove navigation menus, ads, sidebars, platform UI text, "Thread", "Replying to", and other metadata.
      
      OUTPUT STRUCTURE (JSON):
      - title: The "Hook" or first sentence of the post.
      - markdownContent: The full social post body.
      - summary: A list of 3-5 relevant hashtags.
      - author: The original author's name or Publication name (if found).
    `;
  }

  // Default to BLOG
  return `
    ${baseInstruction}
    ${strictGrounding}
    
    TRANSFORM GOAL: Rewrite the content into a **coherent, high-quality blog article**.
    
    GUIDELINES:
    - **Structure**: Use a clear introduction, body paragraphs, and conclusion.
    - **Formatting**: Use Markdown headers (H1, H2), bold text, and bullet points.
    - **Tone**: Professional, readable, and preserving the original author's voice.
    - **Noise**: Remove navigation menus, ads, sidebars, social media specific jargon (e.g., "Replying to", "Translate", timestamps).
    - **Flow**: Stitch disconnected thoughts or tweets into smooth paragraphs.
    
    OUTPUT STRUCTURE (JSON):
    - title: A catchy, relevant title for the article.
    - markdownContent: The full transformed article content in Markdown.
    - summary: A short executive summary (2-3 sentences).
    - author: The original author's name or Publication name (if found).
  `;
};

export const unravelUrl = async (url: string, format: OutputFormat): Promise<UnravelResponse> => {
  const ai = createGeminiClient();
  
  const prompt = `
    ${getSystemInstruction(format, url)}
    
    STEP 1: ACCESS
    - Use your search tools to find the full content of the page at this URL.
    - CHECK: Is the content accessible? 
      - If it is a login page, paywall, or "403 Forbidden": Return JSON with "markdownContent" set to "ACCESS_DENIED".
      - If it is valid content: Proceed.

    STEP 2: READ
    - If it is a social thread (Twitter/X, Threads, BlueSky), stitch the posts together chronologically.
    - If it is a web article or blog, extract the main content and ignore sidebars, footers, and ads.

    STEP 3: TRANSFORM
    - Follow the GUIDELINES above for ${format} format.
    - STRICTLY adhere to the facts in the source.

    IMPORTANT: Return ONLY valid JSON. 
    - No markdown code blocks.
    - No introductory text. 
    - Ensure all strings are properly escaped.
    
    Format:
    {
      "title": "string",
      "markdownContent": "string",
      "summary": "string",
      "author": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType is NOT allowed when using googleSearch tools
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Robust cleanup: extract the JSON object using Regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
        // If no JSON found, check for refusal messages
        if (text.toLowerCase().includes("sorry") || text.toLowerCase().includes("cannot")) {
            throw new Error("AI could not access this content. It might be behind a paywall, login, or blocked by robots.txt.");
        }
        throw new Error("AI response was not in the expected format.");
    }

    try {
        const data = JSON.parse(text) as UnravelResponse;
        
        // Strict check for hallucination prevention logic
        if (data.markdownContent === "ACCESS_DENIED" || data.title === "ACCESS_DENIED") {
             throw new Error("Content is inaccessible (paywall, login, or bot-blocking). Cannot unravel.");
        }

        return { ...data, originalUrl: url };
    } catch (parseError: any) {
        if (parseError.message.includes("inaccessible")) throw parseError;

        console.error("JSON Parse Error:", parseError);
        console.error("Raw Text:", text);
        // Fallback for malformed JSON if possible, otherwise throw
        throw new Error("Failed to parse the content. The AI output was malformed.");
    }

  } catch (error: any) {
    console.error("Gemini URL Error:", error);
    // Return a cleaner error message to the UI
    if (error.message.includes("paywall") || error.message.includes("blocked") || error.message.includes("inaccessible")) {
        throw error;
    }
    throw new Error("Failed to unravel the URL. The content might be private or inaccessible. Try pasting the text instead.");
  }
};

export const unravelText = async (rawText: string, format: OutputFormat): Promise<UnravelResponse> => {
  const ai = createGeminiClient();
  
  const prompt = `
    ${getSystemInstruction(format, "Raw text provided below")}
    
    Raw Text:
    """
    ${rawText.slice(0, 30000)}
    """
    
    Instructions:
    - Follow the GUIDELINES above for ${format} format.
    - STRICTLY use the provided text. Do not add external facts.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            markdownContent: { type: Type.STRING },
            summary: { type: Type.STRING },
            author: { type: Type.STRING },
          },
          required: ["title", "markdownContent", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // For unravelText we use Structured Output, so it should be valid JSON
    return JSON.parse(text) as UnravelResponse;

  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw new Error("Failed to process the text.");
  }
};
