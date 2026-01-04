import { Type, Modality } from "@google/genai";
import { createGeminiClient } from "@/lib/gemini";
import { Category, PromptSet, VisualVibe, AspectRatio, VoiceTone, GroundingSource } from "../types";

class BananaBlitzService {
  private getVibeDescription(vibe: VisualVibe): string {
    const descriptions: Record<string, string> = {
      'Kawaii Pastel': 'Soft, rounded edges, pastel color palette, cute characters, bubbly typography, Sanrio-inspired aesthetic.',
      'Bauhaus Grid': 'Mathematical precision, primary colors (red, blue, yellow), thick black lines, geometric shapes, functional grid layouts.',
      'Brutalist Raw': 'Raw concrete textures, exposed grid lines, high-contrast typography, unapologetic and bold, industrial feel.',
      'Studio Photography': 'Ultra-realistic 8k resolution, professional softbox lighting, shallow depth of field, premium product photography look.',
      'Lo-Fi Chill': 'Grainy film texture, muted nostalgic colors, cozy indoor lighting, aesthetic VHS artifacts, relaxed vibe.',
      'Hyper-Realistic 3D': 'Glossy textures, subsurface scattering, volumetric lighting, Apple-style premium 3D renders, clean glass and metal.',
      'Vintage Collage': 'Mixed media, paper grain, ripped edges, vintage newsprint textures, layered elements, analog "zine" feel.',
      'Surreal Dreamscape': 'Magical realism, floating objects, ethereal lighting, impossible physics, dream-like atmosphere, artistic and high-concept.',
      'Cyberpunk': 'Neon lights, rainy streets, high-tech low-life, glow effects, futuristic UI elements.',
      'Minimalist': 'Maximum negative space, clean sans-serif typography, single accent color, sophisticated simplicity.',
      '90s Analog': 'CRT monitor scanlines, dithered gradients, early internet icons, pixelated edges, retro-tech vibe.',
      'Corporate Sleek': 'Professional, clean, modern design with corporate aesthetics.',
      'Bold Pop-Art': 'Vibrant colors, bold outlines, comic book style, high contrast.',
      'Dark Mode Luxury': 'Premium dark backgrounds, elegant gold/silver accents, sophisticated luxury aesthetic.'
    };
    return descriptions[vibe] || vibe;
  }

  private async saveToMemory(content: string, type: string, metadata: any) {
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          content,
          sourceApp: 'banana-blitz',
          sourceType: type,
          metadata
        })
      });
    } catch (e) {
      console.error("Failed to save to knowledge base", e);
    }
  }

  async generatePrompts(
    postText: string,
    vibe: VisualVibe,
    ratio: AspectRatio,
    tone: VoiceTone,
    refImage?: string | null
  ): Promise<{ promptSets: PromptSet[], captions: { platform: string; text: string }[], sources: GroundingSource[] }> {
    const ai = createGeminiClient();
    const vibeDesc = this.getVibeDescription(vibe);

    const systemInstruction = `You are a world-class social media strategist and visual designer.
    TASK: Turn the provided text into a high-impact social media campaign.
    1. Use Google Search for the latest trends/data.
    2. Generate 3 specific visual prompts for EVERY one of these 5 categories:
       - "Scroll Stopper Cover"
       - "Infographic"
       - "Quote Graphic"
       - "Diagram / Framework"
       - "Carousel Cover"
    3. Generate 3 captions (LinkedIn, Instagram, Twitter) in the tone: "${tone}".

    VISUAL STYLE: "${vibe}" (${vibeDesc}).
    ${refImage ? "INCORPORATE STYLE: Strictly follow the characters and style of the attached reference image." : ""}

    CRITICAL: Output valid JSON matching the provided schema.`;

    const parts: any[] = [{ text: `POST CONTENT: ${postText}` }];
    if (refImage) {
      parts.push({
        inlineData: {
          data: refImage.split(',')[1],
          mimeType: refImage.split(';')[0].split(':')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: { parts },
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            promptSets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, enum: Object.values(Category) },
                  prompts: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["category", "prompts"]
              }
            },
            captions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["platform", "text"]
              }
            }
          },
          required: ["promptSets", "captions"]
        }
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.title && web.uri)
      .map((web: any) => ({ title: web.title, uri: web.uri })) || [];

    try {
      const result = JSON.parse(response.text || '{"promptSets":[], "captions":[]}');
      
      // Save the generated strategy to knowledge base
      const strategySummary = `Campaign Strategy for "${postText.substring(0, 50)}...": Generated ${result.captions.length} captions and ${result.promptSets.length} visual prompt sets. Vibe: ${vibe}, Tone: ${tone}.`;
      this.saveToMemory(strategySummary, 'campaign_strategy', { vibe, tone, full_captions: result.captions });

      return {
        promptSets: result.promptSets || [],
        captions: result.captions || [],
        sources
      };
    } catch (e) {
      throw new Error("Failed to decode design strategy.");
    }
  }

  async generateImage(prompt: string, ratio: AspectRatio, refImage?: string | null): Promise<string> {
    const ai = createGeminiClient();
    const contents: any[] = [{ text: `Social Media Graphic: ${prompt}. Professional, high-fidelity, 8k.` }];
    if (refImage) {
      contents.push({
        inlineData: {
          data: refImage.split(',')[1],
          mimeType: refImage.split(';')[0].split(':')[1]
        }
      });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: { parts: contents },
      config: {
        responseModalities: ["image"],
        imageConfig: { aspectRatio: ratio }
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Image engine failed to render.");
  }

  async generateCarouselStrategy(coverImageUrl: string, postText: string): Promise<string[]> {
    const ai = createGeminiClient();
    const [header, base64] = coverImageUrl.split(',');
    const mimeType = header.split(';')[0].split(':')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: `Based on the provided COVER and this POST: "${postText}", create an elite 7-slide educational carousel strategy. Output ONLY a JSON array of 7 distinct prompt strings.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }

  async generatePodcastAudio(postText: string): Promise<string> {
    const ai = createGeminiClient();
    const prompt = `Create a high-energy podcast dialogue between Joe and Jane discussing this topic: "${postText}".
    Joe is the curious host, Jane is the deep expert. Make it insightful and conversational.
    Format the output as a literal script like:
    Joe: [content]
    Jane: [content]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
              { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
            ]
          }
        }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  }
}

export const bananaBlitzService = new BananaBlitzService();
