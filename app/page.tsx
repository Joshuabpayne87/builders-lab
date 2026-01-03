"use client";

import { useState, useEffect } from "react";
import { FileText, ArrowRight, Sparkles, Zap, Target, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [pageBlocks, setPageBlocks] = useState<any[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch("/api/resources");
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setResources([]);
        } else if (Array.isArray(data)) {
          setResources(data);
        } else {
          setError("Invalid response format");
          setResources([]);
        }
      } catch (err: any) {
        console.error("Error fetching resources:", err);
        setError(err.message);
        setResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  async function openPage(resource: any) {
    setSelectedPage(resource);
    try {
      const res = await fetch(`/api/resources/page?pageId=${resource.id}`);
      const blocks = await res.json();
      console.log("Page blocks:", blocks);
      console.log("Block types found:", [...new Set(blocks.map((b: any) => b.type))]);
      setPageBlocks(blocks);
    } catch (err) {
      console.error("Error fetching page blocks:", err);
      setPageBlocks([]);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-bold">Builder's Lab</span>
            </div>
            <Link
              href="/login"
              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
            >
              Log In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-16 max-w-6xl">
          {/* Hero Banner Image */}
          <div className="mb-16 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src="/hero-banner.jpg"
              alt="The Builder's Lab - AI for Creative Marketers"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              News, Articles & Strategic Guides
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              Stay ahead with curated insights, frameworks, and strategies to scale your business and optimize your workflow.
            </p>
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold">Ready to Build Faster?</h2>
                </div>
                <p className="text-slate-300 mb-4">
                  Get access to <span className="font-semibold text-white">Builder's Lab</span> — your all-in-one workspace with AI-powered tools, automation templates, and ready-to-use implementations.
                </p>
                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">AI-Powered Workflow Tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">Ready-to-Use Templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">Implementation Library</span>
                  </div>
                </div>
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                  <p className="text-sm font-semibold text-yellow-400 mb-1">
                    🎁 Limited Offer: First 10 Sign-ups Only!
                  </p>
                  <p className="text-xs text-slate-300">
                    Get a FREE 1-hour 1-on-1 session to help debug, build, or overcome any roadblock — marketing, social media, or technical. <span className="font-semibold text-white">$175 value!</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href="https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/monthly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-black hover:bg-white/90 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap text-center"
                >
                  Monthly Plan
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/yearly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap text-center"
                >
                  Yearly Plan
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400">Loading resources...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="inline-block w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-red-400 mb-2">Failed to load resources</p>
              <p className="text-slate-500 text-sm">{error}</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400">No resources available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => openPage(resource)}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all hover:bg-white/10 hover:scale-[1.02] cursor-pointer"
                >
                  {/* Thumbnail if available */}
                  {resource.coverImage && (
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-white/5 border border-white/10 mb-4">
                      <img
                        src={resource.coverImage}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-white/90 flex-1">
                      {resource.title}
                    </h3>
                    <Link
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {resource.tags?.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-md border border-white/10 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-3">Want Full Access?</h3>
              <p className="text-slate-400 mb-4 max-w-xl">
                Join Builder's Lab to unlock our complete implementation library, AI tools, and automation workflows.
              </p>
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 mb-6">
                <p className="text-sm font-semibold text-yellow-400 mb-1">
                  🎁 First 10 Sign-ups Get FREE 1-on-1 Session
                </p>
                <p className="text-xs text-slate-300">
                  $175 value — help with debugging, building, marketing, social media, or any roadblock!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/monthly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-semibold transition-all hover:scale-105"
                >
                  Monthly Plan
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/yearly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all hover:scale-105"
                >
                  Yearly Plan
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal/Full-screen view for page content */}
      {selectedPage && (
        <>
          {/* Backdrop */}
          {!isMaximized && (
            <div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setSelectedPage(null);
                setIsMaximized(false);
              }}
            />
          )}

          <div className={`fixed z-50 overflow-hidden flex flex-col ${
            isMaximized
              ? 'inset-0 bg-[#0A0A0A]'
              : 'inset-4 md:inset-8 lg:inset-16 bg-[#0A0A0A] rounded-2xl border border-white/10'
          }`}>
            {/* Header with back button */}
            <div className="flex items-center gap-4 p-6 border-b border-white/10">
              <button
                onClick={() => {
                  setSelectedPage(null);
                  setIsMaximized(false);
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm text-white font-medium"
              >
                ← Back
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-white mb-1">{selectedPage.title}</h2>
                <div className="flex items-center gap-2 text-xs">
                  {selectedPage.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-white/5 text-slate-500 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? (
                  <Minimize2 className="w-5 h-5 text-slate-400" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {pageBlocks.map((block: any, idx: number) => {
                  // Extract text content from any block type
                  const getText = (richText: any[]) => richText?.map((t: any) => t.plain_text).join("") || "";

                  return (
                    <div key={idx}>
                      {block.type === "image" && (
                        <img
                          src={block.image?.file?.url || block.image?.external?.url}
                          alt="Content"
                          className="w-full rounded-lg border border-white/10"
                        />
                      )}
                      {block.type === "paragraph" && block.paragraph?.rich_text?.length > 0 && (
                        <p className="text-slate-300 text-base leading-relaxed">
                          {getText(block.paragraph.rich_text)}
                        </p>
                      )}
                      {block.type === "heading_1" && (
                        <h1 className="text-3xl font-bold text-white mt-8 mb-4">
                          {getText(block.heading_1?.rich_text)}
                        </h1>
                      )}
                      {block.type === "heading_2" && (
                        <h2 className="text-2xl font-semibold text-white mt-6 mb-3">
                          {getText(block.heading_2?.rich_text)}
                        </h2>
                      )}
                      {block.type === "heading_3" && (
                        <h3 className="text-xl font-medium text-white mt-4 mb-2">
                          {getText(block.heading_3?.rich_text)}
                        </h3>
                      )}
                      {block.type === "bulleted_list_item" && (
                        <li className="text-slate-300 text-base ml-6 list-disc">
                          {getText(block.bulleted_list_item?.rich_text)}
                        </li>
                      )}
                      {block.type === "numbered_list_item" && (
                        <li className="text-slate-300 text-base ml-6 list-decimal">
                          {getText(block.numbered_list_item?.rich_text)}
                        </li>
                      )}
                      {block.type === "quote" && (
                        <blockquote className="border-l-4 border-white/20 pl-4 py-2 text-slate-400 italic">
                          {getText(block.quote?.rich_text)}
                        </blockquote>
                      )}
                      {block.type === "callout" && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <p className="text-slate-300 text-base">
                            {block.callout?.icon?.emoji} {getText(block.callout?.rich_text)}
                          </p>
                        </div>
                      )}
                      {block.type === "code" && (
                        <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
                          <code className="text-sm text-slate-300 font-mono">
                            {getText(block.code?.rich_text)}
                          </code>
                        </pre>
                      )}
                      {block.type === "divider" && (
                        <hr className="border-t border-white/10 my-8" />
                      )}
                      {block.type === "toggle" && (
                        <details className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <summary className="text-white font-medium cursor-pointer">
                            {getText(block.toggle?.rich_text)}
                          </summary>
                        </details>
                      )}
                      {/* Fallback for unsupported block types */}
                      {![
                        "image",
                        "paragraph",
                        "heading_1",
                        "heading_2",
                        "heading_3",
                        "bulleted_list_item",
                        "numbered_list_item",
                        "quote",
                        "callout",
                        "code",
                        "divider",
                        "toggle",
                      ].includes(block.type) && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <p className="text-xs text-yellow-400 font-mono mb-2">
                            Unsupported block type: {block.type}
                          </p>
                          {block[block.type]?.rich_text && (
                            <p className="text-slate-300 text-sm">
                              {getText(block[block.type].rich_text)}
                            </p>
                          )}
                          <details className="mt-2">
                            <summary className="text-xs text-slate-500 cursor-pointer">
                              View raw data
                            </summary>
                            <pre className="text-xs text-slate-400 mt-2 overflow-x-auto">
                              {JSON.stringify(block, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
