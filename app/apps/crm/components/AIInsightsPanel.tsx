"use client";

import { useState } from "react";
import { Sparkles, Mail, TrendingUp, Lightbulb, Loader2 } from "lucide-react";
import type { Contact, Activity, Deal, AIContactSummary, AINextAction, AIEmailDraft } from "../types";

interface AIInsightsPanelProps {
  contact: Contact;
  activities: Activity[];
  deals: Deal[];
  onGenerateSummary?: () => Promise<AIContactSummary | null>;
  onGenerateActions?: () => Promise<AINextAction[]>;
  onDraftEmail?: (purpose: string) => Promise<AIEmailDraft | null>;
}

export function AIInsightsPanel({
  contact,
  activities,
  deals,
  onGenerateSummary,
  onGenerateActions,
  onDraftEmail,
}: AIInsightsPanelProps) {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  const [summary, setSummary] = useState<AIContactSummary | null>(
    contact.ai_profile_summary ? { summary: contact.ai_profile_summary, keyInsights: [] } : null
  );
  const [nextActions, setNextActions] = useState<AINextAction[]>([]);
  const [emailDraft, setEmailDraft] = useState<AIEmailDraft | null>(null);
  const [emailPurpose, setEmailPurpose] = useState("");

  const handleGenerateSummary = async () => {
    if (!onGenerateSummary) return;

    setIsLoadingSummary(true);
    try {
      const result = await onGenerateSummary();
      setSummary(result);
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleGenerateActions = async () => {
    if (!onGenerateActions) return;

    setIsLoadingActions(true);
    try {
      const result = await onGenerateActions();
      setNextActions(result);
    } catch (error) {
      console.error("Failed to generate actions:", error);
    } finally {
      setIsLoadingActions(false);
    }
  };

  const handleDraftEmail = async () => {
    if (!onDraftEmail || !emailPurpose) return;

    setIsLoadingEmail(true);
    try {
      const result = await onDraftEmail(emailPurpose);
      setEmailDraft(result);
    } catch (error) {
      console.error("Failed to draft email:", error);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const priorityColors = {
    high: "bg-red-500/10 text-red-400 border-red-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">AI Insights</h3>
      </div>

      {/* Contact Summary */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Profile Summary</h4>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={isLoadingSummary}
            className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingSummary ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                {summary ? "Regenerate" : "Generate"}
              </>
            )}
          </button>
        </div>

        {summary ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed">{summary.summary}</p>
            {summary.keyInsights && summary.keyInsights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">Key Insights:</p>
                <ul className="space-y-1">
                  {summary.keyInsights.map((insight, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-600">
            Generate an AI-powered summary of this contact's profile and relationship.
          </p>
        )}
      </div>

      {/* Next Actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-semibold text-white">Suggested Next Actions</h4>
          </div>
          <button
            onClick={handleGenerateActions}
            disabled={isLoadingActions}
            className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingActions ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                {nextActions.length > 0 ? "Refresh" : "Generate"}
              </>
            )}
          </button>
        </div>

        {nextActions.length > 0 ? (
          <div className="space-y-2">
            {nextActions.map((action, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-white font-medium flex-1">{action.action}</p>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-md ${
                      priorityColors[action.priority]
                    }`}
                  >
                    {action.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{action.reasoning}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600">
            Get AI-powered suggestions for your next steps with this contact.
          </p>
        )}
      </div>

      {/* Email Draft */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">Email Draft Generator</h4>
        </div>

        {!emailDraft ? (
          <div className="space-y-3">
            <input
              type="text"
              value={emailPurpose}
              onChange={(e) => setEmailPurpose(e.target.value)}
              placeholder="What's the purpose of this email?"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20"
            />
            <button
              onClick={handleDraftEmail}
              disabled={isLoadingEmail || !emailPurpose}
              className="w-full px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoadingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Drafting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Draft Email
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Subject:</p>
              <p className="text-sm text-white font-medium">{emailDraft.subject}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Body:</p>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {emailDraft.body}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`);
                }}
                className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setEmailDraft(null)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
              >
                New Draft
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
