'use client';

import { useState, useEffect } from 'react';
import { Eye, Code2, FileText, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { useFunnel } from '../FunnelContext';
import ReactMarkdown from 'react-markdown';

export default function FunnelPreview() {
  const { strategyDoc, generatedCode, isGenerating } = useFunnel();
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'strategy'>('strategy');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Auto-switch tabs when content arrives
  useEffect(() => {
    if (generatedCode && !isGenerating) {
      setActiveTab('preview');
    } else if (strategyDoc && !generatedCode) {
      setActiveTab('strategy');
    }
  }, [strategyDoc, generatedCode, isGenerating]);

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      {/* Toolbar */}
      <div className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4">
        
        {/* View Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${
              activeTab === 'strategy' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Strategy
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${
              activeTab === 'code' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${
              activeTab === 'preview' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {/* Device Toggles (only for preview) */}
        {activeTab === 'preview' && (
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'desktop' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'mobile' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2">
            {isGenerating ? (
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-xs font-mono text-indigo-400">Generating...</span>
                </div>
            ) : (
                <span className="text-xs font-mono text-slate-500">Ready</span>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'strategy' && (
          <div className="h-full overflow-y-auto p-8 bg-slate-900 text-slate-300">
            {strategyDoc ? (
                <div className="prose prose-invert max-w-2xl mx-auto prose-headings:text-indigo-400 prose-p:text-slate-300 prose-li:text-slate-300">
                    <ReactMarkdown>{strategyDoc}</ReactMarkdown>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-50">
                    <FileText className="w-12 h-12 mb-4 text-slate-600" />
                    <h3 className="text-lg font-medium text-slate-400">No Strategy Yet</h3>
                    <p className="text-sm text-slate-500 mt-2">Chat with the Sales Architect to generate your funnel strategy.</p>
                </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
           <div className="h-full flex items-center justify-center bg-slate-950/50 p-8">
               <div className={`transition-all duration-500 bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-800 ${
                   device === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full max-w-5xl max-h-[800px]'
               }`}>
                   {generatedCode ? (
                       <iframe 
                           srcDoc={generatedCode} // Placeholder until Sandpack is fully live
                           className="w-full h-full border-none"
                           title="Preview"
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
            <div className="h-full bg-[#1e1e1e] text-blue-100 p-4 font-mono text-xs overflow-auto">
                {generatedCode ? (
                    <pre>{generatedCode}</pre>
                ) : (
                    <div className="opacity-50">
                        <p className="text-green-400">// Generating project structure...</p>
                        <p className="text-purple-400">const <span className="text-yellow-200">Funnel</span> = () ={'>'} {'{'}</p>
                        <p className="pl-4 text-slate-400">/* Code will stream here once the Strategy is approved */</p>
                        <p className="text-purple-400">{'}'}</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
