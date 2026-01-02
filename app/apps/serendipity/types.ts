export interface Workflow {
  id: string;
  title: string;
  description: string;
  steps: string[];
  timeSaved: string;
  outputs: string[];
}

export interface ContentFramework {
  id: string;
  label: string;
  description: string;
  icon: any; // Lucide icon name or component
  promptContext: string;
}

export interface ChallengeDay {
  day: number;
  title: string;
  category: 'Foundations' | 'Marketing Systems' | 'Operations' | 'Growth';
}

export interface Hook {
  id: string;
  text: string;
}

export type ContentFormat = 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'newsletter' | 'blog' | 'script';

export interface GeneratedContent {
  id: string;
  workflowId?: string;
  format: ContentFormat;
  content: string;
  timestamp: number;
}

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
  frameworkId?: string; // New field for selected framework
  sourceContext?: string; // URL or text
  fileData?: FileData | null;
  instructions?: string;
}

export interface ResearchReport {
  raw: string;
  // We will parse the raw markdown for the UI
}
