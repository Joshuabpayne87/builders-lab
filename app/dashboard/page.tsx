import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Sparkles,
  FileText,
  Lightbulb,
  Image as ImageIcon,
  LogOut,
  Bot,
  User,
  Home,
  Zap,
  ArrowRight,
  Clock,
  LayoutGrid,
  TrendingUp,
  Activity,
  Users,
  Settings,
  Code,
} from "lucide-react";
import { NotionWidget } from "./NotionWidget";
import { Suspense } from "react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const apps = [
    {
      name: "Unravel",
      description: "Thread to Article Converter",
      icon: FileText,
      href: "/apps/unravel",
      image: "/app-cards/unravel.png",
    },
    {
      name: "Serendipity",
      description: "AI Content Architect",
      icon: Layers,
      href: "/apps/serendipity",
      image: "/app-cards/serendipity.png",
    },
    {
      name: "PromptStash",
      description: "Prompt IDE",
      icon: Sparkles,
      href: "/apps/promptstash",
      image: "/app-cards/promptstash.png",
    },
    {
      name: "InsightLens",
      description: "Content Transformer",
      icon: Lightbulb,
      href: "/apps/insightlens",
      image: "/app-cards/insightlens.png",
    },
    {
      name: "Banana Blitz",
      description: "Image Generator",
      icon: ImageIcon,
      href: "/apps/banana-blitz",
      image: "/app-cards/banana-blitz.png",
    },
    {
      name: "ComponentStudio",
      description: "UI Component Generator",
      icon: Code,
      href: "/apps/component-studio",
      image: "/app-cards/component-studio.png",
    },
  ];

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Subtle Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">The Builder's Lab</span>
            </Link>

            {/* Center Menu */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/apps"
                className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
              >
                Apps
              </Link>
              <Link
                href="/apps/crm"
                className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
              >
                CRM
              </Link>
              <Link
                href="/implementation-library"
                className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
              >
                Library
              </Link>
              <Link
                href="/assistant"
                className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
              >
                Assistant
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400 max-w-[150px] truncate">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Settings</span>
              </Link>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
          </h1>
          <p className="text-sm text-slate-500">Manage your workspace and tools</p>
        </div>

        {/* Quick Launch - Horizontal Scroll */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Launch
            </h2>
            <Link
              href="/apps"
              className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Horizontal Scrolling App Launcher */}
          <div className="relative -mx-6 px-6">
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
              {[...apps, ...apps].map((app, index) => {
                const Icon = app.icon;
                return (
                  <Link
                    key={`${app.name}-${index}`}
                    href={app.href}
                    className="group relative flex-shrink-0 w-56 snap-start"
                  >
                    <div className="h-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all">
                      {/* Card Image Header */}
                      <div className="relative w-full h-24 bg-gradient-to-br from-white/5 to-white/10 overflow-hidden">
                        <Image
                          src={app.image}
                          alt={`${app.name} banner`}
                          fill
                          className="object-cover"
                          priority
                        />
                        {/* Overlay with app icon */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-purple-900/10 to-slate-900/30 flex items-center justify-center pointer-events-none">
                          <Icon className="w-8 h-8 text-white/10" strokeWidth={1} />
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-white mb-0.5 truncate">{app.name}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{app.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Notion Widget */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-3 bg-white/10 rounded"></div>
                      <div className="h-3 bg-white/10 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              }
            >
              <NotionWidget />
            </Suspense>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                Recent Activity
              </h2>
            </div>
            <div className="space-y-2">
              {[
                { app: "Unravel", action: "Converted thread to article", time: "2h ago" },
                { app: "PromptStash", action: "Analyzed prompt quality", time: "5h ago" },
                { app: "InsightLens", action: "Generated mind map", time: "1d ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{activity.app}</p>
                    <p className="text-xs text-slate-500 truncate">{activity.action}</p>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Assistant & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* AI Assistant Quick Access */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                </div>
                <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6 flex-1 leading-relaxed">
                Your intelligent companion for instant answers, content generation, and workflow automation.
              </p>
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all text-sm"
              >
                <span>Open Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Apps Used", value: "5", icon: LayoutGrid },
            { label: "Content Created", value: "24", icon: Activity },
            { label: "Time Saved", value: "12h", icon: TrendingUp },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
                  <Icon className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
                </div>
                <p className="text-3xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Hidden Admin Link */}
      <Link
        href="/admin"
        className="fixed bottom-4 right-4 w-3 h-3 bg-white/5 hover:bg-white/10 hover:w-auto hover:h-auto hover:px-3 hover:py-2 rounded transition-all duration-300 group z-50"
      >
        <span className="hidden group-hover:inline text-xs text-white font-semibold">admin</span>
      </Link>
    </div>
  );
}
