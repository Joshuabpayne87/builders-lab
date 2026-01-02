import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, BarChart3, Users, DollarSign } from "lucide-react";
import {
  getPipelineFunnel,
  getActivityHeatmap,
  getRevenueTrends,
  getContactGrowth,
  getAnalyticsSummary,
} from "../services/analyticsService";
import { AnalyticsClient } from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all analytics data
  const [pipelineFunnel, activityHeatmap, revenueTrends, contactGrowth, summary] =
    await Promise.all([
      getPipelineFunnel(),
      getActivityHeatmap(),
      getRevenueTrends(),
      getContactGrowth(),
      getAnalyticsSummary(),
    ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/apps/crm"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to CRM</span>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-white/80" />
            <h1 className="text-lg font-semibold tracking-tight">Analytics</h1>
          </div>
          <div className="w-32" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">CRM Analytics Dashboard</h2>
          <p className="text-sm text-slate-500">
            Insights and trends from your contacts, activities, and deals
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Total Revenue
              </p>
              <DollarSign className="w-4 h-4 text-green-500" strokeWidth={1.5} />
            </div>
            <p className="text-3xl font-semibold text-white">
              ${summary.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 mt-2">From won deals</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Win Rate
              </p>
              <TrendingUp className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
            </div>
            <p className="text-3xl font-semibold text-white">{summary.winRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-600 mt-2">Of closed deals</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Avg Deal Size
              </p>
              <DollarSign className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
            </div>
            <p className="text-3xl font-semibold text-white">
              ${summary.avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-600 mt-2">Per won deal</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Sales Cycle
              </p>
              <Users className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            </div>
            <p className="text-3xl font-semibold text-white">{summary.avgSalesCycle}</p>
            <p className="text-xs text-slate-600 mt-2">Days on average</p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-3">AI Insights</h3>
              <ul className="space-y-2">
                {summary.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Charts - Client Component */}
        <AnalyticsClient
          pipelineFunnel={pipelineFunnel}
          activityHeatmap={activityHeatmap}
          revenueTrends={revenueTrends}
          contactGrowth={contactGrowth}
        />
      </div>
    </div>
  );
}
