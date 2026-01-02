import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileText,
  Image,
  Layers,
  Lightbulb,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

const tools = [
  {
    name: "Unravel",
    description: "Thread to article conversion with structured outputs.",
    icon: FileText,
    href: "/apps/unravel",
  },
  {
    name: "Serendipity",
    description: "Content strategy, research, and visual workflow engine.",
    icon: Layers,
    href: "/apps/serendipity",
  },
  {
    name: "PromptStash",
    description: "Prompt IDE with analysis, rewrite, and templating.",
    icon: Sparkles,
    href: "/apps/promptstash",
  },
  {
    name: "InsightLens",
    description: "Transform content into summaries, maps, and scripts.",
    icon: Lightbulb,
    href: "/apps/insightlens",
  },
  {
    name: "Banana Blitz",
    description: "Generate high impact social graphics at speed.",
    icon: Image,
    href: "/apps/banana-blitz",
  },
];

const highlights = [
  {
    title: "Invite Only",
    description: "Focused access for builders shipping real work.",
    icon: Shield,
  },
  {
    title: "Unified Workspace",
    description: "One account across all tools and workflows.",
    icon: Zap,
  },
  {
    title: "Contextual AI",
    description: "An assistant that follows your projects.",
    icon: Bot,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
      </div>

      <nav className="relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">The Builder&apos;s Lab</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-white/10 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Get Access
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="container mx-auto px-6 pt-20 pb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              5 AI powered tools, one cohesive suite
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-5">
              A focused AI workspace built for real work.
            </h1>
            <p className="text-base md:text-lg text-slate-400 mb-8 max-w-2xl">
              The Builder&apos;s Lab unifies content, research, and creative tooling into a single, polished environment so your workflow stays clean and fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/apps"
                className="inline-flex items-center gap-2 border border-white/10 px-6 py-3 rounded-lg text-slate-300 hover:text-white hover:border-white/30 transition-colors"
              >
                Explore Tools
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-12">
          <div className="border border-white/10 rounded-2xl divide-y divide-white/10 md:divide-y-0 md:divide-x grid grid-cols-1 md:grid-cols-3 bg-white/5">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div
                  key={highlight.title}
                  className="p-6"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white/80" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-sm text-slate-400">{highlight.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">The Tools</h2>
              <p className="text-sm text-slate-500">Purpose built, deep integrations, shared context.</p>
            </div>
            <Link href="/apps" className="text-sm text-slate-300 hover:text-white inline-flex items-center gap-2">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="group rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white/80" />
                    </div>
                    <h3 className="text-base font-semibold group-hover:text-white">{tool.name}</h3>
                  </div>
                  <p className="text-sm text-slate-400">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
