'use client';

import { useState } from 'react';
import { Eye, Code2, FileText, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';

export default function FunnelPreview() {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'strategy'>('strategy');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

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
            <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-mono text-slate-400">Waiting for input...</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'strategy' && (
          <div className="h-full overflow-y-auto p-8 bg-slate-900">
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-sm">1</div>
                        <h3 className="text-lg font-medium text-slate-200">Funnel Strategy</h3>
                    </div>
                    <div className="ml-11 p-6 rounded-xl border border-slate-800 bg-slate-950/50 text-center space-y-3">
                        <div className="h-12 w-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-400">Your strategy document will appear here after you describe your offer to the Architect.</p>
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 rounded-full">
                            Waiting for approval
                        </button>
                    </div>
                </div>

                <div className="space-y-4 opacity-50">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-sm">2</div>
                        <h3 className="text-lg font-medium text-slate-200">Page Blueprint</h3>
                    </div>
                    <div className="ml-11 h-24 rounded-xl border border-dashed border-slate-800 bg-transparent flex items-center justify-center">
                        <span className="text-xs text-slate-600">Locked until Strategy is approved</span>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
           <div className="h-full flex items-center justify-center bg-slate-950/50 p-8">
               <div className={`transition-all duration-500 bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-800 ${
                   device === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full max-w-5xl max-h-[800px]'
               }`}>
                   <div className="h-full flex flex-col items-center justify-center space-y-4 bg-slate-50">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                       <p className="text-sm text-slate-500">Initializing Sandbox Environment...</p>
                   </div>
               </div>
           </div>
        )}

        {activeTab === 'code' && (
            <div className="h-full bg-[#1e1e1e] text-blue-100 p-4 font-mono text-xs overflow-auto">
                <div className="opacity-50">
                    <p className="text-green-400">// Generating project structure...</p>
                    <p className="text-purple-400">const <span className="text-yellow-200">Funnel</span> = () ={'>'} {'{'}</p>
                    <p className="pl-4 text-slate-400">/* Code will stream here once the Strategy is approved */</p>
                    <p className="text-purple-400">{'}'}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
