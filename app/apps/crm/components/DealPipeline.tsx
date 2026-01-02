"use client";

import { useState } from "react";
import { DollarSign, Calendar, TrendingUp, Edit, Trash2 } from "lucide-react";
import { updateDealStageAction, deleteDealAction } from "../actions";
import type { Deal, DealStage } from "../types";
import { DEAL_STAGES, formatDealValue, getDealStageColor } from "../constants";

interface DealPipelineProps {
  deals: Deal[];
  onEdit?: (deal: Deal) => void;
}

export function DealPipeline({ deals, onEdit }: DealPipelineProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    setProcessingIds((prev) => new Set(prev).add(dealId));
    try {
      await deleteDealAction(dealId);
    } catch (error) {
      console.error("Failed to delete deal:", error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(dealId);
        return next;
      });
    }
  };

  // Group deals by stage
  const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage.value] = deals.filter((deal) => deal.stage === stage.value && deal.status === "OPEN");
    return acc;
  }, {} as Record<DealStage, Deal[]>);

  // Calculate total value per stage
  const stageValues = DEAL_STAGES.reduce((acc, stage) => {
    const total = dealsByStage[stage.value].reduce((sum, deal) => sum + (deal.value || 0), 0);
    acc[stage.value] = total;
    return acc;
  }, {} as Record<DealStage, number>);

  return (
    <div className="space-y-6">
      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {DEAL_STAGES.map((stage) => {
          const count = dealsByStage[stage.value].length;
          const value = stageValues[stage.value];
          const colorClass = getDealStageColor(stage.value);

          return (
            <div
              key={stage.value}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 text-xs rounded-md ${colorClass}`}>
                  {stage.label}
                </span>
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-2xl font-semibold text-white mb-1">{count}</p>
              <p className="text-xs text-slate-600">
                ${value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage.value];
          const colorClass = getDealStageColor(stage.value);

          return (
            <div key={stage.value} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                  <span className="px-2 py-0.5 text-xs bg-white/10 text-slate-400 rounded-md">
                    {stageDeals.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{stage.description}</p>
              </div>

              {/* Deal Cards */}
              <div className="space-y-3 flex-1">
                {stageDeals.length === 0 ? (
                  <div className="p-4 bg-white/5 border border-white/10 border-dashed rounded-lg text-center">
                    <p className="text-xs text-slate-600">No deals</p>
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const isProcessing = processingIds.has(deal.id);

                    return (
                      <div
                        key={deal.id}
                        className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h4 className="text-sm font-semibold text-white line-clamp-2 flex-1">
                            {deal.title}
                          </h4>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(deal)}
                                disabled={isProcessing}
                                className="p-1 hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                                title="Edit deal"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(deal.id)}
                              disabled={isProcessing}
                              className="p-1 hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                              title="Delete deal"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>

                        {deal.description && (
                          <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                            {deal.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          {deal.value !== null && (
                            <div className="flex items-center gap-2 text-xs">
                              <DollarSign className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-white font-medium">
                                {formatDealValue(deal)}
                              </span>
                            </div>
                          )}

                          {deal.expected_close_date && (
                            <div className="flex items-center gap-2 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-slate-500">
                                {new Date(deal.expected_close_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {deal.ai_probability !== null && (
                            <div className="flex items-center gap-2 text-xs">
                              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-slate-500">
                                {deal.ai_probability}% win probability
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Stage indicator badge */}
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className={`px-2 py-0.5 text-xs rounded-md ${colorClass}`}>
                            {stage.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
