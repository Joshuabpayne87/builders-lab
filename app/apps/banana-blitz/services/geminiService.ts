import { Type } from "@google/genai";
import { geminiGenerateContent } from "@/lib/gemini-http";
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

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries = 7, initialDelay = 1000): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        const msg = error.message?.toLowerCase() || '';
        // Check for rate limit (429), quota exhaustion, or server errors (5xx)
        const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('exhausted');
        const isServerError = error.status === 429 || (error.status >= 500 && error.status < 600) || msg.includes('503') || msg.includes('500');

        if (isRateLimit || isServerError) {
          const delay = initialDelay * Math.pow(2, i); // Exponential backoff
          console.log(`API Busy/Limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        // If it's not a transient error, throw immediately
        throw error;
      }
    }
    throw lastError;
  }

  async generatePrompts(
    postText: string,
    vibe: VisualVibe,
    ratio: AspectRatio,
    tone: VoiceTone,
    refImage?: string | null
  ): Promise<{ promptSets: PromptSet[], captions: { platform: string; text: string }[], sources: GroundingSource[] }> {
    const vibeDesc = this.getVibeDescription(vibe);

    const systemInstruction = `You are a world-class social media strategist and visual designer.
    TASK: Turn the provided text into a high-impact social media campaign.
    1. Generate visual prompts for these categories:
       - "Scroll Stopper Cover" - 3 specific prompts
       - "Infographic" - 3 specific prompts
       - "Quote Graphic" - 3 specific prompts
       - "Diagram / Framework" - 3 specific prompts
       - "Carousel Cover" - 1 specific prompt (Master Carousel)
    2. Generate 3 captions (LinkedIn, Instagram, Twitter) in the tone: "${tone}".

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

    const response = await this.retryOperation(() => geminiGenerateContent({
      model: 'gemini-2.0-flash-exp',
      contents: parts, // Standard format
      config: {
        systemInstruction,
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
    }));

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
    // CRITICAL: Google deprecated image generation from Gemini models
    // Using dynamic gradient placeholders until external image service is integrated

    console.warn('[Banana Blitz] Image generation temporarily using placeholders - Gemini API changed');

    // Generate a unique gradient based on the prompt
    const hash = this.hashString(prompt);
    const color1 = this.generateColorFromHash(hash, 0);
    const color2 = this.generateColorFromHash(hash, 1);
    const color3 = this.generateColorFromHash(hash, 2);

    const width = ratio === '9:16' ? 1080 : 1080;
    const height = ratio === '9:16' ? 1920 : 1080;

    // Extract key words from prompt for visual representation
    const words = prompt.split(' ').filter(w => w.length > 4).slice(0, 3);

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${color2};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color3};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="5%" y="5%" width="90%" height="90%" fill="rgba(0,0,0,0.3)" rx="20"/>
      <text x="50%" y="45%" text-anchor="middle" fill="#fff" font-size="48" font-family="Arial Black, sans-serif" font-weight="bold">
        ${words[0] || 'BANANA'}
      </text>
      <text x="50%" y="52%" text-anchor="middle" fill="#fff" font-size="36" font-family="Arial, sans-serif">
        ${words[1] || 'BLITZ'}
      </text>
      <text x="50%" y="58%" text-anchor="middle" fill="#fff" font-size="24" font-family="Arial, sans-serif" opacity="0.8">
        ${words[2] || 'PRO'}
      </text>
      <text x="50%" y="90%" text-anchor="middle" fill="#fff" font-size="16" font-family="Arial, sans-serif" opacity="0.6">
        Dynamic Placeholder · Integrate DALL-E or Midjourney API
      </text>
    </svg>`;

    if (typeof btoa !== 'undefined') {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private generateColorFromHash(hash: number, seed: number): string {
    const h = ((hash + seed * 137) % 360);
    const s = 70 + (hash % 20);
    const l = 50 + (hash % 15);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  async generateCarouselStrategy(coverImageUrl: string, postText: string, vibe: VisualVibe): Promise<string[]> {
    const [header, base64] = coverImageUrl.split(',');
    const mimeType = header.split(';')[0].split(':')[1];
    const vibeDesc = this.getVibeDescription(vibe);

    const response = await this.retryOperation(() => geminiGenerateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        { inlineData: { data: base64, mimeType } },
        { text: `Based on the provided COVER and this POST: "${postText}", create an elite 7-slide educational carousel strategy.

        CAROUSEL STRUCTURE:
        - Slide 1: Hook/intro slide that sets up the content (e.g., "Here are 6 ways to learn anything fast")
        - Slides 2-7: Each slide presents ONE specific point/way/step/tip from the content

        EXAMPLE for "6 ways to learn anything fast with NotebookLM":
        1. "Discover 6 powerful ways to accelerate your learning with NotebookLM"
        2. "Way #1: Use AI-powered summaries to extract key concepts instantly"
        3. "Way #2: Create interactive study guides from your notes"
        4. "Way #3: Generate practice questions to test your understanding"
        5. "Way #4: Build mind maps to visualize connections between ideas"
        6. "Way #5: Convert documents into audio podcasts for learning on-the-go"
        7. "Way #6: Leverage smart search to find information across all your notes"

        YOUR TASK:
        1. Break down "${postText}" into 6-7 actionable steps/tips/ways
        2. Create visual prompts for each slide that clearly communicate ONE idea per slide
        3. Number each point (Way #1, Step #1, Tip #1, etc.) for clarity
        4. Make each slide self-contained and easy to understand

        VISUAL CONSISTENCY: Maintain the visual style "${vibe}" (${vibeDesc}) throughout ALL slides. Each prompt must incorporate these visual elements to ensure brand consistency.

        Output ONLY a JSON array of 7 distinct prompt strings following the structure above.` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    }));
    return JSON.parse(response.text || "[]");
  }
}

export const bananaBlitzService = new BananaBlitzService();
