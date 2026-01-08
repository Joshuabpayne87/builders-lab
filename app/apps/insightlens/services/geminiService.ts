import { Type, Modality } from "@google/genai";
import { geminiGenerateContent } from "@/lib/gemini-http";
import { LensType, TransformationResult, MindMapNode } from '../types';

const MODELS = {
  TEXT: 'gemini-1.5-flash',
  COMPLEX: 'gemini-1.5-flash',
  IMAGE: 'gemini-1.5-flash'
};

/**
 * Converts a File object to a Base64 string for the API.
 */
export const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Adds a WAV header to raw PCM data (16-bit, 24kHz, Mono).
 */
const addWavHeader = (base64Pcm: string): string => {
  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + len, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count (1)
  view.setUint16(22, 1, true);
  // sample rate (24k)
  view.setUint32(24, 24000, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, 24000 * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, len, true);

  // write the PCM samples
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    bytes[44 + i] = binaryString.charCodeAt(i);
  }

  // Convert back to base64
  let binary = '';
  const bytesLength = bytes.byteLength;
  for (let i = 0; i < bytesLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const retry = async <T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
};

export const transformContent = async (
  input: string | File,
  inputType: 'TEXT' | 'URL' | 'FILE',
  lens: LensType,
  customInstruction?: string
): Promise<TransformationResult> => {

  let userContent: any;

  if (inputType === 'FILE' && input instanceof File) {
    const filePart = await fileToPart(input);
    userContent = {
      parts: [
        filePart,
        { text: "Analyze this document." }
      ]
    };
  } else if (inputType === 'URL') {
    // For URL, we rely on the model's ability to process the URL via search grounding or internal knowledge
    userContent = { parts: [{ text: `Analyze the content at this URL: ${input}. Focus on the main topics and key details.` }] };
  } else {
    userContent = { parts: [{ text: input as string }] };
  }

  try {
    switch (lens) {
      case LensType.MINDMAP:
        return await retry(() => generateMindMap(userContent, customInstruction));
      case LensType.VISUAL:
        return await retry(() => generateVisuals(userContent, customInstruction));
      case LensType.SUMMARY:
        return await retry(() => generateText(userContent, "Create a comprehensive yet concise summary of this content. Use bullet points for key takeaways.", LensType.SUMMARY, customInstruction));
      case LensType.OUTLINE:
        return await retry(() => generateText(userContent, "Create a structured hierarchical outline of this content using Markdown.", LensType.OUTLINE, customInstruction));
      case LensType.SCRIPT:
        return await retry(() => generateText(userContent, "Write a video script based on this content, suitable for a 5-minute educational YouTube video.", LensType.SCRIPT, customInstruction));
      case LensType.TRANSLATE:
        return await retry(() => generateText(userContent, "Translate the following content. If no target language is specified in the additional instructions, translate it to clear, professional English. Maintain original formatting where possible.", LensType.TRANSLATE, customInstruction));
      case LensType.QUIZ:
        return await retry(() => generateText(userContent, "Generate a multiple-choice quiz with 5 challenging questions based on the content. Include the correct answer key at the bottom.", LensType.QUIZ, customInstruction));
      case LensType.ELI5:
        return await retry(() => generateText(userContent, "Explain this content in the simplest terms possible, using analogies suitable for a 5-year-old. Avoid jargon.", LensType.ELI5, customInstruction));
      case LensType.CRITIQUE:
        return await retry(() => generateText(userContent, "Critically analyze this content. Identify logical fallacies, potential biases, strength of arguments, and areas that need more evidence.", LensType.CRITIQUE, customInstruction));
      case LensType.SOCIAL:
        return await retry(() => generateText(userContent, "Create a set of engaging social media posts based on this content: 1. A Twitter/X thread (5 tweets). 2. A professional LinkedIn post. 3. An engaging Instagram caption.", LensType.SOCIAL, customInstruction));
      default:
        throw new Error("Unknown Lens Type");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const generateText = async (content: any, basePrompt: string, type: LensType, customInstruction?: string): Promise<TransformationResult> => {
  const modelId = MODELS.TEXT;
  
  const finalPrompt = customInstruction 
    ? `${basePrompt}\n\nAdditional User Instructions: ${customInstruction}`
    : basePrompt;

  let parts;
  if (content.parts) {
    parts = [...content.parts, { text: finalPrompt }];
  } else {
    parts = [{ text: finalPrompt }, { text: `\n\nContent:\n${content}` }];
  }

  // Explicitly conditionally add tools
  const config: any = {};
  if (type === LensType.SUMMARY || type === LensType.CRITIQUE) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await geminiGenerateContent({
    model: modelId,
    contents: parts,
    config: config
  });

  return {
    type,
    text: response.text || "No output generated."
  };
};

const generateMindMap = async (content: any, customInstruction?: string): Promise<TransformationResult> => {
  let promptText = "Analyze the provided content and generate a hierarchical mind map structure. The root node should be the main topic. Children should be subtopics.";
  
  if (customInstruction) {
    promptText += `\n\nSpecific Focus: ${customInstruction}`;
  }

  let parts;
  if (content.parts) {
    parts = [...content.parts, { text: promptText }];
  } else {
    parts = [{ text: promptText }, { text: `\n\nContent:\n${content}` }];
  }

  const response = await geminiGenerateContent({
    model: MODELS.COMPLEX,
    contents: parts,
    config: {
      responseMimeType: "application/json",
    }
  });

  const jsonText = response.text || "{}";
  let mindMapData: MindMapNode;
  
  try {
    mindMapData = JSON.parse(jsonText);
  } catch (e) {
    mindMapData = { name: "Error parsing Mindmap", children: [] };
  }

  return {
    type: LensType.MINDMAP,
    mindMapData
  };
};

const generateVisuals = async (content: any, customInstruction?: string): Promise<TransformationResult> => {
  // Step 1: Distill the content into a clear image description
  let descriptionPrompt = "Create a detailed visual description for an educational infographic or diagram that explains the core concept of this content. The description should be suitable for an illustrator. Focus on visual metaphors, layout, and clarity. Keep it under 150 words.";
  
  if (customInstruction) {
    descriptionPrompt += `\n\nStyle/Theme Instructions: ${customInstruction}`;
  }

  // Use a simple retry for the text generation as well
  const summaryResult = await retry(() => generateText(content, descriptionPrompt, LensType.SUMMARY));
  const visualDescription = summaryResult.text || "A clear educational diagram.";

  // Step 2: Generate the image using the description
  const imagePrompt = `Create a clean, high-quality, modern flat vector style infographic based on this description: ${visualDescription}. Use a professional color palette. White background.`;

  const response = await geminiGenerateContent({
    model: MODELS.IMAGE,
    contents: [{ text: imagePrompt }],
    config: {
        responseModalities: ["image"]
    }
  });

  const images: string[] = [];
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        images.push(part.inlineData.data);
      }
    }
  }

  if (images.length === 0) {
      // Return a text-based error result instead of failing completely, so workflow continues.
      return {
          type: LensType.VISUAL,
          text: `**Visual Generation Note:**\nUnable to generate image. The model may have filtered the request or no visual representation was created.\n\n**Prompt Used:**\n${visualDescription}`,
          images: []
      }
  }

  return {
    type: LensType.VISUAL,
    text: `**Visual Prompt Used:**\n${visualDescription}`,
    images: images
  };
};
