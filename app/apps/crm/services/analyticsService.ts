// CRM Analytics Service - Calculate metrics and insights
import { createClient } from "@/lib/supabase/server";
import type {
  Contact,
  Activity,
  Deal,
  ContactType,
  DealStage,
  PipelineFunnelData,
  ActivityHeatmapData,
  RevenueTrendData,
  ContactGrowthData,
  AnalyticsSummary,
} from "../types";

// ============================================================================
// PIPELINE FUNNEL
// ============================================================================

export async function getPipelineFunnel(): Promise<PipelineFunnelData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get all contacts with their type
  const { data: contacts } = await supabase
    .from("bl_crm_contacts")
    .select("id, contact_type")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE");

  // Get all deals grouped by contact
  const { data: deals } = await supabase
    .from("bl_crm_deals")
    .select("contact_id, value, status")
    .eq("user_id", user.id);

  // Group contacts by type with deal values
  const funnel: Record<string, { count: number; value: number }> = {
    LEAD: { count: 0, value: 0 },
    PROSPECT: { count: 0, value: 0 },
    COLLABORATOR: { count: 0, value: 0 },
    PARTNER: { count: 0, value: 0 },
  };

  contacts?.forEach((contact) => {
    const contactType = contact.contact_type as ContactType;
    funnel[contactType].count++;

    // Add associated deal values
    const contactDeals = deals?.filter((d) => d.contact_id === contact.id) || [];
    const totalValue = contactDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    funnel[contactType].value += totalValue;
  });

  // Calculate conversion rates
  const result: PipelineFunnelData[] = [];
  const stages = ["LEAD", "PROSPECT", "COLLABORATOR", "PARTNER"];

  stages.forEach((stage, index) => {
    const conversionRate =
      index > 0 && result[index - 1].count > 0
        ? (funnel[stage].count / result[index - 1].count) * 100
        : 100;

    result.push({
      stage,
      count: funnel[stage].count,
      value: funnel[stage].value,
      conversionRate: index > 0 ? conversionRate : undefined,
    });
  });

  return result;
}

// ============================================================================
// ACTIVITY HEATMAP
// ============================================================================

export async function getActivityHeatmap(days = 90): Promise<ActivityHeatmapData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: activities } = await supabase
    .from("bl_crm_activities")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", startDate.toISOString());

  // Group by date
  const heatmapData: Record<string, ActivityHeatmapData> = {};

  activities?.forEach((activity) => {
    const date = new Date(activity.created_at);
    const dateKey = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    if (!heatmapData[dateKey]) {
      heatmapData[dateKey] = {
        date: dateKey,
        count: 0,
        dayOfWeek,
      };
    }

    heatmapData[dateKey].count++;
  });

  return Object.values(heatmapData).sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// REVENUE TRENDS
// ============================================================================

export async function getRevenueTrends(months = 12): Promise<RevenueTrendData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: deals } = await supabase
    .from("bl_crm_deals")
    .select("value, status, created_at, actual_close_date")
    .eq("user_id", user.id);

  // Group by month
  const trends: Record<string, RevenueTrendData> = {};

  deals?.forEach((deal) => {
    const date = new Date(deal.created_at);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!trends[period]) {
      trends[period] = {
        period,
        pipeline_value: 0,
        won_value: 0,
        lost_value: 0,
      };
    }

    if (deal.status === "OPEN") {
      trends[period].pipeline_value += deal.value || 0;
    } else if (deal.status === "WON") {
      trends[period].won_value += deal.value || 0;
    } else if (deal.status === "LOST") {
      trends[period].lost_value += deal.value || 0;
    }
  });

  return Object.values(trends)
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-months);
}

// ============================================================================
// CONTACT GROWTH
// ============================================================================

export async function getContactGrowth(months = 12): Promise<ContactGrowthData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: contacts } = await supabase
    .from("bl_crm_contacts")
    .select("created_at, contact_type")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE");

  // Group by month
  const growth: Record<string, ContactGrowthData> = {};

  contacts?.forEach((contact) => {
    const date = new Date(contact.created_at);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!growth[period]) {
      growth[period] = {
        period,
        total: 0,
        new: 0,
        by_type: {
          LEAD: 0,
          PROSPECT: 0,
          COLLABORATOR: 0,
          PARTNER: 0,
        },
      };
    }

    const contactType = contact.contact_type as ContactType;
    growth[period].new++;
    growth[period].by_type[contactType]++;
  });

  // Calculate cumulative totals
  const sorted = Object.values(growth).sort((a, b) => a.period.localeCompare(b.period));
  let cumulative = 0;
  sorted.forEach((item) => {
    cumulative += item.new;
    item.total = cumulative;
  });

  return sorted.slice(-months);
}

// ============================================================================
// ANALYTICS SUMMARY
// ============================================================================

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get all deals
  const { data: deals } = await supabase
    .from("bl_crm_deals")
    .select("value, status, created_at, actual_close_date")
    .eq("user_id", user.id);

  // Get all contacts
  const { data: contacts } = await supabase
    .from("bl_crm_contacts")
    .select("contact_type, created_at")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE");

  // Get activities
  const { data: activities } = await supabase
    .from("bl_crm_activities")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1000);

  // Calculate total revenue (won deals)
  const wonDeals = deals?.filter((d) => d.status === "WON") || [];
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  // Calculate win rate
  const closedDeals = deals?.filter((d) => d.status === "WON" || d.status === "LOST") || [];
  const winRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;

  // Calculate average deal size
  const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;

  // Calculate average sales cycle (days from created to closed)
  let totalCycleDays = 0;
  let cycleCount = 0;
  wonDeals.forEach((deal) => {
    if (deal.actual_close_date) {
      const created = new Date(deal.created_at);
      const closed = new Date(deal.actual_close_date);
      const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      totalCycleDays += days;
      cycleCount++;
    }
  });
  const avgSalesCycle = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : 0;

  // Find top performing contact type
  const typePerformance: Record<ContactType, number> = {
    LEAD: 0,
    PROSPECT: 0,
    COLLABORATOR: 0,
    PARTNER: 0,
  };
  contacts?.forEach((c) => {
    const contactType = c.contact_type as ContactType;
    typePerformance[contactType]++;
  });
  const topPerformingType = (Object.keys(typePerformance) as ContactType[]).reduce((a, b) =>
    typePerformance[a] > typePerformance[b] ? a : b
  );

  // Find most active day of week
  const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sunday = 0
  activities?.forEach((a) => {
    const day = new Date(a.created_at).getDay();
    dayCount[day]++;
  });
  const mostActiveDayIndex = dayCount.indexOf(Math.max(...dayCount));
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mostActiveDay = dayNames[mostActiveDayIndex];

  // Generate AI insights
  const insights = [
    winRate > 50
      ? `Strong win rate of ${winRate.toFixed(1)}% indicates effective qualification`
      : `Win rate of ${winRate.toFixed(1)}% suggests room for better lead qualification`,
    avgSalesCycle > 0
      ? `Average sales cycle of ${avgSalesCycle} days`
      : "Not enough closed deals to calculate sales cycle",
    `${typePerformance[topPerformingType]} ${topPerformingType.toLowerCase()}s in your pipeline`,
    `You're most active on ${mostActiveDay}s`,
  ];

  return {
    totalRevenue,
    winRate,
    avgDealSize,
    avgSalesCycle,
    topPerformingType,
    mostActiveDay,
    insights,
  };
}
