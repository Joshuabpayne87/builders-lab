"use client";

import React, { useState, useRef } from 'react';
import { InputMode, LensType, ProcessingStatus, TransformationResult, LibraryItem } from './types';
import { transformContent } from './services/geminiService';
import { saveToLibrary } from './services/storage';
import LensSelector from './components/LensSelector';
import MindMap from './components/MindMap';
import Library from './components/Library';
import WorkflowBuilder from './components/WorkflowBuilder';

type ViewState = 'HOME' | 'LIBRARY' | 'WORKFLOW';

export default function InsightLensPage() {
  // State
  const [view, setView] = useState<ViewState>('HOME');
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedLens, setSelectedLens] = useState<LensType | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Styles from original index.html
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --neural-bg: #030014;
      --synapse-cyan: #00f3ff;
      --cortex-purple: #bd00ff;
      --neuron-pink: #ff0055;
    }
    
    .insight-lens-container {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--neural-bg);
      color: #e2e8f0;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Animated Neural Background */
    .neural-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      background: radial-gradient(circle at 50% 50%, #1a103c 0%, #030014 100%);
      overflow: hidden;
      pointer-events: none;
    }
    
    .neural-blob {
      position: absolute;
      filter: blur(80px);
      opacity: 0.6;
      animation: pulse-move 20s infinite alternate;
    }

    .blob-1 { top: -10%; left: -10%; width: 50vw; height: 50vw; background: rgba(120, 50, 255, 0.2); animation-delay: 0s; }
    .blob-2 { bottom: -10%; right: -10%; width: 40vw; height: 40vw; background: rgba(0, 243, 255, 0.15); animation-delay: -5s; }
    .blob-3 { top: 40%; left: 40%; width: 30vw; height: 30vw; background: rgba(255, 0, 85, 0.1); animation-delay: -10s; }

    @keyframes pulse-move {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(10%, 15%) scale(1.1); }
    }

    /* Neural Grid Overlay */
    .grid-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      z-index: 0;
      pointer-events: none;
      mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
    }

    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--cortex-purple); box-shadow: 0 0 10px var(--cortex-purple); }

    /* Utilities */
    .glass-panel {
      background: rgba(10, 10, 20, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .neon-text {
      text-shadow: 0 0 20px rgba(189, 0, 255, 0.5);
    }

    .tech-mono {
      font-family: 'JetBrains Mono', monospace;
    }
  `;

  const handleTransform = async () => {
    if (!selectedLens) return;
    if (inputMode === InputMode.TEXT && !textContent) return;
    if (inputMode === InputMode.URL && !textContent) return;
    if (inputMode === InputMode.FILE && !file) return;

    setStatus('ANALYZING');
    setResult(null);
    setIsSaved(false);

    try {
      let input: string | File = textContent;
      if (inputMode === InputMode.FILE && file) {
        input = file;
      }

      setStatus('TRANSFORMING');
      const data = await transformContent(input, inputMode, selectedLens);
      setResult(data);
      setStatus('COMPLETE');
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
    }
  };

  const handleReset = () => {
    setResult(null);
    setStatus('IDLE');
    setSelectedLens(null);
    setIsSaved(false);
    setView('HOME');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSaveToLibrary = () => {
    if (!result) return;
    
    let title = "Untitled Insight";
    if (inputMode === InputMode.FILE && file) title = file.name;
    else if (textContent) title = textContent.split('\n')[0] || "Text Content";

    saveToLibrary(result, title);
    setIsSaved(true);
  };

  const handleLoadItem = (item: LibraryItem) => {
    setResult(item.result);
    setSelectedLens(item.lens);
    setStatus('COMPLETE');
    setIsSaved(true); // Already saved since it came from library
    setView('HOME');
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="w-full max-w-5xl mx-auto animate-fadeIn pb-20">
        
        {/* Result HUD Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 glass-panel rounded-2xl p-4 md:p-6 border-b-2 border-indigo-500/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-75"></div>
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <span className="text-2xl">
                 {selectedLens === 'PODCAST' ? '🎧' : selectedLens === 'MINDMAP' ? '🧠' : selectedLens === 'VISUAL' ? '👁️' : '📄'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white neon-text">
                {selectedLens} <span className="text-indigo-400 font-light">Output</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-indigo-300 tech-mono">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                PROCESSING_COMPLETE
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0 z-10">
             <button 
                onClick={handleReset}
                className="px-6 py-2.5 text-sm font-bold text-indigo-300 hover:text-white transition-all hover:bg-white/5 rounded-full border border-transparent hover:border-indigo-500/30"
             >
                NEW SCAN
             </button>
             <button 
                disabled={isSaved}
                onClick={handleSaveToLibrary}
                className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all flex items-center gap-2 shadow-lg ${isSaved 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/50 shadow-indigo-500/20'
                }`}
             >
                {isSaved ? 'ENAGRAM SAVED' : 'SAVE TO MEMORY'}
             </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden min-h-[400px]">
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

          {/* VISUAL IMAGE RENDER */}
          {result.type === LensType.VISUAL && result.images && result.images.length > 0 && (
            <div className="mb-8 flex flex-col items-center gap-8">
              {result.images.map((imgBase64, index) => (
                <div key={index} className="relative group w-full max-w-3xl">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                  <img 
                    src={`data:image/png;base64,${imgBase64}`}
                    alt="Generated Visualization"
                    className="relative rounded-xl shadow-2xl w-full border border-white/10 bg-slate-900"
                  />
                </div>
              ))}
            </div>
          )}

          {result.type === LensType.MINDMAP && result.mindMapData && (
            <MindMap data={result.mindMapData} />
          )}

          {result.type === LensType.PODCAST && result.audioData && (
            <div className="flex flex-col items-center justify-center p-8 space-y-12">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition duration-1000 animate-pulse-slow"></div>
                <div className="relative w-48 h-48 rounded-full bg-slate-950 flex items-center justify-center shadow-2xl border border-white/10 z-10">
                   <div className="absolute inset-0 rounded-full border border-indigo-500/30 border-dashed animate-spin-slow"></div>
                   <span className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">🎙️</span>
                </div>
              </div>
              
              <div className="text-center space-y-2 z-10">
                 <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-cyan-200 tracking-tight">Synaptic Audio Stream</h3>
                 <p className="text-indigo-400 tech-mono text-xs tracking-widest uppercase">Hosts: Alex & Sam // 24kHz</p>
              </div>
              
              <audio controls className="w-full max-w-xl h-14 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)] opacity-90 hover:opacity-100 transition-opacity" autoPlay>
                <source src={`data:audio/wav;base64,${result.audioData}`} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>

              {result.text && (
                 <div className="w-full mt-10 text-left bg-black/40 rounded-xl border border-white/10 overflow-hidden relative">
                    <div className="px-6 py-3 bg-white/5 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                           <h4 className="text-indigo-200 font-bold text-xs tech-mono uppercase tracking-widest">Transcript Log</h4>
                        </div>
                    </div>
                    <div className="p-8 max-h-96 overflow-y-auto custom-scrollbar relative z-10">
                        <div className="space-y-6 text-slate-300 leading-relaxed">
                           {result.text.split('\n').map((line, i) => (
                             <div key={i} className={`p-4 rounded-lg border ${line.startsWith('Alex') ? 'bg-indigo-900/20 border-indigo-500/30 ml-4' : 'bg-slate-900/40 border-slate-700/30 mr-4'}`}>
                               <p className="text-sm">{line}</p>
                             </div>
                           ))}
                        </div>
                    </div>
                 </div>
              )}
            </div>
          )}

          {(result.text && result.type !== LensType.MINDMAP && result.type !== LensType.PODCAST) && (
            <div className="prose prose-invert max-w-none prose-headings:text-cyan-300 prose-a:text-pink-400 prose-strong:text-indigo-300">
                <div className="whitespace-pre-wrap leading-relaxed text-slate-200 text-lg">
                  {result.text}
                </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="w-full max-w-lg mx-auto text-center py-32 relative">
      <div className="relative w-40 h-40 mx-auto mb-10">
         {/* Neural Pulse Animation */}
         <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping"></div>
         <div className="absolute inset-4 rounded-full border-2 border-purple-500/30 animate-ping delay-75"></div>
         <div className="absolute inset-8 rounded-full border-2 border-cyan-500/40 animate-ping delay-150"></div>
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 blur-xl animate-pulse"></div>
         </div>
         <div className="absolute inset-0 flex items-center justify-center text-5xl z-10">
            🧠
         </div>
      </div>
      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 mb-4 animate-pulse">
        {status === 'ANALYZING' ? 'MAPPING NEURAL PATHWAYS...' : 'SYNTHESIZING OUTPUT...'}
      </h3>
      <p className="text-indigo-400 tech-mono text-sm tracking-widest uppercase">
        {status === 'ANALYZING' ? 'Gemini 2.5 Flash // Ingesting Data' : 'Generating High-Fidelity Construct'}
      </p>
    </div>
  );

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
    <div className="insight-lens-container min-h-screen text-slate-100 selection:bg-pink-500/30 selection:text-white">
      <div className="neural-bg">
        <div className="neural-blob blob-1"></div>
        <div className="neural-blob blob-2"></div>
        <div className="neural-blob blob-3"></div>
      </div>
      <div className="grid-overlay"></div>
      
      {/* HUD Navigation */}
      <nav className="w-full fixed top-6 z-50 px-4">
        <div className="max-w-4xl mx-auto glass-panel rounded-full h-16 flex items-center justify-between px-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Insight<span className="font-light text-indigo-400">Lens</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
             
             {/* Builder Link */}
             <button 
               onClick={() => setView('WORKFLOW')}
               className={`relative text-sm font-bold tracking-wide transition-all group ${view === 'WORKFLOW' ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
             >
               SYNAPSE_BUILDER
               <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-purple-400 transform transition-transform ${view === 'WORKFLOW' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></span>
             </button>

             {/* Library Link */}
             <button 
               onClick={() => setView('LIBRARY')}
               className={`relative text-sm font-bold tracking-wide transition-all group ${view === 'LIBRARY' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
             >
               MEMORY_CORE
               <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400 transform transition-transform ${view === 'LIBRARY' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></span>
             </button>

             <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs text-indigo-400 tech-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                SYSTEM_ONLINE
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-12 relative z-10">
        
        {view === 'LIBRARY' ? (
          <Library onLoadItem={handleLoadItem} onBack={() => setView('HOME')} />
        ) : view === 'WORKFLOW' ? (
          <WorkflowBuilder onBack={() => setView('HOME')} />
        ) : (
          /* HOME VIEW */
          <>
            {(status === 'IDLE' || status === 'ERROR') && !result ? (
              <div className="flex flex-col gap-12 animate-slideUp">
                
                {/* Hero / Brain Center */}
                <div className="text-center space-y-6 max-w-3xl mx-auto mt-8">
                  <div className="inline-block px-4 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs tech-mono mb-2">
                    NEURAL PROCESSING ENGINE V1.0
                  </div>
                  <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-tight">
                    Upgrade Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 neon-text">
                        Cognitive Bandwidth
                    </span>
                  </h1>
                  <p className="text-lg text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
                    Inject complex data. Output simplified wisdom. <br/>
                    <span className="text-indigo-400">Powered by Gemini 2.5 Flash Neural Networks.</span>
                  </p>
                </div>

                {/* Sensory Input Module */}
                <div className="w-full max-w-4xl mx-auto relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  
                  <div className="relative glass-panel rounded-2xl p-1 overflow-hidden">
                    <div className="flex bg-black/40 rounded-xl mb-1 p-1">
                      {(['TEXT', 'URL', 'FILE'] as InputMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setInputMode(mode)}
                          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all tracking-wide ${inputMode === mode 
                            ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          {mode === 'TEXT' && '📝 RAW_DATA'}
                          {mode === 'URL' && '🔗 WEB_LINK'}
                          {mode === 'FILE' && '📁 FILE_UPLOAD'}
                        </button>
                      ))}
                    </div>

                    <div className="p-6 bg-black/20 rounded-xl min-h-[200px]">
                      {inputMode === 'TEXT' && (
                        <textarea
                          className="w-full h-48 bg-transparent text-lg text-indigo-100 placeholder-indigo-500/50 focus:outline-none resize-none tech-mono"
                          placeholder="// INITIATE DATA STREAM HERE..."
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                        />
                      )}
                      {inputMode === 'URL' && (
                        <div className="flex flex-col h-48 justify-center">
                            <input
                            type="url"
                            className="w-full bg-transparent text-2xl text-cyan-300 placeholder-indigo-800 focus:outline-none border-b-2 border-indigo-500/30 focus:border-cyan-400 transition-colors py-2 text-center"
                            placeholder="https://source.web/data"
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            />
                        </div>
                      )}
                      {inputMode === 'FILE' && (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-48 border-2 border-dashed border-indigo-500/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-900/10 transition-all group"
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.txt,.md,.png,.jpg" 
                            onChange={handleFileChange}
                          />
                          <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.5)]">📄</div>
                          <p className="text-indigo-200 font-medium">UPLOAD_SOURCE_FILE</p>
                          <p className="text-xs text-indigo-500/70 mt-2 tech-mono">SUPPORTED: PDF, TXT, MD, IMG</p>
                          <div className="mt-2 text-cyan-400 font-bold">{file ? `Loaded: ${file.name}` : ''}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Processing Modules (Lenses) */}
                <div className="space-y-8">
                  <div className="text-center">
                     <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-1">Select Processing Module</h3>
                     <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto"></div>
                  </div>
                  <LensSelector selectedLens={selectedLens} onSelect={setSelectedLens} />
                </div>

                {/* Initiate Button */}
                <div className="text-center pb-20">
                  <button
                    disabled={!selectedLens || (inputMode !== 'FILE' && !textContent) || (inputMode === 'FILE' && !file)}
                    onClick={handleTransform}
                    className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-transparent rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {/* Glowing Button Background */}
                    <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 opacity-80 group-hover:opacity-100 blur-md group-hover:blur-lg transition-all duration-300"></span>
                    <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 border border-white/20"></span>
                    
                    <span className="relative flex items-center gap-3 text-lg tracking-wider">
                      INITIATE_SYNAPSE
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </span>
                  </button>
                  {status === 'ERROR' && (
                    <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md mx-auto backdrop-blur-sm">
                       <p className="text-red-400 font-bold tech-mono">⚠ SYSTEM ERROR: PROCESSING FAILED</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              // Processing or Result View
              <div className="min-h-[60vh] flex flex-col items-center w-full">
                {status === 'ERROR' ? (
                  <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md mx-auto backdrop-blur-sm">
                    <p className="text-red-400 font-bold tech-mono">⚠ SYSTEM ERROR: Processing Failed</p>
                    <p className="text-red-200 text-sm mt-2">Please ensure your Gemini API key is correctly configured and try again. Check the browser console for more details.</p>
                    <button onClick={handleReset} className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold">
                      Reset
                    </button>
                  </div>
                ) : status !== 'COMPLETE' ? renderLoading() : renderResult()}
              </div>
            )}
          </>
        )}

      </main>

      <footer className="fixed bottom-0 w-full glass-panel border-t border-white/5 py-4 z-40">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-indigo-400/60 tech-mono">
          <p>NEURAL_INTERFACE_V2.0 // ONLINE</p>
          <p>POWERED_BY_GEMINI</p>
        </div>
      </footer>
      
    </div>
    </>
  );
}