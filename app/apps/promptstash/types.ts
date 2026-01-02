export enum AppStep {
  DRAFT = 'draft',
  ANALYSIS = 'analysis',
  REWRITE = 'rewrite',
  VARIABLES = 'variables'
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number; // The "best" answer conceptually
  explanation: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  questions: QuizQuestion[];
}

export interface VariableDefinition {
  name: string;
  description: string;
  defaultValue: string;
}

export interface VariableResult {
  template: string;
  variables: VariableDefinition[];
}

export interface PromptState {
  originalPrompt: string;
  refinedPrompt: string;
  analysis: AnalysisResult | null;
  variableData: VariableResult | null;
  variableValues: Record<string, string>;
  quizAnswers: Record<number, number>; // questionId -> optionIndex
  isAnalyzing: boolean;
  isRewriting: boolean;
  isExtracting: boolean;
}