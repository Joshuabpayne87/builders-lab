import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  FileText,
  Lightbulb,
  Image,
  LogOut,
  Bot,
  User,
  Home,
  Zap,
  LayoutGrid,
  ArrowRight,
  Users,
} from "lucide-react";

export default async function AppsPage() {
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
      tagline: "Thread to Article Converter",
      description: "Transform Twitter/X threads and social media content into beautifully formatted articles. Unravel intelligently parses thread structures, maintains context, and outputs professional blog posts or social media content optimized for your audience.",
      icon: FileText,
      href: "/apps/unravel",
      features: [
        "URL and text input modes",
        "Smart thread parsing",
        "Multiple output formats",
        "AI-powered transformation",
        "Auto-save functionality",
      ],
    },
    {
      name: "Serendipity",
      tagline: "AI Content Architect",
      description: "Complete AI content studio featuring WorkflowGenerator with 10+ psychological frameworks, Market Research intelligence, Viral Hook Library, Canvas Studio for visual creation, and ScriptView for video production.",
      icon: Layers,
      href: "/apps/serendipity",
      features: [
        "10+ content frameworks",
        "Market research & ICP generation",
        "Viral hooks database",
        "Canvas drawing & video generation",
        "Video recording with teleprompter",
      ],
    },
    {
      name: "PromptStash",
      tagline: "Prompt Engineering IDE",
      description: "Professional prompt engineering environment with AI-powered quality scoring (0-100). Get detailed feedback on clarity, specificity, structure, and context. Auto-refine feature enhances weak prompts with actionable suggestions.",
      icon: Sparkles,
      href: "/apps/promptstash",
      features: [
        "AI-powered quality scoring",
        "Detailed analysis breakdown",
        "Auto-refine weak prompts",
        "IDE-style interface",
        "Version history & templates",
      ],
    },
    {
      name: "InsightLens",
      tagline: "Content Transformation Engine",
      description: "Transform content with 4 intelligent lenses: Summary, Mind Map, Podcast Script, and Key Points. Process any text input and generate multiple content formats simultaneously using advanced AI capabilities.",
      icon: Lightbulb,
      href: "/apps/insightlens",
      features: [
        "4 transformation lenses",
        "Mind map visualization",
        "Podcast script generation",
        "Bullet-point extraction",
        "Multi-format export",
      ],
    },
    {
      name: "Banana Blitz",
      tagline: "Social Media Image Factory",
      description: "Create eye-catching social media graphics in seconds. Input your concept, get AI-enhanced prompts, and generate stunning images. Perfect for Instagram, Twitter, LinkedIn, and more.",
      icon: Image,
      href: "/apps/banana-blitz",
      features: [
        "Text-to-image generation",
        "AI prompt enhancement",
        "Multiple aspect ratios",
        "Instant download",
        "Cloud library storage",
      ],
    },
    {
      name: "CRM",
      tagline: "Client Relationship Manager",
      description: "All-in-one workspace for managing leads, prospects, collaborators, and partners. Track contacts, activities, deals, and get AI-powered insights to nurture relationships and grow your business.",
      icon: Users,
      href: "/apps/crm",
      features: [
        "Contact & deal management",
        "Activity timeline tracking",
        "AI-powered insights",
        "Deal pipeline visualization",
        "Next action suggestions",
      ],
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
              <span className="text-sm font-semibold text-white tracking-tight">The Builder&apos;s Lab</span>
            </Link>

            {/* Center Menu */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/apps"
                className="px-4 py-2 text-sm text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
              >
                Apps
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
                  {user.email}
                </span>
              </div>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="relative container mx-auto px-6 py-12">
        <div className="mb-2">
          <h1 className="text-4xl font-semibold text-white mb-2">
            Apps
          </h1>
          <p className="text-sm text-slate-500">
            Professional AI tools for content creation and productivity
          </p>
        </div>
      </div>

      {/* Apps List */}
      <div className="relative container mx-auto px-6 pb-16">
        <div className="max-w-5xl mx-auto space-y-4">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.name}
                className="group relative"
              >
                <div className="relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Icon & Title */}
                    <div className="lg:col-span-4">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white/80" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-white mb-1">{app.name}</h2>
                          <p className="text-xs text-slate-500">{app.tagline}</p>
                        </div>
                      </div>
                      <Link
                        href={app.href}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all text-sm"
                      >
                        <span>Launch</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Middle: Description */}
                    <div className="lg:col-span-5">
                      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                        About
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    {/* Right: Features */}
                    <div className="lg:col-span-3">
                      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                        Features
                      </h3>
                      <ul className="space-y-1.5">
                        {app.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-500">
                            <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5 shrink-0"></div>
                            <span className="text-xs">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
