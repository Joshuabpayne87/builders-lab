"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { UnravelMode, UnravelResponse, ProcessingStatus, OutputFormat, SavedItem } from './types';
import { unravelUrl, unravelText } from './services/gemini';
import MarkdownRenderer from './components/MarkdownRenderer';
import Button from './components/Button';
import Sidebar from './components/Sidebar';
import { 
  Link as LinkIcon, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  RotateCcw,
  BookOpen,
  Share2,
  Library,
  Bookmark,
  BookmarkCheck,
  Feather,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { saveToKnowledgeBase } from '@/lib/knowledge-client';

export default function UnravelPage() {
  // State
  const [mode, setMode] = useState<UnravelMode>(UnravelMode.URL);
  const [format, setFormat] = useState<OutputFormat>(OutputFormat.BLOG);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [result, setResult] = useState<UnravelResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // History / Saved State
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Track if current result is saved

  useEffect(() => {
    try {
        const stored = localStorage.getItem('unravl_saved');
        setSavedItems(stored ? JSON.parse(stored) : []);
    } catch (e) {
        setSavedItems([]);
    }
  }, []);

  // Check if current result is already in saved items
  useEffect(() => {
    if (result && savedItems.some(item => item.title === result.title && item.summary === result.summary)) {
        setIsSaved(true);
    } else {
        setIsSaved(false);
    }
  }, [result, savedItems]);

  const vintageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Brygada+1918:ital,wght@0,400;0,700;1,400&family=Courier+Prime:wght@400;700&display=swap');

    .unravel-container {
        font-family: 'Courier Prime', monospace;
        background-color: #f4ecd8;
        color: #1a1a1a;
    }
    .font-serif {
        font-family: 'Brygada 1918', serif;
    }
    .font-mono {
        font-family: 'Courier Prime', monospace;
    }
    .bg-paper { background-color: #f4ecd8; }
    .bg-paper-50 { background-color: #ffffff; }
    .bg-paper-100 { background-color: #fcfaf5; }
    .bg-paper-200 { background-color: #f8f5e6; }
    .bg-paper-300 { background-color: #f4ecd8; }
    .bg-paper-400 { background-color: #eaddc5; }
    .bg-paper-500 { background-color: #dcc6a0; }

    .text-ink-900 { color: #000000; }
    .text-ink-800 { color: #1a1a1a; }
    .text-ink-700 { color: #2d2d2d; }
    .text-ink-400 { color: #7a7a7a; }
    .text-ink-300 { color: #aaa; }

    .border-ink-300 { border-color: #aaa; }

    .bg-ink-900 { background-color: #000000; }

    .text-paper-100 { color: #fcfaf5; }

    .text-vintageRed { color: #cc2936; }
    .border-vintageRed { border-color: #cc2936; }
    .bg-vintageRed { background-color: #cc2936; }

    .shadow-hard { box-shadow: 4px 4px 0px 0px #000000; }
    .shadow-hard-sm { box-shadow: 2px 2px 0px 0px #000000; }
    .shadow-hard-lg { box-shadow: 8px 8px 0px 0px #000000; }

    /* Grain Texture */
    .grain:after {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.05;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
  `;

  // Handlers
  const handleUnravel = async () => {
    if (!inputValue.trim()) return;

    // Validate URL if in URL mode
    if (mode === UnravelMode.URL) {
      try {
        new URL(inputValue);
      } catch (_) {
        setErrorMsg("Please enter a valid URL (including https://)");
        return;
      }
    }

    setStatus('processing');
    setErrorMsg(null);
    setResult(null);

    try {
      let response: UnravelResponse;
      if (mode === UnravelMode.URL) {
        response = await unravelUrl(inputValue, format);
      } else {
        response = await unravelText(inputValue, format);
      }
      setResult(response);
      setStatus('success');

      // Auto-save to Knowledge Base (Agent Memory)
      saveToKnowledgeBase({
        content: `Unravel Article: "${response.title}"\n\nSummary: ${response.summary}\n\n${response.markdownContent.substring(0, 1000)}...`,
        sourceApp: 'unravel',
        sourceType: format === OutputFormat.BLOG ? 'blog_article' : 'social_post',
        metadata: {
          title: response.title,
          original_url: response.originalUrl,
          author: response.author
        }
      });

    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
      setStatus('error');
    }
  };

  const handleCopy = useCallback(() => {
    if (!result) return;
    const textToCopy = format === OutputFormat.SOCIAL 
      ? result.markdownContent 
      : `# ${result.title}\n\n${result.markdownContent}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, format]);

  const handleSave = () => {
    if (!result) return;
    
    // Prevent duplicates
    if (savedItems.some(item => item.title === result.title && item.markdownContent === result.markdownContent)) {
        return;
    }

    const newItem: SavedItem = {
        ...result,
        id: Date.now().toString(),
        timestamp: Date.now(),
        format: format
    };

    const updatedItems = [newItem, ...savedItems];
    setSavedItems(updatedItems);
    localStorage.setItem('unravl_saved', JSON.stringify(updatedItems));
    setIsSaved(true);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedItems = savedItems.filter(item => item.id !== id);
    setSavedItems(updatedItems);
    localStorage.setItem('unravl_saved', JSON.stringify(updatedItems));
    
    // If we deleted the currently viewed item, unmark it as saved
    if (result && savedItems.find(item => item.id === id)?.title === result.title) {
        setIsSaved(false);
    }
  };

  const handleLoadItem = (item: SavedItem) => {
    setResult({
        title: item.title,
        markdownContent: item.markdownContent,
        summary: item.summary,
        author: item.author,
        originalUrl: item.originalUrl
    });
    setFormat(item.format);
    setStatus('success');
    setIsSidebarOpen(false);
    // If the saved item has an original URL, we could populate input, but optional
    if (item.originalUrl) {
        setInputValue(item.originalUrl);
        setMode(UnravelMode.URL);
    }
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setInputValue('');
    setErrorMsg(null);
  };

  // UI Components
  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-40 bg-paper/90 backdrop-blur-sm border-b-2 border-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer group" onClick={reset}>
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-ink-700 hover:text-ink-900 mr-4 transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="w-8 h-8 bg-ink-900 rounded border-2 border-black flex items-center justify-center text-paper-100 group-hover:bg-vintageRed transition-colors">
            <Feather size={18} />
          </div>
          <span className="text-2xl font-serif font-bold text-ink-900 tracking-tight">Unravel.</span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
           {status === 'success' && (
             <Button variant="ghost" onClick={reset} className="hidden sm:inline-flex text-sm font-bold">
               <RotateCcw className="w-4 h-4 mr-2" />
               New
             </Button>
           )}
           
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="relative p-2.5 bg-white border-2 border-black text-ink-900 hover:bg-paper-200 rounded-lg transition-colors shadow-hard-sm active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
             title="Library"
           >
             <Library className="w-5 h-5" />
             {savedItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-vintageRed text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-black">
                  {savedItems.length}
                </span>
             )}
           </button>
        </div>
      </div>
    </header>
  );

  const renderHero = () => (
    <div className={`transition-all duration-500 ease-in-out ${status === 'idle' || status === 'processing' || status === 'error' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 hidden'}`}>
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border-2 border-black text-ink-900 text-sm font-bold mb-6 shadow-hard-sm">
            <Sparkles className="w-4 h-4 mr-2 text-vintageRed" />
            <span>THE CONTENT MACHINE</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-serif font-black text-ink-900 tracking-tight mb-6 leading-[0.9]">
            Unravel the web.<br/>
            <span className="text-vintageRed underline decoration-4 decoration-black underline-offset-4">Tell the story.</span>
          </h1>
          <p className="text-xl font-mono text-ink-700 mb-8 max-w-lg mx-auto leading-relaxed">
            Paste any URL or messy thoughts. We'll ink it into a polished blog post or viral social update.
          </p>
        </div>

        <div className="w-full max-w-xl bg-white rounded-xl border-4 border-black shadow-hard-lg overflow-hidden relative">
          
          {/* Tabs */}
          <div className="flex border-b-2 border-black bg-paper-100">
            <button
              onClick={() => setMode(UnravelMode.URL)}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${mode === UnravelMode.URL 
                ? 'bg-white text-ink-900 border-r-2 border-black' 
                : 'text-ink-400 bg-paper-300 hover:bg-paper-200 border-r-2 border-black'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>ANY URL</span>
            </button>
            <button
              onClick={() => setMode(UnravelMode.TEXT)}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${mode === UnravelMode.TEXT 
                ? 'bg-white text-ink-900' 
                : 'text-ink-400 bg-paper-300 hover:bg-paper-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PASTE TEXT</span>
            </button>
          </div>

          {/* Input Area */}
          <div className="p-8">
            
            {/* Input Field */}
            {mode === UnravelMode.URL ? (
              <div className="space-y-4 mb-8">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-ink-900" />
                    </div>
                    <input
                      type="url"
                      className="block w-full pl-12 pr-4 py-4 border-2 border-black rounded-lg leading-5 bg-paper-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:bg-white focus:ring-0 focus:shadow-[4px_4px_0px_0px_#000] transition-all font-mono"
                      placeholder="https://example.com/article..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnravel()}
                    />
                 </div>
                 <p className="text-xs font-bold text-ink-400 pl-1 uppercase tracking-wide">
                   Supports articles, blogs, & threads
                 </p>
              </div>
            ) : (
              <div className="mb-8">
                <textarea
                  className="block w-full p-4 border-2 border-black rounded-lg leading-relaxed bg-paper-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:bg-white focus:ring-0 focus:shadow-[4px_4px_0px_0px_#000] transition-all min-h-[160px] resize-none font-mono"
                  placeholder="Paste your rough draft here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            )}

            {/* Format Selection */}
            <div className="mb-8">
              <label className="block text-xs font-black text-ink-900 uppercase tracking-widest mb-3">
                Output Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormat(OutputFormat.BLOG)}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 text-sm font-bold transition-all ${format === OutputFormat.BLOG
                    ? 'bg-ink-900 border-black text-paper-100 shadow-hard-sm'
                    : 'bg-white border-black text-ink-400 hover:bg-paper-100'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 mr-2 ${format === OutputFormat.BLOG ? 'text-vintageRed' : 'text-ink-400'}`} />
                  BLOG POST
                </button>
                <button
                  onClick={() => setFormat(OutputFormat.SOCIAL)}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 text-sm font-bold transition-all ${format === OutputFormat.SOCIAL
                    ? 'bg-ink-900 border-black text-paper-100 shadow-hard-sm'
                    : 'bg-white border-black text-ink-400 hover:bg-paper-100'
                  }`}
                >
                  <Share2 className={`w-4 h-4 mr-2 ${format === OutputFormat.SOCIAL ? 'text-vintageRed' : 'text-ink-400'}`} />
                  SOCIAL POST
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {errorMsg && (
                <div className="text-vintageRed text-sm font-bold border-l-4 border-vintageRed pl-2">
                  {errorMsg}
                </div>
              )}
              {!errorMsg && <div />} {/* Spacer */}
              
              <Button 
                onClick={handleUnravel} 
                isLoading={status === 'processing'}
                disabled={!inputValue.trim()}
                className="w-full sm:w-auto text-lg"
              >
                <span>UNRAVEL</span>
                {!status && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result || status !== 'success') return null;

    return (
      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="max-w-3xl mx-auto">
          
          {/* Metadata Card */}
          <div className="bg-white rounded-xl p-8 border-4 border-black shadow-hard-lg mb-8 relative">
            
            {/* Decoration Dots */}
            <div className="absolute top-4 right-4 flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <div className="w-2 h-2 rounded-full bg-black"></div>
            </div>

            <div className="flex flex-col gap-6 mb-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-serif font-black text-ink-900 leading-none mb-3">
                  {result.title}
                </h1>
                <div className="flex items-center text-ink-400 font-mono text-sm border-t-2 border-black/10 pt-3 mt-4 inline-block">
                   {result.author && (
                     <>
                       <span className="font-bold text-ink-900 uppercase">{result.author}</span>
                       <span className="mx-3 text-black">•</span>
                     </>
                   )}
                   <span>{format === OutputFormat.BLOG ? 'BLOG ARTICLE' : 'SOCIAL UPDATE'}</span>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex items-center space-x-3 shrink-0">
                 <Button 
                    variant="secondary" 
                    onClick={handleSave} 
                    className={`py-2 px-4 text-sm ${isSaved ? 'bg-paper-200 border-black' : ''}`}
                 >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    <span className="ml-2 hidden sm:inline">{isSaved ? 'SAVED' : 'SAVE'}</span>
                 </Button>
                 <Button variant="secondary" onClick={handleCopy} className="py-2 px-4 text-sm">
                   {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                   <span className="ml-2 hidden sm:inline">{copied ? 'COPIED' : 'COPY'}</span>
                 </Button>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-paper-200 rounded-lg p-5 border-2 border-black border-dashed">
              <div className="flex items-start space-x-3">
                <BookOpen className="w-6 h-6 text-black mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-widest mb-1">
                    {format === OutputFormat.BLOG ? 'Synopsis' : 'Hashtags'}
                  </h3>
                  <p className="text-ink-700 leading-relaxed font-mono">
                    {result.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl px-8 py-12 border-4 border-black shadow-hard-lg">
             <MarkdownRenderer content={result.markdownContent} />
          </div>

          {/* Footer of result */}
          <div className="mt-12 text-center">
            <Button variant="ghost" onClick={reset} className="text-lg underline underline-offset-4 decoration-2">
               Unravel another story
            </Button>
          </div>

        </div>
      </div>
    );
  };

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: vintageStyles }} />
    <div className="unravel-container min-h-screen selection:bg-black selection:text-white grain">
      {renderHeader()}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        items={savedItems}
        onLoad={handleLoadItem}
        onDelete={handleDeleteItem}
      />
      <main className="relative z-10">
        {renderHero()}
        {renderResult()}
      </main>
    </div>
    </>
  );
}