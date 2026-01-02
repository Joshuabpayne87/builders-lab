"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink, Tag, Calendar, X, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";

export function NotionWidget() {
  const [entries, setEntries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [pageBlocks, setPageBlocks] = useState<any[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch("/api/notion/database");
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setEntries(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  async function openPage(page: any) {
    setSelectedPage(page);
    // Fetch page blocks
    try {
      const res = await fetch(`/api/notion/page?pageId=${page.id}`);
      const blocks = await res.json();
      console.log("Page blocks:", blocks);
      // Log unique block types
      const blockTypes = [...new Set(blocks.map((b: any) => b.type))];
      console.log("Block types found:", blockTypes);
      setPageBlocks(blocks);
    } catch (err) {
      console.error("Error fetching page blocks:", err);
      setPageBlocks([]);
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white/80" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-white">Implementation Library</h2>
        </div>
        <p className="text-xs text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white/80" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-white">Implementation Library</h2>
        </div>
        <div className="text-xs text-slate-500 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="font-medium text-amber-400 mb-2">⚠️ Configuration Required</p>
          <p className="mb-2">{error}</p>
          <p className="text-slate-600">
            Add NOTION_API_KEY and NOTION_DATABASE_ID to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white/80" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-white">Implementation Library</h2>
        </div>
        <p className="text-xs text-slate-500">No entries found</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white/80" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-white">Implementation Library</h2>
        </div>
        <Link
          href="/implementation-library"
          className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
        >
          View All
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="block p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10 group cursor-pointer"
            onClick={() => openPage(entry)}
          >
            <div className="flex items-start gap-3">
              {/* Display cover image or first media file as thumbnail */}
              {(entry.coverImage || (entry.mediaFiles && entry.mediaFiles.length > 0)) && (
                <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-white/5 border border-white/10">
                  <img
                    src={entry.coverImage || entry.mediaFiles[0]}
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm text-white font-medium line-clamp-1 group-hover:text-white/90">
                    {entry.title}
                  </h3>
                  <Link
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {entry.status && (
                    <span className="px-2 py-0.5 bg-white/10 text-slate-400 rounded-md border border-white/10">
                      {entry.status}
                    </span>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-600" />
                      <span className="text-slate-500">
                        {entry.tags.slice(0, 2).join(", ")}
                        {entry.tags.length > 2 && ` +${entry.tags.length - 2}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    <span className="text-slate-600">
                      {new Date(entry.lastEdited).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
                {selectedPage.status && (
                  <span className="px-2 py-0.5 bg-white/10 text-slate-400 rounded-md border border-white/10">
                    {selectedPage.status}
                  </span>
                )}
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
                    {!["image", "paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "numbered_list_item", "quote", "callout", "code", "divider", "toggle"].includes(block.type) && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <p className="text-xs text-yellow-400 font-mono mb-2">Unsupported block type: {block.type}</p>
                        {block[block.type]?.rich_text && (
                          <p className="text-slate-300 text-sm">
                            {getText(block[block.type].rich_text)}
                          </p>
                        )}
                        <details className="mt-2">
                          <summary className="text-xs text-slate-500 cursor-pointer">View raw data</summary>
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

      <div className="mt-4 pt-4 border-t border-white/5">
        <Link
          href="/implementation-library"
          className="block text-center text-xs text-slate-500 hover:text-white transition-colors"
        >
          View all implementations →
        </Link>
      </div>
    </div>
  );
}
