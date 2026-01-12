'use client';

import { useState } from 'react';
import { X, Globe, Loader2 } from 'lucide-react';
import { useFunnel } from '../FunnelContext';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  funnelId: string | null;
}

export default function DeploymentModal({ isOpen, onClose, htmlCode, funnelId }: DeploymentModalProps) {
  const { setDeployedUrl, setDeployedSlug } = useFunnel();
  const [slug, setSlug] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDeploy = async () => {
    if (!funnelId) {
      setError('No funnel ID found');
      console.error('[DEPLOY MODAL] No funnel ID');
      return;
    }

    console.log('[DEPLOY MODAL] Starting deployment:', { funnelId, slug: slug || 'auto-generate', htmlCodeLength: htmlCode?.length });

    setIsDeploying(true);
    setError('');

    try {
      const payload = {
        funnelId,
        slug: slug || undefined,
        htmlCode,
      };

      console.log('[DEPLOY MODAL] Sending request:', { funnelId, slug: payload.slug, htmlCodeLength: htmlCode.length });

      const response = await fetch('/api/funnels/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[DEPLOY MODAL] Response status:', response.status);

      const data = await response.json();

      console.log('[DEPLOY MODAL] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      if (data.success) {
        console.log('[DEPLOY MODAL] Deployment successful:', { deployedUrl: data.deployedUrl, slug: data.slug });
        setDeployedUrl(data.deployedUrl);
        setDeployedSlug(data.slug);
        onClose();
      }
    } catch (err: any) {
      console.error('[DEPLOY MODAL] Error:', err);
      setError(err.message || 'Failed to deploy');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Deploy Funnel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Custom Slug (optional)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">/f/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-awesome-funnel"
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Leave empty to auto-generate a unique slug
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isDeploying}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                'Deploy Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
