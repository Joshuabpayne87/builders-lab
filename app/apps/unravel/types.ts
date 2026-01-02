export enum UnravelMode {
  URL = 'URL',
  TEXT = 'TEXT'
}

export enum OutputFormat {
  BLOG = 'BLOG',
  SOCIAL = 'SOCIAL'
}

export interface UnravelResponse {
  title: string;
  markdownContent: string;
  summary: string;
  author?: string;
  originalUrl?: string;
}

export interface UnravelError {
  message: string;
  code?: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface SavedItem extends UnravelResponse {
  id: string;
  timestamp: number;
  format: OutputFormat;
}