// CRM Constants and Enums for The Builder's Lab

import type {
  ContactType,
  ContactStatus,
  ActivityType,
  DealStatus,
  DealStage,
  AutomationType,
} from "./types";

// ============================================================================
// Contact Type Options
// ============================================================================

export const CONTACT_TYPES: { value: ContactType; label: string; description: string }[] = [
  {
    value: "LEAD",
    label: "Lead",
    description: "Potential client showing initial interest",
  },
  {
    value: "PROSPECT",
    label: "Prospect",
    description: "Qualified lead actively considering services",
  },
  {
    value: "COLLABORATOR",
    label: "Collaborator",
    description: "Partner working on joint projects",
  },
  {
    value: "PARTNER",
    label: "Partner",
    description: "Long-term strategic partner",
  },
];

export const CONTACT_TYPE_COLORS: Record<ContactType, string> = {
  LEAD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROSPECT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COLLABORATOR: "bg-green-500/10 text-green-400 border-green-500/20",
  PARTNER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

// ============================================================================
// Contact Status Options
// ============================================================================

export const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

export const CONTACT_STATUS_COLORS: Record<ContactStatus, string> = {
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  INACTIVE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  ARCHIVED: "bg-red-500/10 text-red-400 border-red-500/20",
};

// ============================================================================
// Activity Type Options
// ============================================================================

export const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: string }[] = [
  { value: "EMAIL", label: "Email", icon: "Mail" },
  { value: "CALL", label: "Call", icon: "Phone" },
  { value: "MEETING", label: "Meeting", icon: "Calendar" },
  { value: "NOTE", label: "Note", icon: "FileText" },
  { value: "TASK", label: "Task", icon: "CheckSquare" },
];

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  EMAIL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CALL: "bg-green-500/10 text-green-400 border-green-500/20",
  MEETING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  NOTE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  TASK: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

// ============================================================================
// Deal Status Options
// ============================================================================

export const DEAL_STATUSES: { value: DealStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "ARCHIVED", label: "Archived" },
];

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  WON: "bg-green-500/10 text-green-400 border-green-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// ============================================================================
// Deal Stage Options
// ============================================================================

export const DEAL_STAGES: { value: DealStage; label: string; description: string }[] = [
  {
    value: "QUALIFICATION",
    label: "Qualification",
    description: "Assessing fit and requirements",
  },
  {
    value: "PROPOSAL",
    label: "Proposal",
    description: "Preparing and presenting proposal",
  },
  {
    value: "NEGOTIATION",
    label: "Negotiation",
    description: "Discussing terms and pricing",
  },
  {
    value: "CLOSED",
    label: "Closed",
    description: "Deal finalized (won or lost)",
  },
];

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  QUALIFICATION: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROPOSAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  NEGOTIATION: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CLOSED: "bg-green-500/10 text-green-400 border-green-500/20",
};

// ============================================================================
// AI Automation Options
// ============================================================================

export const AUTOMATION_TYPES: { value: AutomationType; label: string; description: string }[] = [
  {
    value: "CONTACT_SUMMARY",
    label: "Contact Summary",
    description: "Generate AI-powered contact profile summary",
  },
  {
    value: "NEXT_ACTION",
    label: "Next Actions",
    description: "Suggest recommended next steps",
  },
  {
    value: "EMAIL_DRAFT",
    label: "Email Draft",
    description: "Generate contextual email draft",
  },
  {
    value: "DEAL_INSIGHT",
    label: "Deal Insights",
    description: "Analyze deal health and probability",
  },
];

// ============================================================================
// Priority Levels
// ============================================================================

export const PRIORITY_LEVELS = {
  high: {
    label: "High",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  medium: {
    label: "Medium",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  low: {
    label: "Low",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
};

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_CONTACT_TYPE: ContactType = "LEAD";
export const DEFAULT_CONTACT_STATUS: ContactStatus = "ACTIVE";
export const DEFAULT_DEAL_STATUS: DealStatus = "OPEN";
export const DEFAULT_DEAL_STAGE: DealStage = "QUALIFICATION";
export const DEFAULT_CURRENCY = "USD";

// ============================================================================
// Pagination Constants
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================================================
// Sort Options
// ============================================================================

export const CONTACT_SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "created_at", label: "Created Date" },
  { value: "last_contacted_at", label: "Last Contact" },
  { value: "company", label: "Company" },
];

export const ACTIVITY_SORT_OPTIONS = [
  { value: "created_at", label: "Created Date" },
  { value: "due_date", label: "Due Date" },
];

export const DEAL_SORT_OPTIONS = [
  { value: "created_at", label: "Created Date" },
  { value: "value", label: "Value" },
  { value: "expected_close_date", label: "Expected Close" },
];

// ============================================================================
// UI Constants
// ============================================================================

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
};

export const DATE_FORMAT = "MMM dd, yyyy";
export const DATETIME_FORMAT = "MMM dd, yyyy HH:mm";

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
  URL_REGEX: /^https?:\/\/.+/,
  MIN_DEAL_VALUE: 0,
  MAX_DEAL_VALUE: 999999999.99,
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getContactTypeLabel(type: ContactType): string {
  return CONTACT_TYPES.find((t) => t.value === type)?.label || type;
}

export function getContactTypeColor(type: ContactType): string {
  return CONTACT_TYPE_COLORS[type] || "bg-slate-500/10 text-slate-400";
}

export function getContactStatusColor(status: ContactStatus): string {
  return CONTACT_STATUS_COLORS[status] || "bg-slate-500/10 text-slate-400";
}

export function getActivityTypeLabel(type: ActivityType): string {
  return ACTIVITY_TYPES.find((t) => t.value === type)?.label || type;
}

export function getActivityTypeColor(type: ActivityType): string {
  return ACTIVITY_TYPE_COLORS[type] || "bg-slate-500/10 text-slate-400";
}

export function getDealStatusColor(status: DealStatus): string {
  return DEAL_STATUS_COLORS[status] || "bg-slate-500/10 text-slate-400";
}

export function getDealStageColor(stage: DealStage): string {
  return DEAL_STAGE_COLORS[stage] || "bg-slate-500/10 text-slate-400";
}

export function formatCurrency(value: number, currency: string = DEFAULT_CURRENCY): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDealValue(deal: { value: number | null; currency: string }): string {
  if (deal.value === null) return "N/A";
  return formatCurrency(deal.value, deal.currency);
}
