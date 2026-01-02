"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Category, VisualVibe, AspectRatio, VoiceTone, MusicStyle, AppState, GeneratedImage, Campaign } from './types';
import { bananaBlitzService } from './services/geminiService';
import ImageCard from './components/ImageCard';

const VIBES: VisualVibe[] = [
  'Corporate Sleek', 'Dark Mode Luxury', 'Minimalist', 'Studio Photography',
  'Hyper-Realistic 3D', 'Cyberpunk', 'Bold Pop-Art', '90s Analog',
  'Kawaii Pastel', 'Bauhaus Grid', 'Brutalist Raw', 'Lo-Fi Chill',
  'Vintage Collage', 'Surreal Dreamscape'
];

const TONES: VoiceTone[] = [
  'Professional', 'Educational', 'Luxury', 'Hype', 'Witty', 'Storyteller',
  'Sarcastic', 'Empathetic', 'Minimalist', 'Mysterious', 'Direct', 'Aggressive'
];

const MUSIC_STYLES: { id: MusicStyle; url: string; label: string }[] = [
  { id: 'None', url: '', label: '🚫 NONE' },
  { id: 'Midnight', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808f3030c.mp3', label: '🌙 MIDNIGHT' },
  { id: 'Peak', url: 'https://cdn.pixabay.com/audio/2023/06/15/audio_51a31940a4.mp3', label: '🔥 PEAK' },
  { id: 'Corporate', url: 'https://cdn.pixabay.com/audio/2022/01/21/audio_31743c589f.mp3', label: '💼 SLEEK' },
  { id: 'Ambient', url: 'https://cdn.pixabay.com/audio/2024/02/08/audio_145d31590b.mp3', label: '✨ AMBIENT' }
];

const INITIAL_STATE: AppState = {
  isGenerating: false,
  isExpanding: false,
  isGeneratingPodcast: false,
  postText: '',
  selectedVibe: 'Corporate Sleek',
  selectedRatio: '1:1',
  selectedTone: 'Professional',
  selectedMusic: 'Midnight',
  referenceImage: null,
  images: [],
  captions: [],
  sources: [],
  history: [],
  error: null,
  progress: 0,
  currentAudioUrl: null
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default function BananaBlitzPage() {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('banana_history');
        return { ...INITIAL_STATE, history: saved ? JSON.parse(saved) : [] };
      } catch (e) { return INITIAL_STATE; }
    }
    return INITIAL_STATE;
  });

  const [blitzStatus, setBlitzStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && state.history.length > 0) {
      localStorage.setItem('banana_history', JSON.stringify(state.history));
    }
  }, [state.history]);

  const handleGenerate = async () => {
    if (!state.postText.trim() || state.isGenerating) return;
    setState(prev => ({
      ...prev, isGenerating: true, error: null, images: [], captions: [],
      sources: [], progress: 0, currentAudioUrl: null
    }));
    setBlitzStatus('STRATEGIZING ASSET SUITE...');

    try {
      const { promptSets, captions, sources } = await bananaBlitzService.generatePrompts(
        state.postText, state.selectedVibe, state.selectedRatio, state.selectedTone, state.referenceImage
      );

      const allImages: GeneratedImage[] = [];
      promptSets.forEach(set => {
        set.prompts.forEach((p, i) => {
          allImages.push({
            id: `${set.category}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            url: '', category: set.category as Category, prompt: p, status: 'pending', aspectRatio: state.selectedRatio
          });
        });
      });

      setState(prev => ({ ...prev, images: allImages, captions, sources }));

      // Sequential rendering with better status feedback
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        const variantNum = allImages.filter(im => im.category === img.category).indexOf(img) + 1;
        setBlitzStatus(`RENDERING: ${img.category.toUpperCase()} V${variantNum}`);

        setState(prev => ({ ...prev, images: prev.images.map(item => item.id === img.id ? { ...item, status: 'generating' } : item) }));

        try {
          const url = await bananaBlitzService.generateImage(img.prompt, state.selectedRatio, state.referenceImage);
          setState(prev => ({
            ...prev, progress: Math.round(((i + 1) / allImages.length) * 100),
            images: prev.images.map(item => item.id === img.id ? { ...item, url, status: 'completed' } : item)
          }));
          await new Promise(r => setTimeout(r, 700)); // Short breather to stay under limits
        } catch (err: any) {
          if (err.message.includes("429")) {
            setBlitzStatus("COOLING DOWN (RATE LIMIT HIT)...");
            await new Promise(r => setTimeout(r, 6000));
            i--; // Retry same image
          } else {
            setState(prev => ({ ...prev, images: prev.images.map(item => item.id === img.id ? { ...item, status: 'error' } : item) }));
          }
        }
      }

      setBlitzStatus('COMPILING HISTORY...');
      setState(prev => {
        const finalImages = prev.images;
        const newCampaign: Campaign = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          postText: prev.postText,
          images: finalImages,
          captions: prev.captions,
          vibe: prev.selectedVibe,
          sources: prev.sources
        };
        return { ...prev, history: [newCampaign, ...prev.history].slice(0, 10) };
      });

    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message || "Blitz failed." }));
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
      setBlitzStatus('');
    }
  };

  const handleGeneratePodcast = async () => {
    if (!state.postText || state.isGeneratingPodcast) return;
    setState(prev => ({ ...prev, isGeneratingPodcast: true, error: null, currentAudioUrl: null }));
    try {
      const base64Audio = await bananaBlitzService.generatePodcastAudio(state.postText);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);

      const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, 24000);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start();
      const renderedBuffer = await offlineCtx.startRendering();

      const encodeWAV = (samples: Float32Array, sampleRate: number) => {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);
        const writeString = (v: DataView, o: number, s: string) => {
          for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
        };
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 32 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);
        for (let i = 0; i < samples.length; i++) {
          const s = Math.max(-1, Math.min(1, samples[i]));
          view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        return buffer;
      };

      const wav = encodeWAV(renderedBuffer.getChannelData(0), 24000);
      const blob = new Blob([wav], { type: 'audio/wav' });
      setState(prev => ({ ...prev, currentAudioUrl: URL.createObjectURL(blob) }));
    } catch (e: any) {
      setState(prev => ({ ...prev, error: "Podcast studio is unavailable. Please try again." }));
    } finally {
      setState(prev => ({ ...prev, isGeneratingPodcast: false }));
    }
  };

  const handleExpandCarousel = async (coverImage: GeneratedImage) => {
    if (!coverImage.url || state.isExpanding) return;
    setState(prev => ({ ...prev, isExpanding: true, error: null }));
    try {
      const innerPrompts = await bananaBlitzService.generateCarouselStrategy(coverImage.url, state.postText);
      const newSlides: GeneratedImage[] = innerPrompts.map((p, i) => ({
        id: `slide-${i}-${Math.random().toString(36).substr(2, 5)}`,
        url: '', category: Category.CAROUSEL_SLIDE, prompt: p, status: 'pending',
        aspectRatio: coverImage.aspectRatio, parentId: coverImage.id, order: i + 1
      }));
      setState(prev => ({ ...prev, images: [...prev.images, ...newSlides] }));

      // Generate carousel slides sequentially
      for (let i = 0; i < newSlides.length; i++) {
        const slide = newSlides[i];
        setState(prev => ({ ...prev, images: prev.images.map(item => item.id === slide.id ? { ...item, status: 'generating' } : item) }));
        try {
          const url = await bananaBlitzService.generateImage(slide.prompt, coverImage.aspectRatio, state.referenceImage);
          setState(prev => ({
            ...prev,
            images: prev.images.map(item => item.id === slide.id ? { ...item, url, status: 'completed' } : item)
          }));
          await new Promise(r => setTimeout(r, 900));
        } catch (err) {
          setState(prev => ({ ...prev, images: prev.images.map(item => item.id === slide.id ? { ...item, status: 'error' } : item) }));
        }
      }
    } catch (e: any) {
      setState(prev => ({ ...prev, error: "Carousel Slide rendering failed." }));
    } finally {
      setState(prev => ({ ...prev, isExpanding: false }));
    }
  };

  const carouselGroups = state.images.filter(i => i.category === Category.CAROUSEL_COVER).map(cover => ({
    cover, slides: state.images.filter(s => s.parentId === cover.id).sort((a, b) => (a.order || 0) - (b.order || 0))
  }));

  const activeMusicTrack = MUSIC_STYLES.find(m => m.id === state.selectedMusic);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex font-sans selection:bg-yellow-400/30">
      <style>{`
        @keyframes logo-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
        @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(0.95); opacity: 0.5; } }
        @keyframes studio-bar { 0% { height: 10%; } 50% { height: 90%; } 100% { height: 10%; } }
        .animate-banana { animation: logo-bounce 1.2s ease-in-out infinite; }
        .animate-radar { animation: pulse-ring 2s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .studio-bar { animation: studio-bar 0.8s ease-in-out infinite; }
      `}</style>

      {/* Sidebar - History */}
      <aside className="hidden lg:flex flex-col w-64 mr-8 border-r border-zinc-900 pr-8 overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recent Blitzes</h3>
          <Link href="/dashboard" className="text-zinc-600 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4 overflow-y-auto max-h-[80vh] scrollbar-hide">
          {state.history.map(camp => (
            <button
              key={camp.id}
              onClick={() => setState(p => ({ ...p, postText: camp.postText, images: camp.images, captions: camp.captions, selectedVibe: camp.vibe }))}
              className="w-full text-left p-4 bg-zinc-900/50 rounded-2xl hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-700"
            >
              <p className="text-xs font-bold text-white line-clamp-1 mb-1">{camp.postText}</p>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-zinc-500">{new Date(camp.timestamp).toLocaleDateString()}</p>
                <p className="text-[9px] font-black text-zinc-700 uppercase">{camp.vibe}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`absolute -inset-2 bg-yellow-400/20 rounded-full animate-radar ${state.isGenerating ? 'block' : 'hidden'}`}></div>
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-2xl shadow-xl animate-banana relative z-10">🍌</div>
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Banana Blitz <span className="text-yellow-400 not-italic">PRO</span></h1>
          </div>
          <div className="bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex">
            {(['1:1', '9:16'] as AspectRatio[]).map(r => (
              <button
                key={r}
                onClick={() => setState(p => ({ ...p, selectedRatio: r }))}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${state.selectedRatio === r ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                {r === '1:1' ? 'SQUARE' : 'STORY'}
              </button>
            ))}
          </div>
        </header>

        {state.error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3">
            <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-black text-xs">!</span>
            {state.error}
          </div>
        )}

        {/* Main Input Section */}
        <section className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[32px] mb-12 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {state.isGenerating && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-20 flex flex-col items-center justify-center">
               <div className="w-24 h-24 mb-6 relative">
                  <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-yellow-400 italic">
                     {state.progress}%
                  </div>
               </div>
               <p className="text-sm font-black text-white tracking-widest uppercase mb-2">{blitzStatus}</p>
               <p className="text-[10px] text-zinc-500 font-bold uppercase">Master Render Suite • Preventing Overload</p>
            </div>
          )}

          <div className="mb-6 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {VIBES.map(v => (
                <button
                  key={v}
                  onClick={() => setState(p => ({ ...p, selectedVibe: v }))}
                  className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap border transition-all ${state.selectedVibe === v ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setState(p => ({ ...p, selectedTone: t }))}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold whitespace-nowrap border transition-colors ${state.selectedTone === t ? 'bg-zinc-100 text-black border-zinc-100' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  TONE: {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <textarea
                value={state.postText}
                onChange={(e) => setState(p => ({ ...p, postText: e.target.value }))}
                placeholder="Talk to me or paste your content..."
                className="w-full bg-black border-2 border-zinc-800 rounded-2xl p-6 h-48 focus:border-yellow-400 focus:outline-none transition-all text-lg shadow-inner scrollbar-hide"
              />
              <div className="absolute bottom-4 right-4 flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!state.postText.trim() || state.isGenerating}
                  className="bg-yellow-400 text-black font-black px-8 py-3 rounded-xl hover:bg-yellow-300 disabled:opacity-30 transition-all shadow-lg min-w-[140px] flex items-center justify-center gap-2"
                >
                   {state.isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full"></div> : 'START BLITZ'}
                </button>
              </div>
            </div>
            <div className="w-full lg:w-48">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = () => setState(p => ({ ...p, referenceImage: r.result as string }));
                    r.readAsDataURL(f);
                  }
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${state.referenceImage ? 'border-yellow-400 bg-yellow-400/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}`}
              >
                {state.referenceImage ? (
                  <div className="relative w-full h-full group">
                    <img src={state.referenceImage} className="w-full h-full object-contain p-2 rounded-lg" alt="Ref" />
                    <div
                      onClick={(e) => { e.stopPropagation(); setState(p => ({ ...p, referenceImage: null })); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      ✕
                    </div>
                  </div>
                ) : (
                  <div className="text-center px-4">
                    <span className="text-2xl mb-2 block">📷</span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase">Style Ref</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Content Suite - Captions & Podcast */}
        {state.captions.length > 0 && (
          <div className="mb-12 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black italic">PRO SUITE</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Mastering (Music):</span>
                  <div className="flex gap-1">
                    {MUSIC_STYLES.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setState(prev => ({ ...prev, selectedMusic: m.id }))}
                        className={`px-2 py-1 rounded text-[8px] font-black transition-all ${state.selectedMusic === m.id ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                      >
                        {m.id.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleGeneratePodcast}
                  disabled={state.isGeneratingPodcast}
                  className="bg-zinc-800 text-white text-[10px] font-black py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all hover:bg-zinc-700 shadow-lg border border-zinc-700"
                >
                   {state.isGeneratingPodcast ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : '🎙️ JOE & JANE PODCAST'}
                </button>
              </div>
            </div>

            {/* Podcast Studio */}
            {(state.currentAudioUrl || state.isGeneratingPodcast) && (
              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 flex gap-1 items-end h-12">
                    {[1,2,3,4,5,6].map(i => <div key={i} className={`w-1 bg-yellow-400/30 rounded-full studio-bar`} style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                 </div>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Podcast Review</p>
                 {state.isGeneratingPodcast ? (
                    <div className="flex-1 bg-black border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-12 min-h-[150px]">
                       <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center animate-radar text-xl mb-4">🎙️</div>
                       <p className="text-[10px] font-black uppercase text-white animate-pulse">Recording multi-speaker session...</p>
                    </div>
                 ) : (
                   <div className="bg-black/80 p-6 rounded-2xl border border-zinc-800/50 flex items-center gap-6">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-black text-xl shadow-lg shadow-yellow-400/20 flex-shrink-0">🎙️</div>
                      <div className="flex-1">
                         <h4 className="text-sm font-black uppercase tracking-tight mb-2">The Blitz Report</h4>
                         <audio src={state.currentAudioUrl!} controls className="w-full filter invert brightness-125 h-10" />
                      </div>
                   </div>
                 )}
              </div>
            )}

            {/* Platform Captions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {state.captions.map(c => (
                <div key={c.platform} className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl group relative hover:border-yellow-400/20 transition-all">
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-3 block">{c.platform}</span>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Images */}
        <div className="space-y-24 pb-20">
          {/* Carousels */}
          {carouselGroups.map(({ cover, slides }) => (
            <div key={cover.id} className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-[40px] space-y-8 shadow-inner">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tighter italic text-yellow-400">Master Carousel</h3>
                {slides.length > 0 && <span className="text-[10px] font-black bg-zinc-800 px-4 py-1.5 rounded-full border border-zinc-700">{slides.length + 1} SLIDES</span>}
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                <div className="flex-none w-72 md:w-80 snap-center">
                  <ImageCard image={cover} onExpandCarousel={() => handleExpandCarousel(cover)} isExpanding={state.isExpanding} />
                </div>
                {slides.map(slide => (
                  <div key={slide.id} className="flex-none w-72 md:w-80 snap-center">
                    <ImageCard image={slide} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Other Categories */}
          {[...Object.values(Category)].filter(cat => cat !== Category.CAROUSEL_COVER && cat !== Category.CAROUSEL_SLIDE).map(cat => {
            const imgs = state.images.filter(i => i.category === cat);
            if (imgs.length === 0) return null;
            return (
              <div key={cat} className="space-y-10">
                <div className="flex items-center gap-4">
                   <h2 className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">{cat}</h2>
                   <div className="h-px bg-zinc-800 flex-1"></div>
                   <span className="text-[10px] font-black text-zinc-500 uppercase">3 Variants</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {imgs.map(img => (
                    <ImageCard key={img.id} image={img} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
