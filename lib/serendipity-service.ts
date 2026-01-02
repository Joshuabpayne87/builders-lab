import { createGeminiClient } from "./gemini";
import { ContentGenerationParams, ImageGenerationOptions } from "./serendipity-types";
import { CONTENT_FRAMEWORKS } from "./serendipity-constants";

/**
 * Generates text content based on dynamic inputs (Topic vs Source).
 */
export async function generateCustomContent(params: ContentGenerationParams) {
  const ai = createGeminiClient();

  const modelName = "gemini-2.5-flash";

  let promptText = "";
  let formatInstructions = "";

  switch (params.format) {
    case 'instagram':
      formatInstructions = "Create an engaging Instagram caption with a strong hook, value-packed body, and call-to-action. Suggest visual concepts for the image/carousel.";
      break;
    case 'tiktok':
      formatInstructions = "Write a viral 60-second TikTok script. Include visual cues [Visual] and spoken audio [Audio]. Focus on a fast pace and retention.";
      break;
    case 'blog':
      formatInstructions = "Write a comprehensive SEO-optimized blog post (800+ words). Include H2/H3 headers, bullet points, and a conclusion.";
      break;
    case 'linkedin':
      formatInstructions = "Write a high-engagement LinkedIn personal brand post. Use short, punchy lines.";
      break;
    case 'twitter':
      formatInstructions = "Write a Twitter/X thread (5-7 tweets) or a long-form tweet. Focus on density of information.";
      break;
    case 'newsletter':
      formatInstructions = "Write a personal newsletter email. Subject line + Body. Conversational and valuable.";
      break;
    case 'script':
      formatInstructions = "Write a video script with spoken word and visual directions.";
      break;
  }

  if (params.mode === 'topic') {
    const framework = CONTENT_FRAMEWORKS.find(f => f.id === params.frameworkId);
    const frameworkInstruction = framework ? framework.promptContext : "Structure: High value, engaging, actionable.";

    promptText = `
      You are an elite content strategist and ghostwriter.

      TASK: Create a high-performing piece of content for ${params.format}.

      FRAMEWORK TO USE: ${framework ? framework.label : 'General Educational'}
      FRAMEWORK INSTRUCTIONS: ${frameworkInstruction}
      FORMAT INSTRUCTIONS: ${formatInstructions}

      STRATEGY INPUTS:
      - Core Topic: ${params.topic}
      - Target Audience: ${params.audience || 'General business audience'}
      - Key Goal/Pain Point: ${params.goal || 'Educational value'}

      INSTRUCTIONS:
      Write a ${params.format} post that strictly follows the FRAMEWORK INSTRUCTIONS above.
      - Hook: Start with a scroll-stopping first line matching the framework style.
      - Tone: Professional yet conversational and authoritative.
    `;
  } else {
    promptText = `
      You are an expert content repurposing AI.

      TASK: Analyze the provided source material and transform it into a ${params.format} post.

      USER INSTRUCTIONS: ${params.instructions || 'Summarize the key insights and make it actionable.'}
      FORMAT INSTRUCTIONS: ${formatInstructions}

      SOURCE CONTEXT (URL/Text): ${params.sourceContext || 'See attached file.'}

      STYLE GUIDE:
      - Format: ${params.format}
      - Focus: Extract the most valuable insights.
      - Formatting: Use clean formatting, emojis where appropriate for the platform, and clear section breaks.
    `;
  }

  const parts: any[] = [{ text: promptText }];

  if (params.fileData) {
    if (params.fileData.isText) {
      parts.push({
        text: `\n\n[ATTACHED DOCUMENT: ${params.fileData.name}]\n${params.fileData.data}`
      });
    } else {
      parts.push({
        inlineData: {
          mimeType: params.fileData.mimeType,
          data: params.fileData.data
        }
      });
    }
  }

  const isUrl = params.sourceContext?.toLowerCase().includes('http');
  const tools = isUrl ? [{ googleSearch: {} }] : [];

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        temperature: 0.7,
        tools: tools,
      }
    });

    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error (Content):", error);
    throw error;
  }
}

/**
 * Conducts deep market research using Google Search grounding.
 */
export async function generateMarketResearch(topic: string) {
  const ai = createGeminiClient();

  const prompt = `
    You are a world-class Market Intelligence Analyst.

    TASK: Conduct a deep dive market analysis on the following topic/business idea: "${topic}".

    ACTION: Use Google Search to find real-time data, current trends, forum discussions (Reddit/Quora), and competitor angles.

    OUTPUT: Produce a comprehensive strategic report with the following sections. USE THESE EXACT HEADERS:

    ## 1. Ideal Customer Profile (ICP)
    Describe the specific avatar. Demographics, Psychographics (fears, desires), Job Titles, and where they hang out online.

    ## 2. SEO & Keyword Intelligence
    List 5-10 high-value keywords and long-tail search queries people are actually using right now. Include search intent (Informational vs Commercial).

    ## 3. Core Pain Points
    What are the specific struggles or "bleeding neck" problems in this niche? What are people complaining about in reviews or forums?

    ## 4. Market Opportunities
    Where is the "Blue Ocean"? What angle is the competition missing? What is the unique selling proposition opportunity?

    ## 5. Content Strategy
    Suggest 5 specific content pillars or hooks that would resonate deeply with this audience based on the research.

    ## 6. App Ideas & AI Studio Prompts
    Based on the identified pain points, suggest 3 specific AI Apps or Tools that could solve them.
    For each idea provide:
    - **App Concept**: Name & One-line pitch.
    - **System Instruction**: The exact prompt to paste into Google AI Studio's "System Instructions" box to create this tool.

    FORMAT: Clean Markdown. Use bullet points for readability. Be specific, not generic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return response.text || "No research generated.";
  } catch (error) {
    console.error("Gemini API Error (Research):", error);
    throw error;
  }
}

/**
 * Generates an image to accompany the post.
 */
export async function generatePostImage(
  postContent: string,
  options?: ImageGenerationOptions,
  referenceImageBase64?: string
) {
  const ai = createGeminiClient();

  const isThumbnail = options?.style === 'youtube-thumbnail' || options?.aspectRatio === '16:9';

  let promptInstruction = "";

  if (isThumbnail) {
    if (referenceImageBase64) {
      promptInstruction = `
      You are an expert AI Prompt Engineer for image generation.

      GOAL: Write a prompt for a VIRAL YOUTUBE THUMBNAIL that uses a user-provided Reference Image.

      INPUT CONTEXT (Video Topic/Script):
      ${postContent.substring(0, 3000)}

      INSTRUCTIONS FOR THE PROMPT:
      1. **Subject Isolation**: Explicitly state: "Using the person from the reference image, generate a photorealistic thumbnail. Maintain their exact facial features and likeness."
      2. **Background Removal**: Explicitly state: "COMPLETELY IGNORE/REMOVE the original background of the reference image. Isolate the subject."
      3. **New Context**: Describe a new, high-impact 3D background relevant to the Video Topic.
      4. **Viral Style**: "MrBeast Style. High Saturation. Neon Rim Lighting (Cyan/Magenta). 8K Resolution. Hyper-detailed."
      5. **Text Overlay**: "Include large, 3D BOLD TEXT in the background that says a short 2-3 word hook relevant to the topic."

      OUTPUT: Return ONLY the raw prompt string for the image generator.
      `;
    } else {
      promptInstruction = `You are a world-class YouTube Thumbnail Designer known for high-CTR viral thumbnails.

      TASK: Write a precise image generation prompt for a viral YouTube thumbnail based on this context:
      CONTEXT: ${postContent.substring(0, 3000)}

      CRITICAL STYLE GUIDELINES (Mimic "MrBeast" or top tech channel styles):
      1. **Hyper-Expressive Subject**: A person with an EXTREME emotion (Shock, Joy, Pointing). Close-up.
      2. **Vibrant & High Contrast**: Use neon palette accents. Bright Yellow (#FFFF00), Lime Green (#39FF14).
      3. **Lighting & Glow**: Strong rim lighting on the subject.
      4. **Dynamic Composition**: Subject on one side, empty space for graphics.
      5. **Graphic Elements**: 3D rendered arrows, floating icons, money bags.
      6. **Aesthetic**: High-fidelity 3D render OR 8K hyper-realistic photography.

      Return ONLY the raw prompt string.`;
    }
  } else {
    promptInstruction = `Create a precise image generation prompt for a digital illustration that directly visualizes the concepts in the following text.

    CRITICAL INSTRUCTION: The image MUST be strictly relevant to the specific subject matter discussed.
    - Identify the core noun or process in the text (e.g., "Database", "Sales Funnel", "Robot").
    - Create a visual metaphor that represents this concept.

    TEXT CONTENT: ${postContent.substring(0, 2000)}

    Style constraints:
    - High-tech, clean, modern aesthetic.
    - Isometric 3D or flat vector art style.
    - NO text in the image.
    - Deep blues, violets, and cyans.

    Return ONLY the prompt string.`;
  }

  try {
    const promptResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptInstruction
    });

    const imagePrompt = promptResponse.text || "Modern abstract digital art representing business growth and automation";

    const parts: any[] = [{ text: imagePrompt }];

    if (referenceImageBase64) {
      parts.unshift({
        inlineData: {
          data: referenceImageBase64,
          mimeType: 'image/png'
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: options?.aspectRatio || "1:1",
        }
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates in response");
    }
    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("No content parts in candidate");
    }
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error (Image):", error);
    throw error;
  }
}

/**
 * Generates an image directly from a prompt.
 */
export async function generateImage(prompt: string, aspectRatio: "16:9" | "1:1" | "4:3" | "9:16" = "16:9") {
  const ai = createGeminiClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates in response");
    }
    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("No content parts in candidate");
    }
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error (Generate Image):", error);
    throw error;
  }
}

/**
 * Edits an existing image based on a prompt or visual cues.
 */
export async function editImageWithPrompt(prompt: string, imageBase64: string) {
  const ai = createGeminiClient();

  const visualCuePrompt = `
    Analyze the image provided.
    1. READ ANY TEXT written on the canvas. The text represents the subject matter of the image.
    2. Turn the drawing into a HYPER-REALISTIC, 8K RESOLUTION PHOTOGRAPH based on the text and the sketch.
    3. If there is no text, interpret the drawing literally as a physical object.

    Style: Photorealistic, Cinematic Lighting, 8K, Highly Detailed.

    Do not change the composition. Keep the objects where they are. Just make them real.
  `;

  const effectivePrompt = prompt && prompt.trim().length > 0
    ? prompt
    : visualCuePrompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/png'
            }
          },
          { text: effectivePrompt }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9"
        }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates in response");
    }
    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("No content parts in candidate");
    }
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error (Edit Image):", error);
    throw error;
  }
}

/**
 * Generates hooks for viral social media content.
 */
export async function generateHooks(existingHooks: string[], topic?: string) {
  const ai = createGeminiClient();

  const topicInstruction = topic && topic.trim().length > 0
    ? `FOCUS TOPIC: All generated hooks must be specifically about "${topic}".`
    : "FOCUS TOPIC: General business, AI, and automation growth strategies.";

  const prompt = `
    I have a list of viral hooks for social media videos to use as style references.

    STYLE REFERENCES (Tone/Structure only):
    ${existingHooks.slice(0, 5).map(h => `- "${h}"`).join('\n')}

    TASK: Generate 10 NEW, unique hooks in this exact style.
    ${topicInstruction}

    CONSTRAINTS:
    - Short, punchy, curiosity-inducing.
    - No numbering, just one hook per line.
    - Do not use hashtags.
    - If the topic is specific, use specific keywords from that industry.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });
  return response.text || "";
}
