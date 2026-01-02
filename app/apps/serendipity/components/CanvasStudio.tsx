"use client";

import React, { useRef, useState, useEffect } from 'react';
import {
  Palette, Upload, Type, Eraser, Download, Video, Wand2,
  RotateCcw, Trash2, MousePointer2, Image as ImageIcon, Loader2, Play, Sparkles
} from 'lucide-react';
import { editImageWithPrompt, generateVideo, generateImage } from '../services/geminiService';

interface CanvasStudioProps {
  initialImage?: string | null;
  onClearInitialImage?: () => void;
}

const CanvasStudio: React.FC<CanvasStudioProps> = ({ initialImage, onClearInitialImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tools: 'brush' | 'text' | 'eraser'
  const [activeTool, setActiveTool] = useState<'brush' | 'text' | 'eraser'>('brush');
  const [brushColor, setBrushColor] = useState('#a855f7'); // Violet 500
  const [brushSize, setBrushSize] = useState(5);
  const [textInput, setTextInput] = useState('Serendipity');

  // Canvas State
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  // Generation State
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        setCtx(context);
        // Initialize dark background
        context.fillStyle = '#020617';
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  useEffect(() => {
    if (initialImage && canvasRef.current && ctx) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        // Clear and draw
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fit logic (same as upload)
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        setBackgroundImage(img);

        if (onClearInitialImage) onClearInitialImage();
      };
      img.src = initialImage;
    }
  }, [initialImage, ctx, onClearInitialImage]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();

    let clientX, clientY;

    // Check if it's a touch event
    if ('touches' in event && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    }
    // Check if it's a mouse event
    else if ('clientX' in event) {
        clientX = (event as React.MouseEvent).clientX;
        clientY = (event as React.MouseEvent).clientY;
    } else {
        return { x: 0, y: 0 };
    }

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;

    // Critical: 'touch-action: none' CSS prevents default scroll, but we ensure here too
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    if (activeTool === 'text') {
      ctx.font = `bold ${brushSize * 5}px Inter, sans-serif`;
      ctx.fillStyle = brushColor;
      ctx.fillText(textInput, x, y);
      setIsDrawing(false); // Text is one-click
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx || activeTool === 'text') return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = brushSize;
    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#020617';
    } else {
      ctx.strokeStyle = brushColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ctx && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        // Center and fit image
        const canvas = canvasRef.current!;
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        setBackgroundImage(img);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setBackgroundImage(null);
    }
  };

  const getCanvasBase64 = () => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL('image/png').split(',')[1];
  };

  const handleGenerateImage = async () => {
    if (!prompt) {
      alert("Please enter a prompt for the image.");
      return;
    }
    setIsProcessing(true);
    setProcessingStatus('Synthesis Initiated...');
    try {
      const base64 = await generateImage(prompt, '16:9');

      const img = new Image();
      img.onload = () => {
        if (ctx && canvasRef.current) {
           ctx.fillStyle = '#020617';
           ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
           ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      };
      img.src = base64;
      setProcessingStatus('Visual Rendered');
    } catch (e) {
      console.error(e);
      alert("Failed to generate image.");
      setProcessingStatus('Error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditImage = async () => {
    // Note: We allow empty prompt because we have a default handler in service now that looks at the drawing
    setIsProcessing(true);
    const isSketchToImage = !prompt || prompt.trim().length === 0;

    setProcessingStatus(isSketchToImage ? 'Reading Text & Transforming Sketch...' : 'Refining Pixels...');

    try {
      const base64 = getCanvasBase64();
      const newImageBase64 = await editImageWithPrompt(prompt, base64);

      const img = new Image();
      img.onload = () => {
        if (ctx && canvasRef.current) {
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      };
      img.src = newImageBase64;
      setProcessingStatus(isSketchToImage ? 'Reality Synthesized' : 'Enhancement Complete');
    } catch (e) {
      console.error(e);
      alert("Failed to edit image. Ensure your API key supports this operation.");
      setProcessingStatus('Error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt) {
      alert("Please enter a prompt for the video.");
      return;
    }
    setIsProcessing(true);
    setGeneratedVideoUrl(null);
    setProcessingStatus('Connecting to Veo Pro...');

    try {
      const base64 = getCanvasBase64();
      setProcessingStatus('Generating Frames...');

      const videoUrl = await generateVideo(prompt, base64);
      setGeneratedVideoUrl(videoUrl);
      setProcessingStatus('Motion Rendered');
    } catch (e) {
      console.error(e);
      setProcessingStatus('Failed');
      alert("Video generation failed. Ensure you have a paid API key selected.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Canvas Studio</h2>
            <p className="text-slate-400 text-sm font-light mt-1">Draw or write text on the canvas, and watch AI turn it into a hyper-realistic image.</p>
         </div>
         <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-white/5"
            >
               <Upload className="w-4 h-4 mr-2" /> Import
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => {
                 const link = document.createElement('a');
                 link.download = 'serendipity-creation.png';
                 link.href = canvasRef.current?.toDataURL() || '';
                 link.click();
              }}
              className="flex items-center px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-violet-500/20"
            >
               <Download className="w-4 h-4 mr-2" /> Export
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Toolbar */}
         <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-8 shadow-xl">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Toolkit</label>
                  <div className="grid grid-cols-3 gap-3">
                     <button
                       type="button"
                       onClick={() => setActiveTool('brush')}
                       className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${activeTool === 'brush' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                     >
                        <Palette className="w-5 h-5 mb-2" />
                        <span className="text-[10px] font-bold uppercase">Brush</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => setActiveTool('text')}
                       className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${activeTool === 'text' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                     >
                        <Type className="w-5 h-5 mb-2" />
                        <span className="text-[10px] font-bold uppercase">Text</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => setActiveTool('eraser')}
                       className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${activeTool === 'eraser' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                     >
                        <Eraser className="w-5 h-5 mb-2" />
                        <span className="text-[10px] font-bold uppercase">Erase</span>
                     </button>
                  </div>
               </div>

               {activeTool === 'text' && (
                 <div className="animate-fadeIn">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Typography</label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none"
                    />
                 </div>
               )}

               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Parameters</label>
                  <div className="flex items-center space-x-4 mb-4">
                     <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                        <input
                            type="color"
                            value={brushColor}
                            onChange={(e) => setBrushColor(e.target.value)}
                            className="relative w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                        />
                     </div>
                     <div className="flex-1">
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={brushSize}
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400"
                        />
                     </div>
                  </div>
               </div>

               <button
                 type="button"
                 onClick={clearCanvas}
                 className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors"
               >
                  <Trash2 className="w-4 h-4 mr-2" /> Reset Canvas
               </button>
            </div>

            {/* Prompt Area */}
            <div className="glass-panel rounded-3xl p-6 shadow-xl">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-fuchsia-400" /> Generative Engine
               </label>
               <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision OR leave empty to automatically transform your sketch into a hyper-realistic photo..."
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white text-sm focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 outline-none resize-none h-28 mb-2 placeholder:text-slate-700"
               />
               <p className="text-[10px] text-slate-500 mb-6 text-right">
                 {prompt ? 'Using Custom Prompt' : 'Mode: Sketch-to-Reality (Reads Canvas Text)'}
               </p>

               <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleEditImage}
                    disabled={isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] text-white border border-white/5 rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center transition-colors"
                  >
                     {isProcessing ? (
                       <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                     ) : (
                       <>
                         <Wand2 className="w-4 h-4 mr-2" />
                         {prompt ? 'Remix with Prompt' : 'Turn Sketch into Reality'}
                       </>
                     )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isProcessing}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center transition-colors"
                  >
                     {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2 text-cyan-400" />}
                     Create From Prompt Only
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateVideo}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center transition-all"
                  >
                     {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Video className="w-4 h-4 mr-2 text-pink-400" />}
                     Generate Veo Video
                  </button>
               </div>

               {isProcessing && (
                  <div className="mt-4 text-center">
                     <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest animate-pulse">{processingStatus}</span>
                  </div>
               )}
            </div>
         </div>

         {/* Canvas Area */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#020617] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
               <div className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-[#0B0E14]/80 backdrop-blur px-3 py-1.5 rounded-lg pointer-events-none border border-white/5">
                  Viewport
               </div>
               <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-auto cursor-crosshair"
                  style={{ aspectRatio: '16/9', touchAction: 'none' }}
               />
            </div>

            {generatedVideoUrl && (
              <div className="glass-panel rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                       <Video className="w-5 h-5 text-pink-400" />
                    </div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">Output Preview</h3>
                 </div>
                 <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-white/10">
                    <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                 </div>
                 <div className="mt-6 flex justify-end">
                    <a
                      href={generatedVideoUrl}
                      download="veo-creation.mp4"
                      className="flex items-center px-6 py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:scale-105 transition-transform"
                    >
                       <Download className="w-4 h-4 mr-2" /> Save to Device
                    </a>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default CanvasStudio;
