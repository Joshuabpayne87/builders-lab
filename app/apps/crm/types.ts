// CRM Type Definitions for The Builder's Lab

// ============================================================================
// Enums and String Literal Types
// ============================================================================

export type ContactType = "LEAD" | "PROSPECT" | "COLLABORATOR" | "PARTNER";
export type ContactStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type ActivityType = "EMAIL" | "CALL" | "MEETING" | "NOTE" | "TASK";
export type DealStatus = "OPEN" | "WON" | "LOST" | "ARCHIVED";
export type DealStage = "QUALIFICATION" | "PROPOSAL" | "NEGOTIATION" | "CLOSED";
export type AutomationType = "EMAIL_DRAFT" | "NEXT_ACTION" | "DEAL_INSIGHT" | "CONTACT_SUMMARY";
export type ViewState = "DASHBOARD" | "CONTACTS" | "CONTACT_DETAIL" | "DEALS";

// ============================================================================
// Core Data Interfaces (matching database schema)
// ============================================================================

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  contact_type: ContactType;
  status: ContactStatus;
  address: string | null;
  website: string | null;
  linkedin_url: string | null;
  notes: string | null;
  tags: string[] | null;
  ai_profile_summary: string | null;
  ai_insights: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  last_contacted_at: string | null;
}

export interface Activity {
  id: string;
  user_id: string;
  contact_id: string;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  ai_summary: string | null;
  ai_next_actions: Record<string, any> | null;
  created_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  contact_id: string;
  title: string;
  description: string | null;
  value: number | null;
  currency: string;
  status: DealStatus;
  stage: DealStage;
  expected_close_date: string | null;
  actual_close_date: string | null;
  ai_probability: number | null;
  ai_insights: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface AIAutomation {
  id: string;
  user_id: string;
  automation_type: AutomationType;
  trigger_event: string | null;
  input_data: Record<string, any> | null;
  output_data: Record<string, any> | null;
  contact_id: string | null;
  deal_id: string | null;
  created_at: string;
}

// ============================================================================
// Extended Interfaces with Relations
// ============================================================================

export interface ContactWithRelations extends Contact {
  activities?: Activity[];
  deals?: Deal[];
  activityCount?: number;
  dealCount?: number;
  totalDealValue?: number;
}

export interface ActivityWithContact extends Activity {
  contact?: Contact;
}

export interface DealWithContact extends Deal {
  contact?: Contact;
}

// ============================================================================
// Filter Interfaces
// ============================================================================

export interface ContactFilters {
  search?: string;
  contact_type?: ContactType[];
  status?: ContactStatus[];
  tags?: string[];
  sortBy?: "name" | "created_at" | "last_contacted_at" | "company";
  sortOrder?: "asc" | "desc";
}

export interface ActivityFilters {
  contact_id?: string;
  activity_type?: ActivityType[];
  completed?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: "created_at" | "due_date";
  sortOrder?: "asc" | "desc";
}

export interface DealFilters {
  contact_id?: string;
  status?: DealStatus[];
  stage?: DealStage[];
  minValue?: number;
  maxValue?: number;
  sortBy?: "created_at" | "value" | "expected_close_date";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Form Data Interfaces
// ============================================================================

export interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  contact_type: ContactType;
  status: ContactStatus;
  address?: string;
  website?: string;
  linkedin_url?: string;
  notes?: string;
  tags?: string[];
}

export interface ActivityFormData {
  contact_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
}

export interface DealFormData {
  contact_id: string;
  title: string;
  description?: string;
  value?: number;
  currency?: string;
  status: DealStatus;
  stage: DealStage;
  expected_close_date?: string;
}

// ============================================================================
// AI Response Interfaces
// ============================================================================

export interface AINextAction {
  action: string;
  priority: "high" | "medium" | "low";
  reasoning: string;
}

export interface AIContactSummary {
  summary: string;
  keyInsights: string[];
  lastInteraction?: string;
}

export interface AIEmailDraft {
  subject: string;
  body: string;
  tone: string;
}

export interface AIDealAnalysis {
  probability: number;
  insights: string[];
  recommendations: string[];
  riskFactors?: string[];
}

// ============================================================================
// UI State Interfaces
// ============================================================================

export interface CRMViewState {
  currentView: ViewState;
  selectedContactId?: string;
  selectedDealId?: string;
  isModalOpen: boolean;
  modalType?: "contact" | "activity" | "deal";
  modalMode?: "create" | "edit";
}

export interface DashboardStats {
  totalContacts: number;
  activeDeals: number;
  pipelineValue: number;
  contactsByType: Record<ContactType, number>;
  dealsByStage: Record<DealStage, number>;
  recentActivities: Activity[];
}

// ============================================================================
// Workflow & Automation Interfaces
// ============================================================================

export type WorkflowTriggerType =
  | "STALE_CONTACT"
  | "DEAL_STAGE_CHANGE"
  | "OVERDUE_TASK"
  | "NEW_CONTACT"
  | "DEAL_WON"
  | "DEAL_LOST";

export type WorkflowActionType =
  | "CREATE_TASK"
  | "SEND_NOTIFICATION"
  | "UPDATE_STATUS"
  | "ADD_TAG";

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  trigger_type: WorkflowTriggerType;
  conditions: Record<string, any> | null;
  actions: WorkflowAction[];
  enabled: boolean;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, any>;
}

export interface WorkflowConditions {
  days_inactive?: number;
  contact_types?: ContactType[];
  deal_stages?: DealStage[];
  min_deal_value?: number;
}

// ============================================================================
// Notification Interfaces
// ============================================================================

export type NotificationType =
  | "REMINDER"
  | "OVERDUE_TASK"
  | "STALE_CONTACT"
  | "DEAL_UPDATE"
  | "WORKFLOW_ACTION"
  | "INSIGHT";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  contact_id: string | null;
  deal_id: string | null;
  activity_id: string | null;
  action_data: Record<string, any> | null;
  read: boolean;
  dismissed: boolean;
  created_at: string;
}

// ============================================================================
// Contact Scoring Interfaces
// ============================================================================

export interface ContactScore {
  id: string;
  user_id: string;
  contact_id: string;
  lead_score: number | null; // 0-100
  engagement_score: number | null; // 0-100
  score_factors: ScoreFactors | null;
  ai_reasoning: string | null;
  recommended_actions: AINextAction[] | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreFactors {
  recency: number; // Points from recent activity
  frequency: number; // Points from activity frequency
  deal_value: number; // Points from associated deal values
  engagement: number; // Points from two-way communication
  company_size?: number; // Points from company size/importance
}

// ============================================================================
// Analytics Interfaces
// ============================================================================

export interface PipelineFunnelData {
  stage: string;
  count: number;
  value: number;
  conversionRate?: number;
}

export interface ActivityHeatmapData {
  date: string;
  count: number;
  dayOfWeek: number;
  hour?: number;
}

export interface RevenueTrendData {
  period: string; // e.g., "2024-01", "2024-Q1"
  pipeline_value: number;
  won_value: number;
  lost_value: number;
}

export interface ContactGrowthData {
  period: string;
  total: number;
  new: number;
  by_type: Record<ContactType, number>;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  winRate: number;
  avgDealSize: number;
  avgSalesCycle: number; // days
  topPerformingType: ContactType;
  mostActiveDay: string;
  insights: string[];
}

// ============================================================================
// Pagination and Loading States
// ============================================================================

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error?: string;
}

export interface CRMDataState<T> extends LoadingState {
  data: T[];
  pagination?: PaginationState;
}
