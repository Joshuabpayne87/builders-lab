'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Eye, Users } from 'lucide-react';
import { useFunnel } from '../FunnelContext';

interface Analytics {
  funnel: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    lastViewedAt: string | null;
  };
  stats: {
    views: number;
    leads: number;
    conversionRate: string;
    lastLead: string | null;
  };
  recentLeads: Array<{
    id: string;
    createdAt: string;
  }>;
}

export default function FunnelAnalytics() {
  const { funnelId, deployedUrl } = useFunnel();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!funnelId || !deployedUrl) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/funnels/analytics/${funnelId}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');

        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading analytics');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchAnalytics();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);

    return () => clearInterval(interval);
  }, [funnelId, deployedUrl]);

  if (!funnelId || !deployedUrl) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 p-8">
        <div className="text-center space-y-2">
          <BarChart3 className="w-12 h-12 mx-auto opacity-50" />
          <p>Deploy your funnel to see analytics</p>
        </div>
      </div>
    );
  }

  if (isLoading && !analytics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 p-8">
        <div className="text-center">
          <p>Error loading analytics</p>
          <p className="text-xs text-slate-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 p-8">
        <p>No analytics data yet</p>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-900 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Page Views</p>
              <p className="text-2xl font-bold text-white">{analytics.stats.views}</p>
            </div>
            <Eye className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Leads Captured</p>
              <p className="text-2xl font-bold text-white">{analytics.stats.leads}</p>
            </div>
            <Users className="w-5 h-5 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{analytics.stats.conversionRate}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Last Lead</p>
            <p className="text-sm text-slate-300">{analytics.stats.lastLead ? formatDate(analytics.stats.lastLead) : 'No leads yet'}</p>
          </div>
        </div>
      </div>

      {/* Funnel Details */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Funnel Details</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Name:</span>
            <span className="text-slate-300">{analytics.funnel.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Created:</span>
            <span className="text-slate-300">{formatDate(analytics.funnel.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Updated:</span>
            <span className="text-slate-300">{formatDate(analytics.funnel.updatedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Viewed:</span>
            <span className="text-slate-300">{formatDate(analytics.funnel.lastViewedAt)}</span>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      {analytics.recentLeads.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Recent Leads</h3>
          <div className="space-y-2">
            {analytics.recentLeads.map((lead, index) => (
              <div key={lead.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-700/50 last:border-0">
                <span className="text-slate-400">#{analytics.recentLeads.length - index}</span>
                <span className="text-slate-300">{formatDate(lead.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {analytics.stats.views === 0 && (
        <div className="bg-indigo-600/10 border border-indigo-600/30 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-300">
            No views yet. Share your funnel link to start tracking analytics.
          </p>
        </div>
      )}
    </div>
  );
}
