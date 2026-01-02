
export enum LensType {
  SUMMARY = 'SUMMARY',
  MINDMAP = 'MINDMAP',
  PODCAST = 'PODCAST',
  OUTLINE = 'OUTLINE',
  SCRIPT = 'SCRIPT',
  VISUAL = 'VISUAL',
  TRANSLATE = 'TRANSLATE',
  QUIZ = 'QUIZ',
  ELI5 = 'ELI5',
  CRITIQUE = 'CRITIQUE',
  SOCIAL = 'SOCIAL'
}

export enum InputMode {
  TEXT = 'TEXT',
  URL = 'URL',
  FILE = 'FILE'
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
  value?: number;
}

export interface TransformationResult {
  type: LensType;
  text?: string;
  audioData?: string; // Base64 audio
  mindMapData?: MindMapNode;
  images?: string[]; // Base64 images
}

export interface LensConfig {
  id: LensType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface LibraryItem {
  id: string;
  timestamp: number;
  lens: LensType;
  title: string; // A snippet or title of the content
  result: TransformationResult;
}

export type ProcessingStatus = 'IDLE' | 'ANALYZING' | 'TRANSFORMING' | 'COMPLETE' | 'ERROR';

// --- WORKFLOW TYPES ---

export type NodeType = 'INPUT' | 'PROCESSOR' | 'OUTPUT';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  subType: string; // e.g., 'TEXT' or 'SUMMARY'
  label: string;
  x: number;
  y: number;
  status: 'IDLE' | 'ACTIVE' | 'COMPLETE' | 'ERROR';
  // Data Payloads
  inputValue?: string; // For Text/URL inputs
  inputFile?: File;    // For File inputs
  output?: TransformationResult; // For Processor results
  errorMessage?: string;
  // Configuration
  config?: {
    customPrompt?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}
