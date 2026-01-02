export type ContentFormat = 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'newsletter' | 'blog' | 'script';

export interface FileData {
  mimeType: string;
  data: string; // base64 or raw text content
  name?: string;
  isText?: boolean; // Flag to indicate if data is raw text (txt/docx) or base64 (pdf/img)
}

export interface ContentGenerationParams {
  mode: 'topic' | 'source';
  format: ContentFormat;
  topic?: string;
  audience?: string;
  goal?: string;
  frameworkId?: string;
  sourceContext?: string; // URL or text
  fileData?: FileData | null;
  instructions?: string;
}

export interface ImageGenerationOptions {
  aspectRatio?: "1:1" | "16:9" | "4:3" | "3:4" | "9:16";
  style?: "default" | "youtube-thumbnail";
}
