'use client';

import { useEffect, useState } from 'react';
import { Trash2, ExternalLink, Copy, BarChart3, Loader } from 'lucide-react';

interface Funnel {
  id: string;
  name: string;
  domain_slug: string;
  status: string;
  created_at: string;
  view_count: number;
  lead_count: number;
  deployed_url?: string;
}

export default function FunnelManager() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnels();
  }, []);

  const fetchFunnels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/funnels/list');

      if (!response.ok) throw new Error('Failed to fetch funnels');

      const data = await response.json();
      setFunnels(data.funnels || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load funnels');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (!confirm('Are you sure you want to delete this funnel? This cannot be undone.')) return;

    try {
      setDeletingId(funnelId);
      const response = await fetch('/api/funnels/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funnelId }),
      });

      if (!response.ok) throw new Error('Failed to delete funnel');

      setFunnels(funnels.filter(f => f.id !== funnelId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete funnel');
    } finally {
      setDeletingId(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">No funnels yet</div>
        <p className="text-sm text-slate-500">Create your first funnel in the Funnel Builder</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {funnels.map((funnel) => (
          <div
            key={funnel.id}
            className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white truncate">{funnel.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      funnel.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {funnel.status === 'published' ? '🟢 Live' : '⚫ Draft'}
                  </span>
                </div>

                {funnel.deployed_url && (
                  <div className="text-xs text-slate-400 truncate mb-3">
                    {funnel.deployed_url}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {funnel.view_count} views
                  </div>
                  <div>📧 {funnel.lead_count} leads</div>
                  <div>📅 {new Date(funnel.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {funnel.deployed_url && (
                  <>
                    <button
                      onClick={() => copyUrl(funnel.deployed_url!)}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={funnel.deployed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                      title="View live"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                )}

                <button
                  onClick={() => deleteFunnel(funnel.id)}
                  disabled={deletingId === funnel.id}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete funnel"
                >
                  {deletingId === funnel.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
