"use client";

import { useState } from 'react';
import { INITIAL_HOOKS, Hook } from '@/lib/serendipity-constants';
import { generateHooks } from '@/lib/serendipity-service';
import { Shuffle, Wand2, Copy, Sparkles, X, Target } from 'lucide-react';

export default function HookLibrary() {
  const [hooks, setHooks] = useState<Hook[]>(INITIAL_HOOKS);
  const [displayedHook, setDisplayedHook] = useState<Hook>(INITIAL_HOOKS[0]);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");

  const getRandomHook = () => {
    const random = hooks[Math.floor(Math.random() * hooks.length)];
    setDisplayedHook(random);
  };

  const handleGenerateMore = async () => {
    setLoading(true);
    try {
      const rawText = await generateHooks(hooks.map(h => h.text), topic);
      const lines = rawText.split('\n').filter(l => l.trim().length > 0);
      const newHooks: Hook[] = lines.map((text, idx) => ({
        id: `gen-${Date.now()}-${idx}`,
        text: text.replace(/^"/, '').replace(/"$/, '').replace(/^- /, '')
      }));

      setHooks(prev => [...newHooks, ...prev]);
      if (newHooks.length > 0) setDisplayedHook(newHooks[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyHook = () => {
    navigator.clipboard.writeText(displayedHook.text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white tracking-tight">Viral Hook Archive</h2>
        <p className="text-slate-400 font-light">Curated attention-grabbing openers for high-velocity content.</p>
      </div>

      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
         <div className="relative glass-panel rounded-[2rem] p-12 md:p-16 flex flex-col items-center text-center shadow-2xl overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

            <div className="absolute top-6 right-6 flex space-x-2">
               <button onClick={copyHook} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/5" title="Copy">
                 <Copy className="w-5 h-5" />
               </button>
            </div>

            <div className="mb-8 p-4 bg-fuchsia-500/10 rounded-2xl border border-fuchsia-500/20 shadow-[0_0_20px_rgba(219,39,119,0.1)]">
               <Sparkles className="w-8 h-8 text-fuchsia-400 animate-pulse" />
            </div>

            <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-8 tracking-tight drop-shadow-xl min-h-[120px] flex items-center justify-center">
              "{displayedHook.text}"
            </h3>

            <div className="w-full max-w-md mb-8 relative group/input z-20">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-xl blur-sm opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                        <Target className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter Topic (e.g. 'Real Estate', 'Crypto', 'Hiring')..."
                      className="w-full bg-[#0B0E14]/90 border border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500/50 transition-all text-sm font-medium tracking-wide shadow-inner"
                    />
                    {topic && (
                        <button
                            onClick={() => setTopic('')}
                            className="absolute right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 z-10 w-full justify-center">
              <button
                onClick={getRandomHook}
                className="flex items-center justify-center px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </button>
              <button
                onClick={handleGenerateMore}
                disabled={loading}
                className="flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {loading ? <Wand2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                {topic ? `Generate for "${topic.slice(0, 15)}${topic.length > 15 ? '...' : ''}"` : 'Generate New'}
              </button>
            </div>
         </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Library Index ({hooks.length})</h4>
        </div>
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
          {hooks.map((hook) => (
            <div
              key={hook.id}
              className="p-5 hover:bg-white/5 transition-colors cursor-pointer group flex justify-between items-center"
              onClick={() => setDisplayedHook(hook)}
            >
              <p className="text-slate-300 group-hover:text-white font-medium text-sm tracking-wide">{hook.text}</p>
              <Copy className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
