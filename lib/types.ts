// Unravel Types
export enum UnravelMode {
  URL = "URL",
  TEXT = "TEXT",
}

export enum OutputFormat {
  BLOG = "BLOG",
  SOCIAL = "SOCIAL",
}

export interface UnravelResponse {
  title: string;
  markdownContent: string;
  summary: string;
  author?: string;
  originalUrl?: string;
}

export type ProcessingStatus = "idle" | "processing" | "success" | "error";

// Database Types
export interface SavedArticle {
  id: string;
  user_id: string;
  title: string;
  content: string;
  summary: string;
  author?: string;
  original_url?: string;
  format: OutputFormat;
  created_at: string;
}

export interface SavedPrompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  refined_content?: string;
  analysis?: any;
  created_at: string;
}

export interface SavedInsight {
  id: string;
  user_id: string;
  title: string;
  content: string;
  lens_type: string;
  created_at: string;
}

export interface SavedImage {
  id: string;
  user_id: string;
  title: string;
  image_url: string;
  prompt: string;
  created_at: string;
}
