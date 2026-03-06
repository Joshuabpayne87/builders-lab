'use client';

import { useState, useEffect } from 'react';
import { Eye, Code2, FileText, Smartphone, Monitor, Rocket, Download, ExternalLink, CheckCircle2, BarChart3, Wand2 } from 'lucide-react';
import { useFunnel } from '../FunnelContext';
import ReactMarkdown from 'react-markdown';
import DeploymentModal from './DeploymentModal';
import CodeEditor from './CodeEditor';
import FunnelAnalytics from './FunnelAnalytics';
import RefinementModal from './RefinementModal';

export default function FunnelPreview() {
  const { strategyDoc, generatedCode, isGenerating, funnelId, deployedUrl, deployedSlug, setGeneratedCode } = useFunnel();
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'outline' | 'analytics'>('outline');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showRefinementModal, setShowRefinementModal] = useState(false);
  const [editedCode, setEditedCode] = useState('');

  useEffect(() => {
    if (generatedCode) {
      setEditedCode(generatedCode);
    }
  }, [generatedCode]);

  useEffect(() => {
    if (generatedCode && !isGenerating) {
      setActiveTab('preview');
    } else if (strategyDoc && !generatedCode) {
      setActiveTab('outline');
    }
  }, [strategyDoc, generatedCode, isGenerating]);

  const handleDownload = () => {
    if (!editedCode) return;

    const blob = new Blob([editedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCodeChange = (newCode: string) => {
    setEditedCode(newCode);
    setGeneratedCode(newCode);
  };

  const handleRefinementComplete = (refinedCode: string) => {
    setEditedCode(refinedCode);
    setGeneratedCode(refinedCode);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-slate-900/50">
        <div className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('outline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'outline'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Outline
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              disabled={!generatedCode}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              disabled={!generatedCode}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Code
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              disabled={!deployedUrl}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </button>
          </div>

          {generatedCode && (
            <div className="flex items-center gap-2">
              {activeTab === 'preview' && (
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setDevice('desktop')}
                    className={`p-1.5 rounded transition-colors ${
                      device === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDevice('mobile')}
                    className={`p-1.5 rounded transition-colors ${
                      device === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={handleDownload}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                title="Download HTML"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDeployModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-medium rounded-lg transition-all"
              >
                <Rocket className="w-3.5 h-3.5" />
                Deploy
              </button>

              {deployedUrl && (
                <>
                  <button
                    onClick={() => setShowRefinementModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs font-medium rounded-lg transition-all border border-purple-600/30"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Refine
                  </button>
                  <a
                    href={deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs font-medium rounded-lg transition-all border border-green-600/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Live
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'outline' && (
            <div className="h-full overflow-y-auto p-8 bg-slate-900">
              {strategyDoc ? (
                <div className="max-w-4xl mx-auto prose prose-invert prose-slate">
                  <ReactMarkdown>{strategyDoc}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center space-y-2">
                    <FileText className="w-12 h-12 mx-auto opacity-50" />
                    <p>Start chatting to create your funnel strategy</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="h-full bg-slate-50">
              <div className={`h-full mx-auto transition-all duration-300 ${
                device === 'desktop' ? 'w-full' : 'w-[375px]'
              }`}>
                {editedCode ? (
                  <iframe
                    srcDoc={editedCode}
                    className="w-full h-full border-0 bg-white"
                    title="Landing Page Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 bg-slate-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-slate-500">Waiting for code generation...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="h-full overflow-hidden">
              {editedCode ? (
                <CodeEditor value={editedCode} onChange={handleCodeChange} />
              ) : (
                <div className="h-full bg-[#1e1e1e] text-blue-100 p-4 font-mono text-xs flex items-center justify-center">
                  <div className="opacity-50">
                    <p className="text-green-400">// Generating project structure...</p>
                    <p className="text-purple-400">const <span className="text-yellow-200">Funnel</span> = () ={'>'} {'{'}</p>
                    <p className="pl-4 text-slate-400">/* Code will stream here once the Strategy is approved */</p>
                    <p className="text-purple-400">{'}'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="h-full overflow-hidden">
              <FunnelAnalytics />
            </div>
          )}
        </div>
      </div>

      <DeploymentModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        htmlCode={editedCode}
        funnelId={funnelId}
      />

      <RefinementModal
        isOpen={showRefinementModal}
        onClose={() => setShowRefinementModal(false)}
        funnelId={funnelId || ''}
        htmlCode={editedCode}
        onRefinementComplete={handleRefinementComplete}
      />
    </>
  );
}
