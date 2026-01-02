
export enum Category {
  SCROLL_STOPPER = 'Scroll Stopper Cover',
  INFOGRAPHIC = 'Infographic',
  QUOTE_GRAPHIC = 'Quote Graphic',
  DIAGRAM = 'Diagram / Framework',
  CAROUSEL_COVER = 'Carousel Cover',
  CAROUSEL_SLIDE = 'Carousel Slide'
}

export type MusicStyle = 'None' | 'Midnight' | 'Peak' | 'Corporate' | 'Ambient';

export type VisualVibe =
  | 'Cyberpunk'
  | 'Minimalist'
  | '90s Analog'
  | 'Corporate Sleek'
  | 'Bold Pop-Art'
  | 'Dark Mode Luxury'
  | 'Kawaii Pastel'
  | 'Bauhaus Grid'
  | 'Brutalist Raw'
  | 'Studio Photography'
  | 'Lo-Fi Chill'
  | 'Hyper-Realistic 3D'
  | 'Vintage Collage'
  | 'Surreal Dreamscape';

export type AspectRatio = '1:1' | '9:16';
export type VoiceTone =
  | 'Professional'
  | 'Hype'
  | 'Sarcastic'
  | 'Empathetic'
  | 'Minimalist'
  | 'Educational'
  | 'Witty'
  | 'Mysterious'
  | 'Direct'
  | 'Luxury'
  | 'Aggressive'
  | 'Storyteller';

export interface PromptSet {
  category: Category;
  prompts: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  videoUrl?: string;
  category: Category;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'error' | 'video-generating';
  aspectRatio: AspectRatio;
  parentId?: string;
  order?: number;
}

export interface Campaign {
  id: string;
  timestamp: number;
  postText: string;
  images: GeneratedImage[];
  captions: { platform: string; text: string }[];
  vibe: VisualVibe;
  sources: GroundingSource[];
  audioUrl?: string;
  producedVideoUrl?: string;
  producedReelUrl?: string;
}

export interface AppState {
  isGenerating: boolean;
  isExpanding: boolean;
  isGeneratingPodcast: boolean;
  postText: string;
  selectedVibe: VisualVibe;
  selectedRatio: AspectRatio;
  selectedTone: VoiceTone;
  selectedMusic: MusicStyle;
  referenceImage: string | null;
  images: GeneratedImage[];
  captions: { platform: string; text: string }[];
  sources: GroundingSource[];
  history: Campaign[];
  error: string | null;
  progress: number;
  currentAudioUrl: string | null;
}
