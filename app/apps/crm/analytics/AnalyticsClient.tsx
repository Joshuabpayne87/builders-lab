"use client";

import { useState } from "react";
import type {
  PipelineFunnelData,
  ActivityHeatmapData,
  RevenueTrendData,
  ContactGrowthData,
} from "../types";

interface AnalyticsClientProps {
  pipelineFunnel: PipelineFunnelData[];
  activityHeatmap: ActivityHeatmapData[];
  revenueTrends: RevenueTrendData[];
  contactGrowth: ContactGrowthData[];
}

export function AnalyticsClient({
  pipelineFunnel,
  activityHeatmap,
  revenueTrends,
  contactGrowth,
}: AnalyticsClientProps) {
  const [activeView, setActiveView] = useState<"charts" | "tables">("charts");

  return (
    <>
      {/* View Toggle */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <button
          onClick={() => setActiveView("charts")}
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            activeView === "charts"
              ? "bg-white text-black font-medium"
              : "bg-white/10 text-slate-400 hover:bg-white/20"
          }`}
        >
          Charts
        </button>
        <button
          onClick={() => setActiveView("tables")}
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            activeView === "tables"
              ? "bg-white text-black font-medium"
              : "bg-white/10 text-slate-400 hover:bg-white/20"
          }`}
        >
          Tables
        </button>
      </div>

      {activeView === "charts" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Funnel Chart */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pipeline Funnel</h3>
            <div className="space-y-3">
              {pipelineFunnel.map((stage, index) => {
                const maxCount = Math.max(...pipelineFunnel.map((s) => s.count));
                const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;

                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{stage.stage}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-white">{stage.count}</span>
                        {stage.conversionRate !== undefined && (
                          <span className="text-xs text-slate-500">
                            {stage.conversionRate.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg transition-all duration-500 flex items-center justify-end px-3"
                        style={{ width: `${widthPercent}%` }}
                      >
                        {stage.value > 0 && (
                          <span className="text-xs font-medium text-white">
                            ${stage.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Heatmap Chart */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Heatmap (Last 90 Days)</h3>
            <div className="space-y-2">
              {activityHeatmap.length > 0 ? (
                <>
                  <div className="grid grid-cols-7 gap-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div key={i} className="text-center text-xs text-slate-600 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {activityHeatmap.slice(-91).map((day, index) => {
                      const maxActivity = Math.max(...activityHeatmap.map((d) => d.count));
                      const intensity = maxActivity > 0 ? day.count / maxActivity : 0;
                      const bgColor = intensity > 0.7
                        ? "bg-green-500"
                        : intensity > 0.4
                        ? "bg-green-600"
                        : intensity > 0.2
                        ? "bg-green-700"
                        : intensity > 0
                        ? "bg-green-800"
                        : "bg-white/5";

                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded ${bgColor} border border-white/10`}
                          title={`${day.date}: ${day.count} activities`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <span className="text-xs text-slate-600">Less</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded ${
                            i === 0
                              ? "bg-white/5"
                              : i === 1
                              ? "bg-green-800"
                              : i === 2
                              ? "bg-green-700"
                              : i === 3
                              ? "bg-green-600"
                              : "bg-green-500"
                          } border border-white/10`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-600">More</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No activity data yet</p>
              )}
            </div>
          </div>

          {/* Revenue Trends Chart */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends</h3>
            {revenueTrends.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-slate-400">Pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-slate-400">Won</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-slate-400">Lost</span>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-2 items-end h-40">
                  {revenueTrends.slice(-12).map((trend, index) => {
                    const maxValue = Math.max(
                      ...revenueTrends.map((t) =>
                        Math.max(t.pipeline_value, t.won_value, t.lost_value)
                      )
                    );
                    const pipelineHeight =
                      maxValue > 0 ? (trend.pipeline_value / maxValue) * 100 : 0;
                    const wonHeight = maxValue > 0 ? (trend.won_value / maxValue) * 100 : 0;
                    const lostHeight = maxValue > 0 ? (trend.lost_value / maxValue) * 100 : 0;

                    return (
                      <div key={index} className="flex flex-col gap-1 items-center">
                        <div className="flex flex-col gap-1 w-full">
                          {trend.pipeline_value > 0 && (
                            <div
                              className="bg-blue-500/50 rounded-t"
                              style={{ height: `${pipelineHeight}px` }}
                              title={`Pipeline: $${trend.pipeline_value.toLocaleString()}`}
                            />
                          )}
                          {trend.won_value > 0 && (
                            <div
                              className="bg-green-500/50 rounded"
                              style={{ height: `${wonHeight}px` }}
                              title={`Won: $${trend.won_value.toLocaleString()}`}
                            />
                          )}
                          {trend.lost_value > 0 && (
                            <div
                              className="bg-red-500/50 rounded-b"
                              style={{ height: `${lostHeight}px` }}
                              title={`Lost: $${trend.lost_value.toLocaleString()}`}
                            />
                          )}
                        </div>
                        <span className="text-xs text-slate-600 rotate-45 origin-top-left mt-2">
                          {trend.period.split("-")[1]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No revenue data yet</p>
            )}
          </div>

          {/* Contact Growth Chart */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Growth</h3>
            {contactGrowth.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 items-end h-40">
                  {contactGrowth.slice(-12).map((data, index) => {
                    const maxTotal = Math.max(...contactGrowth.map((d) => d.total));
                    const height = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;

                    return (
                      <div key={index} className="flex flex-col items-center gap-1">
                        <div
                          className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-t w-full"
                          style={{ height: `${height}%` }}
                          title={`${data.period}: ${data.total} contacts (+${data.new} new)`}
                        />
                        <span className="text-xs text-slate-600 rotate-45 origin-top-left mt-2">
                          {data.period.split("-")[1]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-white">
                    {contactGrowth[contactGrowth.length - 1]?.total || 0}
                  </p>
                  <p className="text-xs text-slate-500">Total Contacts</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No growth data yet</p>
            )}
          </div>
        </div>
      ) : (
        /* Tables View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Funnel Table */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pipeline Funnel Data</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-2 text-xs text-slate-500 font-medium">Stage</th>
                  <th className="pb-2 text-xs text-slate-500 font-medium text-right">Count</th>
                  <th className="pb-2 text-xs text-slate-500 font-medium text-right">Value</th>
                  <th className="pb-2 text-xs text-slate-500 font-medium text-right">Conv. %</th>
                </tr>
              </thead>
              <tbody>
                {pipelineFunnel.map((stage) => (
                  <tr key={stage.stage} className="border-b border-white/5">
                    <td className="py-2 text-sm text-white">{stage.stage}</td>
                    <td className="py-2 text-sm text-slate-300 text-right">{stage.count}</td>
                    <td className="py-2 text-sm text-slate-300 text-right">
                      ${stage.value.toLocaleString()}
                    </td>
                    <td className="py-2 text-sm text-slate-300 text-right">
                      {stage.conversionRate?.toFixed(1) || "-"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Revenue Trends Table */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends Data</h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white/5">
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-2 text-xs text-slate-500 font-medium">Period</th>
                    <th className="pb-2 text-xs text-slate-500 font-medium text-right">Pipeline</th>
                    <th className="pb-2 text-xs text-slate-500 font-medium text-right">Won</th>
                    <th className="pb-2 text-xs text-slate-500 font-medium text-right">Lost</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueTrends.map((trend) => (
                    <tr key={trend.period} className="border-b border-white/5">
                      <td className="py-2 text-sm text-white">{trend.period}</td>
                      <td className="py-2 text-sm text-blue-400 text-right">
                        ${trend.pipeline_value.toLocaleString()}
                      </td>
                      <td className="py-2 text-sm text-green-400 text-right">
                        ${trend.won_value.toLocaleString()}
                      </td>
                      <td className="py-2 text-sm text-red-400 text-right">
                        ${trend.lost_value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
