"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Briefcase,
  FileText,
  CheckCircle,
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlySignups: number;
  totalContacts: number;
  totalDeals: number;
  totalActivities: number;
  wonDeals: number;
}

export default function AnalyticsDashboard() {
  const supabase = createClient();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlySignups: 0,
    totalContacts: 0,
    totalDeals: 0,
    totalActivities: 0,
    wonDeals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get all users count
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const totalUsers = usersData?.users.length || 0;

      // Get users who signed in this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlySignups = usersData?.users.filter(
        (user) => new Date(user.created_at) >= startOfMonth
      ).length || 0;

      const activeUsers = usersData?.users.filter(
        (user) => user.last_sign_in_at && new Date(user.last_sign_in_at) >= startOfMonth
      ).length || 0;

      // Get CRM stats
      const { data: contactsData } = await supabase
        .from("bl_crm_contacts")
        .select("id", { count: "exact" });

      const { data: dealsData } = await supabase
        .from("bl_crm_deals")
        .select("id, status, value", { count: "exact" });

      const { data: activitiesData } = await supabase
        .from("bl_crm_activities")
        .select("id", { count: "exact" });

      const wonDeals = dealsData?.filter((deal) => deal.status === "WON").length || 0;
      const totalRevenue = dealsData
        ?.filter((deal) => deal.status === "WON")
        .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0) || 0;

      setAnalytics({
        totalUsers,
        activeUsers,
        totalRevenue,
        monthlySignups,
        totalContacts: contactsData?.length || 0,
        totalDeals: dealsData?.length || 0,
        totalActivities: activitiesData?.length || 0,
        wonDeals,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: analytics.totalUsers,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Active This Month",
      value: analytics.activeUsers,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      label: "Monthly Signups",
      value: analytics.monthlySignups,
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Total Revenue",
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    {
      label: "Total Contacts",
      value: analytics.totalContacts,
      icon: Users,
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      label: "Total Deals",
      value: analytics.totalDeals,
      icon: Briefcase,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      label: "Won Deals",
      value: analytics.wonDeals,
      icon: CheckCircle,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      label: "Total Activities",
      value: analytics.totalActivities,
      icon: FileText,
      color: "from-pink-500 to-purple-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Analytics Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-sm rounded-xl p-6 transition-all hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Quick Insights</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">{analytics.activeUsers}</span> users active this month
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">{analytics.monthlySignups}</span> new signups this month
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">{analytics.wonDeals}</span> deals won (${analytics.totalRevenue.toLocaleString()} total revenue)
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">{analytics.totalActivities}</span> activities logged across all users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
