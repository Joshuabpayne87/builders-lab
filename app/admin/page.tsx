"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  Database,
  FileText,
  BarChart3,
  LogOut,
  Shield,
  Briefcase
} from "lucide-react";
import UsersList from "./components/UsersList";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import CRMManager from "./components/CRMManager";
import DatabaseViewer from "./components/DatabaseViewer";

type AdminView = "analytics" | "users" | "crm" | "database";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentView, setCurrentView] = useState<AdminView>("analytics");
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const isAdmin = user.user_metadata?.role === "admin";

      if (!isAdmin) {
        router.push("/dashboard");
        return;
      }

      setAdminName(user.user_metadata?.full_name || user.email || "Admin");
      setLoading(false);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/auth/login");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const navigation = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "crm", label: "CRM Manager", icon: Briefcase },
    { id: "database", label: "Database", icon: Database },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">Welcome back, {adminName}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as AdminView)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentView === "analytics" && <AnalyticsDashboard />}
          {currentView === "users" && <UsersList />}
          {currentView === "crm" && <CRMManager />}
          {currentView === "database" && <DatabaseViewer />}
        </div>
      </div>
    </div>
  );
}
