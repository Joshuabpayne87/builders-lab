import React from 'react';
import { GeneratedImage, Category } from '../types';

interface ImageCardProps {
  image: GeneratedImage;
  onExpandCarousel?: () => void;
  isExpanding?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onExpandCarousel, isExpanding }) => {
  const isCarouselCover = image.category === Category.CAROUSEL_COVER;
  const isPortrait = image.aspectRatio === '9:16';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image.url) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `blitz-${image.category.replace(/\s+/g, '-').toLowerCase()}-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`relative group bg-zinc-900 rounded-3xl overflow-hidden border-2 border-zinc-800 transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl hover:border-yellow-400/40 ${isPortrait ? 'aspect-[9/16]' : 'aspect-square'}`}>
      <style>{`
        @keyframes blueprint-pulse { 0% { opacity: 0.1; } 50% { opacity: 0.3; } 100% { opacity: 0.1; } }
        .animate-blueprint { animation: blueprint-pulse 1.5s ease-in-out infinite; }
      `}</style>

      {image.status === 'completed' ? (
        <>
          <img
            src={image.url}
            alt={image.category}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <span className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">
              {image.category}
            </span>
            <p className="text-white text-[10px] leading-tight line-clamp-2 font-medium mb-4 opacity-80">{image.prompt}</p>

            <div className="flex flex-col gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {isCarouselCover && onExpandCarousel && (
                <button
                  onClick={(e) => { e.stopPropagation(); onExpandCarousel(); }}
                  disabled={isExpanding}
                  className="w-full bg-yellow-400 text-black text-[10px] font-black py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isExpanding ? <div className="w-3 h-3 border-2 border-black border-t-transparent animate-spin rounded-full"></div> : '✨ EXPAND STORY'}
                </button>
              )}
              <button
                onClick={handleDownload}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-bold py-2.5 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                DOWNLOAD PNG
              </button>
            </div>
          </div>
        </>
      ) : image.status === 'error' ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-red-500/5">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <span className="text-red-500 text-xl font-bold italic">!</span>
          </div>
          <span className="text-red-500 text-[10px] font-black mb-1 uppercase tracking-tighter">RENDER FAILED</span>
          <p className="text-[10px] text-zinc-500">API RATE LIMIT HIT</p>
        </div>
      ) : image.status === 'generating' ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
             <div className="w-10 h-10 border-2 border-zinc-800 border-t-yellow-400 animate-spin rounded-full mb-6"></div>
             <div className="text-center px-4">
                <p className="text-zinc-500 text-[8px] uppercase font-black tracking-[0.2em] mb-4">Mastering Blueprint</p>
                <p className="text-yellow-400/60 text-[10px] font-medium leading-relaxed animate-blueprint uppercase">{image.prompt}</p>
             </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-900/30 group-hover:bg-zinc-800/40 transition-colors">
          <div className="w-8 h-8 border border-zinc-800 rounded-lg flex items-center justify-center mb-4 opacity-30">
            <span className="text-xs">📍</span>
          </div>
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Layout Pending</p>
          <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
             <div className="w-1/4 h-full bg-zinc-700"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
