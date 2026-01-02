"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PINNED_SCRIPT } from '../constants';
import { generateCustomContent, generatePostImage } from '../services/geminiService';
import { Mic, Video, Square, Download, Settings, Trash2, Monitor, Eye, EyeOff, Wand2, Loader2, Save, Image as ImageIcon, Sparkles, MonitorUp, Camera, PictureInPicture, Palette, Upload, X, MicOff, VideoOff, RefreshCw, AlertTriangle, Lock } from 'lucide-react';

interface ScriptViewProps {
  onOpenInCanvas: (imageUrl: string) => void;
}

const ScriptView: React.FC<ScriptViewProps> = ({ onOpenInCanvas }) => {
  const [mode, setMode] = useState<'read' | 'studio'>('read');
  const [scriptText, setScriptText] = useState(PINNED_SCRIPT);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Media State
  const [stream, setStream] = useState<MediaStream | null>(null); // Main stream (recording source)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Device Toggle State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Teleprompter State
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [fontSize, setFontSize] = useState(24);
  const [prompterActive, setPrompterActive] = useState(false);

  // Permission Error Handling
  const [permissionError, setPermissionError] = useState(false);
  const [permissionErrorMsg, setPermissionErrorMsg] = useState('');

  // Screen Share State
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Thumbnail State
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null); // Data URL
  const [showRefCamera, setShowRefCamera] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<any>(null);

  // Reference Camera Ref
  const refCameraVideoRef = useRef<HTMLVideoElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  // Composition Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const screenSourceRef = useRef<HTMLVideoElement>(document.createElement('video'));
  const cameraSourceRef = useRef<HTMLVideoElement>(document.createElement('video'));

  // Parse [Section] format from the dynamic scriptText
  const parsedScript = useMemo(() => {
    return scriptText.split('\n').reduce((acc: any[], line) => {
      if (line.trim().startsWith('[')) {
        acc.push({ type: 'header', content: line.replace('[', '').replace(']', '') });
      } else if (line.trim().length > 0) {
        if (acc.length > 0 && acc[acc.length - 1].type === 'header') {
           acc.push({ type: 'text', content: line });
        } else if (acc.length > 0 && acc[acc.length - 1].type === 'text') {
           acc[acc.length - 1].content += '\n' + line;
        } else {
           acc.push({ type: 'text', content: line });
        }
      }
      return acc;
    }, []);
  }, [scriptText]);

  useEffect(() => {
    return () => {
      stopStream();
      stopRefCamera();
      stopScrolling();
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleGenerateScript = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await generateCustomContent({
        mode: 'source',
        format: 'script',
        sourceContext: `TOPIC: ${topic}`,
        instructions: `Write a compelling 45-60 second video script about this topic.
        STRICT FORMATTING RULE: Use [Header] tags for sections.
        Required sections: [Hook], [Value], [Positioning], [Call To Action].
        Do not include scene directions, just the spoken script.`
      });
      if (result) {
        setScriptText(result);
      }
    } catch (error) {
      console.error("Failed to generate script", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    setIsGeneratingThumbnail(true);
    try {
      const userConcept = thumbnailPrompt
        ? `Specific Visual Concept: ${thumbnailPrompt}`
        : "";

      // Pass a larger chunk of script to context to ensure topic is clear
      const context = `
        ${userConcept}
        Video Topic: ${topic || "Business/AI Growth"}
        Full Script: ${scriptText.substring(0, 3000)}
      `;

      // If we have a reference image, strip the data url prefix before sending
      const refBase64 = referenceImage ? referenceImage.split(',')[1] : undefined;

      const url = await generatePostImage(
        context,
        { aspectRatio: "16:9", style: "youtube-thumbnail" },
        refBase64
      );
      setThumbnailUrl(url);
    } catch (e) {
      console.error(e);
      alert("Could not generate thumbnail.");
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  // --- Reference Image Logic ---
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setReferenceImage(ev.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const startRefCamera = async () => {
    setShowRefCamera(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (refCameraVideoRef.current) {
            refCameraVideoRef.current.srcObject = stream;
        }
    } catch(e) {
        console.error("Failed to start reference camera", e);
        alert("Camera access denied.");
        setShowRefCamera(false);
    }
  };

  const captureRefPhoto = () => {
    if (refCameraVideoRef.current) {
        const video = refCameraVideoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/png');
        setReferenceImage(data);
        stopRefCamera();
    }
  };

  const stopRefCamera = () => {
    if (refCameraVideoRef.current && refCameraVideoRef.current.srcObject) {
        (refCameraVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setShowRefCamera(false);
  };
  // -----------------------------

  const startStream = async () => {
    // Clean up existing streams
    stopStream();
    setPermissionError(false);
    setPermissionErrorMsg('');

    try {
      // 1. Try to get Audio AND Video
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      setStream(mediaStream);
      setCameraStream(mediaStream);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }
      setIsScreenSharing(false);
      setIsMicOn(true);
      setIsCameraOn(true);

    } catch (err: any) {
      console.warn("Media access failed (A/V):", err);

      // 2. Fallback: Try Video Only (Maybe user denied mic or has no mic)
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false
        });

        setStream(videoOnlyStream);
        setCameraStream(videoOnlyStream);
        if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = videoOnlyStream;
        }
        setIsScreenSharing(false);
        setIsMicOn(false);
        setIsCameraOn(true);
        // Warn the user but allow video
        // alert("Microphone access denied. Video only mode active.");

      } catch (err2: any) {
         // Both failed
         console.error("Critical Media Failure:", err2);
         setPermissionError(true);

         if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
             setPermissionErrorMsg("Access blocked by browser. Click the lock icon in your URL bar to reset permissions.");
         } else if (err2.name === 'NotFoundError') {
             setPermissionErrorMsg("No camera device found.");
         } else {
             setPermissionErrorMsg("Browser permission policy violation. Please check site settings.");
         }
      }
    }
  };

  const startScreenShare = async () => {
    try {
      // 1. Get Streams
      // Note: We use system audio from displayMedia if available, but primarily want mic
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true
      });

      // Get Mic Stream - Try/Catch to be robust if mic is blocked
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        console.warn("Mic access denied during screen share");
      }

      // Get Camera (Video Only for PiP)
      let camStream = cameraStream;
      if (!camStream || !camStream.active) {
         try {
           camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
           setCameraStream(camStream);
         } catch (e) {
           console.warn("Camera access failed for PiP");
         }
      }

      // 2. Setup Hidden Sources for Canvas
      screenSourceRef.current.srcObject = displayStream;
      screenSourceRef.current.play();

      if (camStream) {
        cameraSourceRef.current.srcObject = camStream;
        cameraSourceRef.current.play();
      }

      // 3. Start Canvas Composition Loop
      const canvas = canvasRef.current;
      if (canvas && camStream) {
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');

        const draw = () => {
            if (!ctx) return;

            // Draw Background (Screen)
            ctx.drawImage(screenSourceRef.current, 0, 0, canvas.width, canvas.height);

            // Draw PiP (Camera)
            const pipWidth = 320;
            const pipHeight = 180;
            const padding = 40;
            const x = canvas.width - pipWidth - padding;
            const y = canvas.height - pipHeight - padding;
            const radius = 16;

            ctx.save();

            // Rounded Rectangle Clip
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + pipWidth - radius, y);
            ctx.quadraticCurveTo(x + pipWidth, y, x + pipWidth, y + radius);
            ctx.lineTo(x + pipWidth, y + pipHeight - radius);
            ctx.quadraticCurveTo(x + pipWidth, y + pipHeight, x + pipWidth - radius, y + pipHeight);
            ctx.lineTo(x + radius, y + pipHeight);
            ctx.quadraticCurveTo(x, y + pipHeight, x, y + pipHeight - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.clip();

            // Draw Camera (Mirrored optionally, but standard is non-mirrored for PiP usually)
            // To mirror: ctx.scale(-1, 1); ctx.drawImage(..., -x - pipWidth, y, ...)
            ctx.drawImage(cameraSourceRef.current, x, y, pipWidth, pipHeight);

            ctx.restore();

            // Draw Border
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 4;
            ctx.stroke();

            animationFrameRef.current = requestAnimationFrame(draw);
        };
        draw();

        // 4. Capture Stream from Canvas
        const compositeStream = canvas.captureStream(30);

        // 5. Add Audio Tracks (Mic + System Audio)
        if (micStream) micStream.getAudioTracks().forEach(track => compositeStream.addTrack(track));
        displayStream.getAudioTracks().forEach(track => compositeStream.addTrack(track));

        // 6. Handle Stop via Browser UI
        displayStream.getVideoTracks()[0].onended = () => {
             stopStream();
             startStream(); // Revert to camera
        };

        setStream(compositeStream);
        if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = compositeStream;
        }
        setIsScreenSharing(true);
        // Reset toggles to 'On' logically for the new composite, though mic stream might need toggle check
        setIsMicOn(!!micStream);
        // Camera stays conceptually on, even if we are sharing screen
      } else {
        // Fallback if no canvas/camera (Just record screen)
        const simpleStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...(micStream ? micStream.getAudioTracks() : [])
        ]);
        setStream(simpleStream);
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = simpleStream;
        setIsScreenSharing(true);
      }

    } catch (err) {
      console.error("Screen share failed or cancelled:", err);
    }
  };

  const stopStream = () => {
    // Stop Animation Loop
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop Hidden Video Sources
    if (screenSourceRef.current.srcObject) {
        (screenSourceRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        screenSourceRef.current.srcObject = null;
    }
    // We don't stop cameraSourceRef here immediately if we want to reuse,
    // but for simplicity we stop everything.

    // Stop Active Streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (cameraStream) {
       cameraStream.getTracks().forEach(track => track.stop());
       setCameraStream(null);
    }
    setIsScreenSharing(false);
  };

  const toggleMode = async (newMode: 'read' | 'studio') => {
    setMode(newMode);
    if (newMode === 'studio') {
      await startStream();
    } else {
      stopStream();
      setVideoUrl(null);
      setRecordedChunks([]);
    }
  };

  const toggleMic = () => {
    if (stream) {
        stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    // If screen sharing, we want to toggle the camera stream used in PiP
    if (isScreenSharing && cameraStream) {
        cameraStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsCameraOn(!isCameraOn);
    }
    // If normal mode, toggle main stream
    else if (stream) {
        stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsCameraOn(!isCameraOn);
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : "";

    const options = mimeType ? { mimeType } : {};

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunks.length === 0) return;
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setRecordedChunks(chunks);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setPrompterActive(true);
      startScrolling();
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      alert("Could not start recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setPrompterActive(false);
      stopScrolling();
    }
  };

  const startScrolling = () => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
      container.scrollTop = 0;
    }
    scrollIntervalRef.current = setInterval(() => {
      if (container) {
        container.scrollTop += scrollSpeed;
      }
    }, 30);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const deleteRecording = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setRecordedChunks([]);
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        if (videoPreviewRef.current && videoPreviewRef.current.readyState >= 1) {
          await videoPreviewRef.current.requestPictureInPicture();
        } else {
          console.warn("Video not ready for PiP");
        }
      }
    } catch (err) {
      console.error("PiP Toggle Failed:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hidden Canvas for Composition */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Reference Camera Modal */}
      {showRefCamera && (
         <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-[#0B0E14] border border-white/10 p-6 rounded-3xl max-w-2xl w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-lg">Capture Reference</h3>
                    <button onClick={stopRefCamera} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black mb-6">
                    <video ref={refCameraVideoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={captureRefPhoto}
                        className="flex items-center px-8 py-3 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        <Camera className="w-5 h-5 mr-2" /> Take Photo
                    </button>
                </div>
            </div>
         </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Lead Magnet Generator</h2>
           <p className="text-slate-400 text-sm mt-1 font-light">Record your "5 AI Workflows" explanation video.</p>
        </div>
        <div className="glass-panel p-1.5 rounded-xl flex shadow-lg">
          <button
            onClick={() => toggleMode('read')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center ${mode === 'read' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Mic className="w-4 h-4 mr-2" /> Scripting
          </button>
          <button
            onClick={() => toggleMode('studio')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center ${mode === 'studio' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Video className="w-4 h-4 mr-2" /> Studio Mode
          </button>
        </div>
      </div>

      {mode === 'read' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
           {/* Generator Sidebar */}
           <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                   <div className="p-2 bg-violet-500/20 rounded-lg">
                      <Wand2 className="w-5 h-5 text-violet-400" />
                   </div>
                   <h3 className="font-bold text-white text-sm uppercase tracking-wide">AI Script Architect</h3>
                </div>

                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-violet-400 transition-colors">
                      Core Concept
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. 3 reasons why cold outreach is dead..."
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 min-h-[120px] resize-none text-sm transition-all placeholder:text-slate-700"
                    />
                  </div>

                  <button
                    onClick={handleGenerateScript}
                    disabled={isGenerating || !topic}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Composing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Script
                      </>
                    )}
                  </button>
                </div>
              </div>
           </div>

           {/* Editor Area */}
           <div className="lg:col-span-2">
              <div className="glass-panel rounded-3xl p-1 shadow-2xl h-full min-h-[600px] flex flex-col relative group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 opacity-20 group-hover:opacity-100 transition-opacity rounded-t-3xl"></div>

                <div className="bg-white/5 p-4 flex justify-between items-center rounded-t-[20px] border-b border-white/5">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Editor Terminal</span>
                   <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 bg-emerald-500/10 px-3 py-1 rounded-full">
                      <Save className="w-3 h-3 mr-1" />
                      <span>Saved</span>
                   </div>
                </div>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="flex-1 w-full bg-[#0B0E14]/50 p-8 text-lg text-slate-200 focus:outline-none resize-none font-sans leading-relaxed rounded-b-[20px] custom-scrollbar"
                  placeholder="Begin writing..."
                />
              </div>
           </div>
        </div>
      ) : (
        /* STUDIO MODE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Video Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-[#000] rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group">

              {/* PERMISSION ERROR OVERLAY */}
              {permissionError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-50 text-center p-10 backdrop-blur-md">
                  <div className="space-y-6 max-w-md">
                    <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                         <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-2xl mb-2">Access Blocked</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {permissionErrorMsg || "Camera or Microphone access was denied."}
                        </p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl text-left border border-white/5">
                        <p className="text-xs text-slate-300 flex items-start">
                            <Lock className="w-3 h-3 mr-2 mt-0.5 text-amber-400 shrink-0" />
                            <span>
                                <strong>How to fix:</strong> Click the <strong>Lock Icon</strong> 🔒 in your browser&apos;s address bar (top left) and toggle <strong>Camera</strong> & <strong>Microphone</strong> to &quot;Allow&quot;. Then refresh the page.
                            </span>
                        </p>
                    </div>

                    <button
                      onClick={startStream}
                      className="px-8 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* MAIN VIDEO ELEMENT (Canvas Composite or Single Camera) */}
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                // Only mirror if using webcam only (not screen share)
                className={`w-full h-full object-cover ${!isScreenSharing ? 'transform -scale-x-100' : ''} ${videoUrl ? 'hidden' : ''}`}
              />

              {/* PLAYBACK ELEMENT */}
              {videoUrl && (
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  playsInline
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover bg-black z-30"
                />
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-6 right-6 flex items-center space-x-3 bg-red-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold animate-pulse z-30 uppercase tracking-widest shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>On Air</span>
                </div>
              )}

              {/* TELEPROMPTER OVERLAY */}
              {!videoUrl && (
                <div
                  ref={scrollContainerRef}
                  className={`absolute inset-0 pointer-events-none flex flex-col items-center pt-[40%] pb-[40%] px-16 overflow-y-auto no-scrollbar transition-opacity duration-300 z-10 ${prompterActive ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'}`}
                >
                   {parsedScript.map((block: any, idx: number) => (
                    <div key={idx} className="text-center max-w-lg mx-auto mb-10 shrink-0">
                      {block.type === 'header' ? (
                        <span className="inline-block px-3 py-1.5 rounded-lg bg-fuchsia-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-4 border border-fuchsia-400/30">
                          {block.content}
                        </span>
                      ) : (
                        <p
                          className="text-white font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,1)]"
                          style={{ fontSize: `${fontSize}px`, lineHeight: 1.5, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                        >
                          {block.content}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="h-[50%] shrink-0 w-full"></div>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between shadow-xl gap-4">
               {!videoUrl ? (
                 <>
                    <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                       {/* REC BUTTON */}
                       {isRecording ? (
                         <button
                           onClick={stopRecording}
                           className="flex-shrink-0 flex items-center px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 uppercase tracking-widest text-xs"
                         >
                           <Square className="w-4 h-4 mr-3 fill-current" /> Stop
                         </button>
                       ) : (
                         <button
                           onClick={startRecording}
                           className="flex-shrink-0 flex items-center px-6 py-3.5 bg-white text-black hover:bg-slate-200 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] uppercase tracking-widest text-xs"
                         >
                           <div className="w-3 h-3 bg-red-600 rounded-full mr-3 animate-pulse" /> Rec
                         </button>
                       )}

                       {/* Device Toggles */}
                       <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                       <button
                         onClick={toggleMic}
                         className={`p-3.5 rounded-xl border transition-all ${!isMicOn ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/5 text-slate-300 hover:text-white'}`}
                         title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                       >
                          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                       </button>

                       <button
                         onClick={toggleCamera}
                         className={`p-3.5 rounded-xl border transition-all ${!isCameraOn ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/5 text-slate-300 hover:text-white'}`}
                         title={isCameraOn ? "Stop Camera" : "Start Camera"}
                       >
                          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                       </button>

                       <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                       {/* Utilities */}
                       <button
                         onClick={() => setPrompterActive(!prompterActive)}
                         className={`p-3.5 rounded-xl border transition-all ${prompterActive ? 'bg-violet-600/20 border-violet-500 text-violet-300' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
                         title="Toggle Teleprompter"
                       >
                          {prompterActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                       </button>

                       <button
                         onClick={togglePiP}
                         className="p-3.5 rounded-xl border bg-white/5 border-white/5 text-slate-400 hover:text-white transition-all"
                         title="Pop-out Window (PiP)"
                       >
                          <PictureInPicture className="w-5 h-5" />
                       </button>

                       <button
                         onClick={isScreenSharing ? startStream : startScreenShare}
                         disabled={isRecording}
                         className={`px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border flex items-center ${isScreenSharing ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
                       >
                          {isScreenSharing ? (
                              <><Camera className="w-4 h-4 mr-2" /> Stop Share</>
                          ) : (
                              <><MonitorUp className="w-4 h-4 mr-2" /> Share Screen</>
                          )}
                       </button>
                    </div>
                 </>
               ) : (
                 <div className="flex items-center w-full justify-between">
                    <div className="flex items-center space-x-3">
                       <button
                         onClick={deleteRecording}
                         className="flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-white/5"
                       >
                         <Trash2 className="w-4 h-4 mr-2" /> Retake
                       </button>
                    </div>

                    <a
                      href={videoUrl}
                      download={`lead-magnet-recording-${Date.now()}.webm`}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-widest"
                    >
                      <Download className="w-4 h-4 mr-2" /> Save Footage
                    </a>
                 </div>
               )}
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Thumbnail Generator */}
            <div className="glass-panel rounded-3xl p-6 shadow-xl">
               <div className="flex items-center space-x-3 mb-6">
                 <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-fuchsia-400" />
                 </div>
                 <h3 className="font-bold text-white text-sm uppercase tracking-wide">Thumbnail Lab</h3>
               </div>

               {thumbnailUrl ? (
                 <div className="space-y-4 animate-fadeIn">
                    <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video group shadow-2xl">
                       <img src={thumbnailUrl} alt="Generated Thumbnail" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={thumbnailUrl} download="thumbnail.png" className="px-6 py-2 bg-white text-black font-bold rounded-lg text-xs uppercase tracking-wider hover:scale-105 transition-transform">Download</a>
                       </div>
                    </div>
                    <div className="flex space-x-2">
                       <button
                         onClick={() => setThumbnailUrl(null)}
                         className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-white/5 uppercase tracking-wider"
                       >
                         New Design
                       </button>
                       <button
                          onClick={() => onOpenInCanvas(thumbnailUrl!)}
                          className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center"
                       >
                          <Palette className="w-4 h-4 mr-2" /> Open in Canvas
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">

                   <div className="group">
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-fuchsia-400 transition-colors">Visual Concept</label>
                     <textarea
                       value={thumbnailPrompt}
                       onChange={(e) => setThumbnailPrompt(e.target.value)}
                       placeholder="Describe the vibe (e.g., Neon Cyberpunk, Shocked Face)..."
                       rows={3}
                       className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white text-xs focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 outline-none resize-none transition-all placeholder:text-slate-700"
                     />
                   </div>

                   {/* Reference Image Input */}
                   <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reference Asset (Optional)</label>
                        {referenceImage && <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">Background Removal Active</span>}
                      </div>

                      {referenceImage ? (
                         <div className="relative rounded-xl overflow-hidden border border-white/10 group/preview h-24 w-full bg-black/50">
                            <img src={referenceImage} alt="Ref" className="w-full h-full object-cover opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                <button onClick={() => setReferenceImage(null)} className="p-2 bg-red-600 text-white rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                         </div>
                      ) : (
                        <div className="flex space-x-2">
                            <button onClick={() => refFileInputRef.current?.click()} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center justify-center">
                                <Upload className="w-4 h-4 mr-2" /> <span className="text-[10px] font-bold uppercase">Upload</span>
                            </button>
                            <input type="file" ref={refFileInputRef} onChange={handleReferenceUpload} className="hidden" accept="image/*" />

                            <button onClick={startRefCamera} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center justify-center">
                                <Camera className="w-4 h-4 mr-2" /> <span className="text-[10px] font-bold uppercase">Take Photo</span>
                            </button>
                        </div>
                      )}
                      {referenceImage ? (
                          <p className="text-[10px] text-emerald-400 mt-2 font-medium">
                             AI will extract the person and replace the background with a viral theme based on your script.
                          </p>
                      ) : (
                          <p className="text-[10px] text-slate-500 mt-2 font-light">
                             Upload a photo to be the star of the thumbnail.
                          </p>
                      )}
                   </div>

                   <button
                     onClick={handleGenerateThumbnail}
                     disabled={isGeneratingThumbnail}
                     className="w-full flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:shadow-[0_0_20px_rgba(219,39,119,0.4)] text-white rounded-xl transition-all disabled:opacity-50 text-xs font-bold uppercase tracking-widest"
                   >
                     {isGeneratingThumbnail ? (
                       <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rendering...</>
                     ) : (
                       <><Sparkles className="w-4 h-4 mr-2" /> Generate Art</>
                     )}
                   </button>
                 </div>
               )}
            </div>

            {/* Prompter Settings */}
            <div className="glass-panel rounded-3xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                 <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Settings className="w-5 h-5 text-cyan-400" />
                 </div>
                 <h3 className="font-bold text-white text-sm uppercase tracking-wide">Telemetry</h3>
              </div>

              <div className="space-y-8">
                 <div className="group">
                    <label className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 group-hover:text-cyan-400 transition-colors">
                       <span>Velocity</span>
                       <span className="text-white bg-white/10 px-2 rounded">{scrollSpeed}x</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={scrollSpeed}
                      onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
                    />
                 </div>

                 <div className="group">
                    <label className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 group-hover:text-cyan-400 transition-colors">
                       <span>Scale</span>
                       <span className="text-white bg-white/10 px-2 rounded">{fontSize}px</span>
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      step="4"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptView;
