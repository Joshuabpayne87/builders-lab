"use client";

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { AnalysisView } from './components/AnalysisView';
import { VariableManager } from './components/VariableManager';
import { analyzePromptWithGemini, rewritePromptWithGemini, extractVariablesWithGemini } from './services/geminiService';
import { AppStep, PromptState } from './types';
import { Play, Sparkles, ArrowRight, CornerDownLeft, FileDown } from 'lucide-react';

const INITIAL_STATE: PromptState = {
  originalPrompt: '',
  refinedPrompt: '',
  analysis: null,
  variableData: null,
  variableValues: {},
  quizAnswers: {},
  isAnalyzing: false,
  isRewriting: false,
  isExtracting: false,
};

export default function PromptStashPage() {
  const [step, setStep] = useState<AppStep>(AppStep.DRAFT);
  const [state, setState] = useState<PromptState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);

  // Styling injection
  const ideStyles = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');

    .bg-ide-bg { background-color: #0f172a; }
    .bg-ide-panel { background-color: #1e293b; }
    .border-ide-border { border-color: #334155; }
    .text-ide-text { color: #e2e8f0; }
    .text-ide-muted { color: #94a3b8; }
    .bg-ide-accent { background-color: #3b82f6; }
    .text-ide-accent { color: #3b82f6; }
    .border-ide-accent { border-color: #3b82f6; }
    .bg-ide-success { background-color: #10b981; }
    .text-ide-success { color: #10b981; }
    .border-ide-success { border-color: #10b981; }
    .bg-ide-warning { background-color: #f59e0b; }
    .text-ide-warning { color: #f59e0b; }
    .border-ide-warning { border-color: #f59e0b; }
    
    .hover\:bg-ide-accent\/40:hover { background-color: rgba(59, 130, 246, 0.4); }
    .bg-ide-accent\/20 { background-color: rgba(59, 130, 246, 0.2); }
    .bg-ide-success\/10 { background-color: rgba(16, 185, 129, 0.1); }
    .bg-red-500\/10 { background-color: rgba(239, 68, 68, 0.1); }
    .bg-ide-bg\/30 { background-color: rgba(15, 23, 42, 0.3); }
    .bg-ide-bg\/50 { background-color: rgba(15, 23, 42, 0.5); }
    .bg-ide-bg\/95 { background-color: rgba(15, 23, 42, 0.95); }
    .bg-ide-panel\/50 { background-color: rgba(30, 41, 59, 0.5); }
    .bg-ide-panel\/30 { background-color: rgba(30, 41, 59, 0.3); }
    .bg-ide-panel\/10 { background-color: rgba(30, 41, 59, 0.1); }

    /* Custom Scrollbar for IDE feel */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a; 
    }
    ::-webkit-scrollbar-thumb {
      background: #334155; 
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569; 
    }
  `;

  const handleAnalyze = async () => {
    if (!state.originalPrompt.trim()) return;
    
    setError(null);
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const result = await analyzePromptWithGemini(state.originalPrompt);
      setState(prev => ({ ...prev, analysis: result, isAnalyzing: false }));
      setStep(AppStep.ANALYSIS);
    } catch (err) {
      setError("Failed to analyze prompt. Please check your internet connection.");
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleRewrite = async () => {
    if (!state.analysis) return;
    
    setError(null);
    setState(prev => ({ ...prev, isRewriting: true }));
    try {
      const rewritten = await rewritePromptWithGemini(state.originalPrompt, state.analysis);
      setState(prev => ({ ...prev, refinedPrompt: rewritten, isRewriting: false }));
      setStep(AppStep.REWRITE);
    } catch (err) {
      setError("Failed to rewrite prompt.");
      setState(prev => ({ ...prev, isRewriting: false }));
    }
  };

  const handleExtractVariables = async () => {
    if (!state.refinedPrompt) return;

    setError(null);
    setState(prev => ({ ...prev, isExtracting: true }));
    try {
      const result = await extractVariablesWithGemini(state.refinedPrompt);
      setState(prev => ({ ...prev, variableData: result, isExtracting: false }));
      setStep(AppStep.VARIABLES);
    } catch (err) {
      setError("Failed to generate template.");
      setState(prev => ({ ...prev, isExtracting: false }));
    }
  };

  const handleRestart = () => {
    if (window.confirm("Start over? This will clear your current progress.")) {
      setState(INITIAL_STATE);
      setStep(AppStep.DRAFT);
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Increased delay to ensure browser acknowledges the download
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ideStyles }} />
      <Layout currentStep={step}>
        {/* Error Toast */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-md shadow-lg z-50 text-sm animate-in fade-in slide-in-from-top-2">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-bold opacity-70 hover:opacity-100">&times;</button>
          </div>
        )}

        {/* VIEW: DRAFT */}
        {step === AppStep.DRAFT && (
          <div className="flex flex-col h-full p-8 max-w-4xl mx-auto w-full justify-center">
             <header className="mb-8">
               <h2 className="text-3xl font-bold mb-2 text-white">New Prompt Session</h2>
               <p className="text-ide-muted">Enter your rough idea below. We'll help you refine it into a professional prompt.</p>
             </header>
             
             <div className="flex-1 max-h-[600px] bg-ide-panel rounded-lg border border-ide-border p-1 flex flex-col shadow-xl">
               <div className="bg-ide-bg/50 px-4 py-2 border-b border-ide-border text-xs text-ide-muted font-mono flex items-center justify-between">
                 <span>input.txt</span>
                 <span>Markdown Supported</span>
               </div>
               <textarea
                 className="flex-1 bg-transparent p-6 outline-none font-mono text-base resize-none text-ide-text placeholder-gray-600"
                 placeholder="Example: Write a blog post about marketing strategies for coffee shops..."
                 value={state.originalPrompt}
                 onChange={(e) => setState(prev => ({ ...prev, originalPrompt: e.target.value }))}
               />
               <div className="p-4 border-t border-ide-border bg-ide-bg/30 flex justify-end">
                 <button
                   onClick={handleAnalyze}
                   disabled={state.isAnalyzing || !state.originalPrompt.trim()}
                   className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${state.isAnalyzing || !state.originalPrompt.trim() 
                     ? 'bg-ide-border text-ide-muted cursor-not-allowed'
                       : 'bg-ide-accent hover:bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                   }`}
                 >
                   {state.isAnalyzing ? (
                     <>
                       <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                       Analyzing...
                     </>
                   ) : (
                     <>
                       Analyze Prompt <ArrowRight size={18} />
                     </>
                   )}
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* VIEW: ANALYSIS */}
        {step === AppStep.ANALYSIS && state.analysis && (
          <AnalysisView 
            analysis={state.analysis}
            onCompleteQuiz={handleRewrite}
            isRewriting={state.isRewriting}
          />
        )}

        {/* VIEW: REWRITE (COMPARISON) */}
        {step === AppStep.REWRITE && (
          <div className="flex flex-col h-full">
             <div className="p-4 border-b border-ide-border bg-ide-panel/50 flex justify-between items-center">
               <h2 className="text-xl font-bold flex items-center gap-2">
                 <Sparkles size={20} className="text-purple-400" />
                 Refined Prompt
               </h2>
               <div className="flex items-center gap-3">
                 <button
                    onClick={() => downloadText(state.refinedPrompt, 'refined-prompt.txt')}
                    className="flex items-center gap-2 bg-ide-panel border border-ide-border hover:bg-white/5 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                    title="Download Prompt"
                 >
                    <FileDown size={16} /> Export
                 </button>
                 <button
                    onClick={handleExtractVariables}
                    disabled={state.isExtracting}
                    className="flex items-center gap-2 bg-ide-success hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                 >
                    {state.isExtracting ? (
                       <>
                         <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                         Building Template...
                       </>
                    ) : (
                       <>
                         Create Dynamic Template <CornerDownLeft size={16} />
                       </>
                    )}
                 </button>
               </div>
             </div>
             
             <div className="flex-1 flex overflow-hidden">
               {/* Original (Read-only) */}
               <div className="flex-1 border-r border-ide-border flex flex-col bg-ide-bg/30">
                  <div className="px-4 py-2 text-xs font-bold text-ide-muted uppercase tracking-wider border-b border-ide-border">Original</div>
                  <div className="flex-1 p-6 overflow-y-auto font-mono text-sm opacity-60">
                     {state.originalPrompt}
                  </div>
               </div>
               
               {/* New (Editable) */}
               <div className="flex-1 flex flex-col bg-ide-panel/10">
                  <div className="px-4 py-2 text-xs font-bold text-purple-400 uppercase tracking-wider border-b border-ide-border bg-purple-500/5">Optimized</div>
                  <textarea 
                    className="flex-1 p-6 overflow-y-auto font-mono text-sm bg-transparent outline-none resize-none text-ide-text"
                    value={state.refinedPrompt}
                    onChange={(e) => setState(prev => ({ ...prev, refinedPrompt: e.target.value }))}
                  />
               </div>
             </div>
          </div>
        )}

        {/* VIEW: VARIABLES */}
        {step === AppStep.VARIABLES && state.variableData && (
          <VariableManager 
            variableResult={state.variableData}
            onRestart={handleRestart}
          />
        )}
      </Layout>
    </>
  );
}