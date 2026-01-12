// Funnel Type Definitions

export type FunnelStage = 'IDEA' | 'STRATEGY' | 'BLUEPRINT' | 'CODE';
export type FunnelStatus = 'draft' | 'published' | 'archived';

export interface Funnel {
  id: string;
  user_id: string;
  name: string;
  domain_slug: string | null;
  current_stage: FunnelStage;
  offer_details: Record<string, unknown> | null;
  html_code: string | null;
  strategy_doc: string | null;
  submission_count: number;
  status: FunnelStatus;
  created_at: string;
  updated_at: string;
}

export interface FunnelFormData {
  name: string;
  domain_slug?: string;
  html_code?: string;
  strategy_doc?: string;
  status?: FunnelStatus;
}

export interface FunnelSubmission {
  funnelId: string;
  name: string;
  email: string;
  phone?: string;
  [key: string]: unknown; // Allow custom fields
}

export interface GenerateCodeRequest {
  strategyDoc: string;
  title: string;
}

export interface GenerateCodeResponse {
  htmlCode: string;
  success: boolean;
}

export interface DeployFunnelRequest {
  funnelId: string;
  slug?: string;
  htmlCode: string;
}

export interface DeployFunnelResponse {
  success: boolean;
  deployedUrl: string;
  slug: string;
}
