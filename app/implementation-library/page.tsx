"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink, Tag, Calendar, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ImplementationLibraryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [pageBlocks, setPageBlocks] = useState<any[]>([]);

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
    try {
      const res = await fetch(`/api/notion/page?pageId=${page.id}`);
      const blocks = await res.json();
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

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white/80" />
            <h1 className="text-lg font-semibold tracking-tight">Implementation Library</h1>
          </div>
          <div className="w-32" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {loading ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white/80" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
            <p className="text-sm text-slate-500">Fetching implementations</p>
          </div>
        ) : error ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Implementation Library</h2>
                <p className="text-sm text-slate-500">Configuration required</p>
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <p className="font-medium text-amber-400 mb-3">⚠️ Configuration Required</p>
              <p className="text-sm text-slate-400 mb-3">{error}</p>
              <p className="text-sm text-slate-600 mb-4">
                Add NOTION_API_KEY and NOTION_DATABASE_ID to your .env.local file
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-colors text-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white/80" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Implementations Found</h2>
            <p className="text-sm text-slate-500">
              No entries found
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Implementation Library</h2>
              <p className="text-sm text-slate-500">
                {entries.length} implementation{entries.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => openPage(entry)}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all hover:bg-white/10 cursor-pointer"
                >
                  {/* Thumbnail if image exists */}
                  {(entry.coverImage || (entry.mediaFiles && entry.mediaFiles.length > 0)) && (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-white/5 border border-white/10 mb-3">
                      <img
                        src={entry.coverImage || entry.mediaFiles[0]}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                    </div>
                    <Link
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                    </Link>
                  </div>

                  <h3 className="text-base text-white font-semibold mb-3 line-clamp-2 min-h-[3rem] group-hover:text-white/90">
                    {entry.title}
                  </h3>

                  <div className="space-y-2">
                    {entry.status && (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-md border border-white/10 text-xs font-medium">
                          {entry.status}
                        </span>
                      </div>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        <span className="text-xs text-slate-500 truncate">
                          {entry.tags.slice(0, 3).join(", ")}
                          {entry.tags.length > 3 && ` +${entry.tags.length - 3}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                      <Calendar className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      <span className="text-xs text-slate-600">
                        {new Date(entry.lastEdited).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}
      </div>

      {/* Full-screen view for page content */}
      {selectedPage && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-hidden flex flex-col">
          {/* Header with back button */}
          <div className="flex items-center gap-4 p-6 border-b border-white/10">
            <button
              onClick={() => setSelectedPage(null)}
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
