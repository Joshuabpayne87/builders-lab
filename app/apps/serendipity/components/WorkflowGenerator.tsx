"use client";

import { useState, useRef } from 'react';
import { ContentFormat, FileData } from '@/lib/serendipity-types';
import { CONTENT_FRAMEWORKS } from '@/lib/serendipity-constants';
import { generateCustomContent, generatePostImage } from '@/lib/serendipity-service';
import {
  Wand2, Loader2, Copy, FileText, Link as LinkIcon, Upload, X,
  Image as ImageIcon, Download, Lightbulb, MessageSquare, Target, Zap, Layout, Sparkles
} from 'lucide-react';

import { saveToKnowledgeBase } from '@/lib/knowledge-client';

export default function WorkflowGenerator() {
  const [mode, setMode] = useState<'topic' | 'source' | null>(null);
  const [activeFormat, setActiveFormat] = useState<ContentFormat>('linkedin');

  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('how-to');
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");

  const [sourceContext, setSourceContext] = useState("");
  const [instructions, setInstructions] = useState("");
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showImagePrompt, setShowImagePrompt] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractDocxText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (e) {
      console.error("Docx extraction failed", e);
      throw new Error("Could not extract text from DOCX");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    setFileData(null);

    try {
      const isDocx = file.name.endsWith('.docx');
      const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');

      if (isDocx) {
        const text = await extractDocxText(file);
        setFileData({
          name: file.name,
          mimeType: 'text/plain',
          data: text,
          isText: true
        });
      } else if (isTxt) {
        const text = await file.text();
        setFileData({
          name: file.name,
          mimeType: 'text/plain',
          data: text,
          isText: true
        });
      } else if (isPdf || isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setFileData({
            name: file.name,
            mimeType: file.type,
            data: base64String,
            isText: false
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert("Unsupported file type. Please upload PDF, DOCX, TXT, or Image.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing file. Please try again.");
    } finally {
      setFileLoading(false);
    }
  };

  const clearFile = () => {
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!mode) return;
    setGenerating(true);
    setGeneratedContent("");
    setGeneratedImage(null);
    setShowImagePrompt(false);

    try {
      const result = await generateCustomContent({
        mode,
        format: activeFormat,
        topic,
        audience,
        goal,
        frameworkId: selectedFrameworkId,
        sourceContext,
        fileData,
        instructions
      });
      setGeneratedContent(result || "Error generating content.");
      if (result) {
        setShowImagePrompt(true);
        // Auto-save to Knowledge Base
        saveToKnowledgeBase({
          content: `Serendipity Workflow (${activeFormat.toUpperCase()}):\n\n${result.substring(0, 1500)}...`,
          sourceApp: 'serendipity',
          sourceType: 'content_workflow',
          metadata: {
            mode,
            topic: topic || "Source Based",
            framework: selectedFrameworkId,
            format: activeFormat
          }
        });
      }
    } catch (e) {
      setGeneratedContent("Error: Could not generate content. Please check API Key.");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedContent) return;
    setShowImagePrompt(false);
    setGeneratingImage(true);
    try {
      const imgBase64 = await generatePostImage(generatedContent);
      setGeneratedImage(imgBase64);
    } catch (e) {
      console.error(e);
      alert("Failed to generate image.");
    } finally {
      setGeneratingImage(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const resetForm = () => {
    setMode(null);
    setGeneratedContent("");
    setGeneratedImage(null);
    setFileData(null);
    setShowImagePrompt(false);
  };

  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-8">
        <div className="text-center space-y-4">
           <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
             Imagine with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Serendipity</span>
           </h2>
           <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
             Unleash your imagination through collaborative storytelling. Choose a path to begin your creation journey.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <button
             onClick={() => setMode('topic')}
             className="group relative overflow-hidden glass-panel rounded-3xl p-10 text-left transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center text-fuchsia-400 mb-8 border border-white/5 shadow-inner">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">Framework Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Construct high-performing content using proven psychological structures like "The Context Engine" or "Case Study".
              </p>

              <div className="mt-8 flex items-center text-xs font-bold text-violet-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                Explore Now <span className="ml-2">&rarr;</span>
              </div>
           </button>

           <button
             onClick={() => setMode('source')}
             className="group relative overflow-hidden glass-panel rounded-3xl p-10 text-left transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-8 border border-white/5 shadow-inner">
                <Layout className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">Source Alchemist</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Transmute existing documents (PDF, DOCX) or URLs into entirely new formats.
              </p>

              <div className="mt-8 flex items-center text-xs font-bold text-cyan-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                Start Remixing <span className="ml-2">&rarr;</span>
              </div>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={resetForm}
        className="text-xs font-bold text-slate-500 hover:text-fuchsia-400 flex items-center mb-6 transition-colors uppercase tracking-widest"
      >
        &larr; Back to Hub
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="space-y-6">
           <div className="glass-panel rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center space-x-4 mb-8">
                 <div className={`p-3 rounded-xl border border-white/10 shadow-lg ${mode === 'topic' ? 'bg-violet-500/20 text-violet-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                    {mode === 'topic' ? <Lightbulb className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        {mode === 'topic' ? 'Crafting Parameters' : 'Source Injection'}
                    </h2>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        {mode === 'topic' ? 'Define your narrative' : 'Upload knowledge base'}
                    </p>
                 </div>
              </div>

              {mode === 'topic' ? (
                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-4">
                      {CONTENT_FRAMEWORKS.map(fw => (
                        <button
                          key={fw.id}
                          onClick={() => setSelectedFrameworkId(fw.id)}
                          className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                            selectedFrameworkId === fw.id
                            ? 'bg-violet-600/20 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center mb-2">
                             <fw.icon className={`w-4 h-4 mr-2 ${selectedFrameworkId === fw.id ? 'text-fuchsia-400' : 'text-slate-500'}`} />
                             <span className="text-[10px] font-bold uppercase tracking-wider">{fw.label}</span>
                          </div>
                          <p className="text-[10px] opacity-70 leading-relaxed font-light">{fw.description}</p>
                        </button>
                      ))}
                   </div>

                   <div className="space-y-5">
                    <div className="group">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-violet-400 transition-colors">
                          Core Subject
                        </label>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="What are we exploring today?"
                          className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-700"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-violet-400 transition-colors flex items-center">
                          <Target className="w-3 h-3 mr-1" /> Target Demographic
                        </label>
                        <input
                          type="text"
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          placeholder="Who needs to hear this?"
                          className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-700"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-violet-400 transition-colors flex items-center">
                          <Zap className="w-3 h-3 mr-1" /> Desired Outcome
                        </label>
                        <textarea
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          placeholder="What is the key takeaway?"
                          rows={2}
                          className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-700 resize-none"
                        />
                    </div>
                   </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Digital Source
                      </label>

                      <div className="relative mb-4 group">
                        <LinkIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                          type="text"
                          placeholder="Paste URL..."
                          value={sourceContext}
                          onChange={(e) => setSourceContext(e.target.value)}
                          className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700"
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.docx"
                          className="hidden"
                        />

                        {!fileData ? (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={fileLoading}
                            className="w-full border border-dashed border-white/10 bg-white/5 hover:bg-white/10 rounded-xl py-8 flex flex-col items-center justify-center text-sm text-slate-400 transition-all disabled:opacity-50 group"
                          >
                            {fileLoading ? (
                                <Loader2 className="w-6 h-6 mb-2 animate-spin text-cyan-400" />
                            ) : (
                                <Upload className="w-6 h-6 mb-2 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            )}
                            <span className="font-medium">{fileLoading ? "Analyzing..." : "Drop Document Here"}</span>
                            <span className="text-xs text-slate-600 mt-1">PDF, DOCX, TXT, Image</span>
                          </button>
                        ) : (
                          <div className="w-full bg-cyan-900/10 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between shadow-inner">
                            <div className="flex items-center overflow-hidden">
                              <div className="p-2 bg-cyan-500/10 rounded-lg mr-3">
                                <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-cyan-100 truncate">{fileData.name}</span>
                                {fileData.isText && <span className="text-[10px] text-cyan-500/70 uppercase font-bold tracking-wider">Processed Text</span>}
                              </div>
                            </div>
                            <button onClick={clearFile} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="group">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-cyan-400 transition-colors flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" /> Custom Directive
                      </label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="How should we transform this?"
                        rows={3}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700 resize-none"
                      />
                   </div>
                </div>
              )}

              <div className="mt-10 pt-6 border-t border-white/5">
                <div className="flex flex-col mb-6 gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Output Format</span>
                  <div className="flex flex-wrap gap-2 bg-[#0B0E14] rounded-xl p-2 border border-white/5">
                    {(['linkedin', 'twitter', 'instagram', 'tiktok', 'newsletter', 'blog', 'script'] as const).map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setActiveFormat(fmt)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex-grow md:flex-grow-0 ${
                          activeFormat === fmt
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg ring-1 ring-white/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating || fileLoading}
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:shadow-[0_0_30px_rgba(192,38,211,0.4)] text-white rounded-xl font-bold transition-all disabled:opacity-50 transform hover:scale-[1.01] duration-200"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Weaving Content...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-3" />
                      Generate Masterpiece
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>

        <div className="flex flex-col space-y-6">
           <div className="flex flex-col glass-panel rounded-3xl overflow-hidden min-h-[500px] shadow-2xl border border-white/10">
              <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center backdrop-blur-xl">
                 <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                    <span className="font-bold text-slate-200 text-xs uppercase tracking-widest">Output Terminal</span>
                 </div>
                 {generatedContent && (
                    <button onClick={copyToClipboard} className="text-[10px] font-bold bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg flex items-center transition-colors uppercase tracking-wider border border-white/5">
                       <Copy className="w-3 h-3 mr-2" /> Copy
                    </button>
                 )}
              </div>
              <div className="flex-1 p-8 relative">
                 {generatedContent ? (
                    <textarea
                      className="w-full h-full min-h-[400px] bg-transparent border-none resize-none text-slate-200 focus:ring-0 text-sm leading-8 font-light tracking-wide custom-scrollbar"
                      value={generatedContent}
                      readOnly
                    />
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                       <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-6 animate-pulse">
                          <Wand2 className="w-8 h-8 text-fuchsia-300/50" />
                       </div>
                       <p className="text-slate-400 font-light tracking-wide">Awaiting input stream...</p>
                    </div>
                 )}
              </div>
           </div>

           {generatedContent && (
              <div className="glass-panel rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl border border-white/10">
                 <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-fuchsia-400" />
                      <span className="font-bold text-slate-200 text-xs uppercase tracking-widest">Visual Synthesis</span>
                    </div>
                 </div>

                 <div className="p-6">
                    {generatedImage ? (
                       <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                          <img src={generatedImage} alt="Generated visual" className="w-full h-auto" />
                          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-4">
                             <a href={generatedImage} download="post-visual.png" className="flex items-center px-5 py-2.5 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform">
                                <Download className="w-4 h-4 mr-2" /> Download
                             </a>
                             <button onClick={handleGenerateImage} className="flex items-center px-5 py-2.5 glass-panel text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
                                <Wand2 className="w-4 h-4 mr-2" /> Regenerate
                             </button>
                          </div>
                       </div>
                    ) : showImagePrompt && !generatingImage ? (
                      <div className="text-center py-8 bg-gradient-to-b from-violet-500/5 to-transparent rounded-2xl border border-white/5">
                         <div className="w-16 h-16 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full p-[2px] mx-auto mb-6 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                            <div className="w-full h-full bg-[#0B0E14] rounded-full flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-fuchsia-400" />
                            </div>
                         </div>
                         <h4 className="text-xl font-bold text-white mb-2">Visualize this Concept?</h4>
                         <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto font-light">
                           Synthesize a unique 4K illustration matched to your content's theme.
                         </p>
                         <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => setShowImagePrompt(false)}
                              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={handleGenerateImage}
                              className="px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                              Generate
                            </button>
                         </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                         <button
                            onClick={handleGenerateImage}
                            disabled={generatingImage}
                            className="flex items-center justify-center w-full px-4 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl transition-all disabled:opacity-50 text-xs font-bold uppercase tracking-widest group"
                          >
                             {generatingImage ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin text-fuchsia-400" /> Rendering Pixels...</>
                             ) : (
                                <><ImageIcon className="w-4 h-4 mr-2 text-fuchsia-400 group-hover:scale-110 transition-transform" /> Create Visual</>
                             )}
                          </button>
                      </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
