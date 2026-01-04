import { toast } from "sonner";

export type KnowledgeSourceApp = 
  | 'banana-blitz' 
  | 'unravel' 
  | 'serendipity' 
  | 'promptstash' 
  | 'insightlens' 
  | 'component-studio'
  | 'crm'
  | 'assistant';

interface SaveToKnowledgeParams {
  content: string;
  sourceApp: KnowledgeSourceApp;
  sourceType: string;
  sourceId?: string;
  metadata?: Record<string, any>;
  silent?: boolean;
}

/**
 * Saves content to the user's vector knowledge base via the API.
 * This allows the AI Agent to "remember" this content for future context.
 */
export async function saveToKnowledgeBase({ 
  content, 
  sourceApp, 
  sourceType, 
  sourceId, 
  metadata,
  silent = true 
}: SaveToKnowledgeParams) {
  try {
    const response = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        content,
        sourceApp,
        sourceType,
        sourceId,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save to knowledge base');
    }

    if (!silent) {
      toast.success("Saved to Agent Memory");
    }
  } catch (error) {
    console.warn("Knowledge Base Auto-Save Failed:", error);
    // We don't block the UI for this background task, but we log it.
  }
}
