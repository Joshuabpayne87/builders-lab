import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, BarChart3 } from "lucide-react";
import { getContacts, getDashboardStats } from "./services/supabaseService";
import { getNotifications } from "./services/workflowService";
import { CRMClient } from "./components/CRMClient";
import { NotificationsPanel } from "./components/NotificationsPanel";

export default async function CRMPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch dashboard data
  const stats = await getDashboardStats();
  const contacts = await getContacts();
  const notifications = await getNotifications({ limit: 20 });

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
            href="/apps"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Apps</span>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white/80" />
            <h1 className="text-lg font-semibold tracking-tight">CRM</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsPanel initialNotifications={notifications} />
            <Link
              href="/apps/crm/analytics"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Analytics</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        <CRMClient contacts={contacts} stats={stats} />
      </div>
    </div>
  );
}
