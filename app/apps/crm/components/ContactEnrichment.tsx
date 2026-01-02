"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import type { Contact, ContactScore } from "../types";
import {
  calculateContactScoreAction,
  findDuplicatesAction,
} from "../actions/enrichmentActions";

interface ContactEnrichmentProps {
  contact: Contact;
  initialScore?: ContactScore | null;
}

export function ContactEnrichment({ contact, initialScore }: ContactEnrichmentProps) {
  const [score, setScore] = useState<ContactScore | null>(initialScore || null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [duplicates, setDuplicates] = useState<{ contacts: Contact[]; similarity: number[] } | null>(
    null
  );
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const handleCalculateScore = async () => {
    setIsCalculating(true);
    const result = await calculateContactScoreAction(contact.id);
    if (result.score) {
      setScore(result.score);
    }
    setIsCalculating(false);
  };

  const handleCheckDuplicates = async () => {
    setIsCheckingDuplicates(true);
    const result = await findDuplicatesAction(contact.id);
    if (result.duplicates) {
      setDuplicates({
        contacts: result.duplicates,
        similarity: result.similarity,
      });
    }
    setIsCheckingDuplicates(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Hot Lead";
    if (score >= 60) return "Warm Lead";
    if (score >= 40) return "Cool Lead";
    return "Cold Lead";
  };

  return (
    <div className="space-y-4">
      {/* Lead Score Card */}
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">AI Contact Score</h3>
          </div>
          <button
            onClick={handleCalculateScore}
            disabled={isCalculating}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 rounded-lg text-xs transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isCalculating ? "animate-spin" : ""}`} />
            {isCalculating ? "Calculating..." : score ? "Recalculate" : "Calculate"}
          </button>
        </div>

        {score ? (
          <>
            {/* Score Display */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20">
                  {/* Circle Progress */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - (score.lead_score || 0) / 100)}`}
                      className={getScoreColor(score.lead_score || 0)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(score.lead_score || 0)}`}>
                      {score.lead_score}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className={`text-lg font-semibold ${getScoreColor(score.lead_score || 0)}`}>
                  {getScoreLabel(score.lead_score || 0)}
                </p>
                <p className="text-xs text-slate-400 mt-1">{score.ai_reasoning}</p>
              </div>
            </div>

            {/* Score Breakdown */}
            {score.score_factors && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Recency</p>
                  <p className="text-sm font-semibold text-white">
                    {score.score_factors.recency}/100
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Frequency</p>
                  <p className="text-sm font-semibold text-white">
                    {score.score_factors.frequency}/100
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Deal Value</p>
                  <p className="text-sm font-semibold text-white">
                    {score.score_factors.deal_value}/100
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Engagement</p>
                  <p className="text-sm font-semibold text-white">
                    {score.score_factors.engagement}/100
                  </p>
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {score.recommended_actions && score.recommended_actions.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Recommended Actions</p>
                <div className="space-y-2">
                  {score.recommended_actions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"
                    >
                      <TrendingUp
                        className={`w-4 h-4 mt-0.5 ${
                          action.priority === "high"
                            ? "text-red-400"
                            : action.priority === "medium"
                            ? "text-orange-400"
                            : "text-blue-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-xs text-white font-medium">{action.action}</p>
                        <p className="text-xs text-slate-500">{action.reasoning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Calculate AI score to get insights and recommendations
          </p>
        )}
      </div>

      {/* Duplicate Detection */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-white">Duplicate Detection</h3>
          </div>
          <button
            onClick={handleCheckDuplicates}
            disabled={isCheckingDuplicates}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 rounded-lg text-xs transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingDuplicates ? "animate-spin" : ""}`} />
            {isCheckingDuplicates ? "Checking..." : "Check for Duplicates"}
          </button>
        </div>

        {duplicates ? (
          duplicates.contacts.length > 0 ? (
            <div className="space-y-2">
              {duplicates.contacts.map((dup, i) => (
                <div key={dup.id} className="p-3 bg-white/5 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">{dup.name}</p>
                    <span className="text-xs text-orange-400">
                      {(duplicates.similarity[i] * 100).toFixed(0)}% match
                    </span>
                  </div>
                  {dup.email && (
                    <p className="text-xs text-slate-400">{dup.email}</p>
                  )}
                  {dup.company && (
                    <p className="text-xs text-slate-500">{dup.company}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-400 text-center py-4">
              ✓ No duplicates found
            </p>
          )
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Check for potential duplicate contacts
          </p>
        )}
      </div>
    </div>
  );
}
