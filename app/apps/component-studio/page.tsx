"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { geminiGenerateContent, geminiGenerateContentStream } from '@/lib/gemini-http';

import { Artifact, Session, ComponentVariation, LayoutOption } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId } from './utils';

import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import {
    ThinkingIcon,
    CodeIcon,
    SparklesIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    GridIcon
} from './components/Icons';
import { Trash2, Clock, History } from 'lucide-react';

import './index.css';
import { saveToKnowledgeBase } from '@/lib/knowledge-client';

export default function ComponentStudioPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('component_studio_sessions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionIndex(parsed.length - 1);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('component_studio_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this session?")) return;
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.setItem('component_studio_sessions', JSON.stringify(newSessions));
    if (currentSessionIndex >= newSessions.length) {
      setCurrentSessionIndex(newSessions.length - 1);
    }
  };

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholders, setPlaceholders] = useState<string[]>(INITIAL_PLACEHOLDERS);

  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | null;
      title: string;
      data: any;
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      inputRef.current?.focus();
  }, []);

  // Fix for mobile: reset scroll when focusing an item to prevent "overscroll" state
  useEffect(() => {
    if (focusedArtifactIndex !== null && window.innerWidth <= 1024) {
        if (gridScrollRef.current) {
            gridScrollRef.current.scrollTop = 0;
        }
        window.scrollTo(0, 0);
    }
  }, [focusedArtifactIndex]);

  // Cycle placeholders
  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
  }, [placeholders.length]);

  // Dynamic placeholder generation on load
  useEffect(() => {
      const fetchDynamicPlaceholders = async () => {
          try {
              const response = await geminiGenerateContent({
                  model: 'gemini-2.0-flash-exp',
                  contents: {
                      role: 'user',
                      parts: [{
                          text: 'Generate 20 creative, short, diverse UI component prompts (e.g. "bioluminescent task list"). Return ONLY a raw JSON array of strings. IP SAFEGUARD: Avoid referencing specific famous artists, movies, or brands.'
                      }]
                  }
              });
              const text = response.text || '[]';
              const jsonMatch = text.match(/[\[][\s\S]*[/\]]/);
              if (jsonMatch) {
                  const newPlaceholders = JSON.parse(jsonMatch[0]);
                  if (Array.isArray(newPlaceholders) && newPlaceholders.length > 0) {
                      const shuffled = newPlaceholders.sort(() => 0.5 - Math.random()).slice(0, 10);
                      setPlaceholders(prev => [...prev, ...shuffled]);
                  }
              }
          } catch (e) {
              console.warn("Silently failed to fetch dynamic placeholders", e);
          }
      };
      setTimeout(fetchDynamicPlaceholders, 1000);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const parseJsonStream = async function* (responseStream: AsyncGenerator<{ text: string }>) {
      let buffer = '';
      for await (const chunk of responseStream) {
          const text = chunk.text;
          if (typeof text !== 'string') continue;
          buffer += text;
          let braceCount = 0;
          let start = buffer.indexOf('{');
          while (start !== -1) {
              braceCount = 0;
              let end = -1;
              for (let i = start; i < buffer.length; i++) {
                  if (buffer[i] === '{') braceCount++;
                  else if (buffer[i] === '}') braceCount--;
                  if (braceCount === 0 && i > start) {
                      end = i;
                      break;
                  }
              }
              if (end !== -1) {
                  const jsonString = buffer.substring(start, end + 1);
                  try {
                      yield JSON.parse(jsonString);
                      buffer = buffer.substring(end + 1);
                      start = buffer.indexOf('{');
                  } catch (e) {
                      start = buffer.indexOf('{', start + 1);
                  }
              } else {
                  break;
              }
          }
      }
  };

  const streamText = async function* (body: ReadableStream<Uint8Array> | null) {
      if (!body) return;
      const reader = body.getReader();
      const decoder = new TextDecoder();
      while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          if (text) yield { text };
      }
      const tail = decoder.decode();
      if (tail) yield { text: tail };
  };

  const handleGenerateVariations = useCallback(async () => {
    const currentSession = sessions[currentSessionIndex];
    if (!currentSession || focusedArtifactIndex === null) return;
    const currentArtifact = currentSession.artifacts[focusedArtifactIndex];

    setIsLoading(true);
    setComponentVariations([]);
    setDrawerState({ isOpen: true, mode: 'variations', title: 'Variations', data: currentArtifact.id });

    try {
        const prompt = `
        You are a master UI/UX designer. Generate 3 RADICAL CONCEPTUAL VARIATIONS of: "${currentSession.prompt}".

        **STRICT IP SAFEGUARD:**
        No names of artists.
        Instead, describe the *Physicality* and *Material Logic* of the UI.

        **CREATIVE GUIDANCE (Use these as EXAMPLES of how to describe style, but INVENT YOUR OWN):**
        1. Example: "Asymmetrical Primary Grid" (Heavy black strokes, rectilinear structure, flat primary pigments, high-contrast white space).
        2. Example: "Suspended Kinetic Mobile" (Delicate wire-thin connections, floating organic primary shapes, slow-motion balance, white-void background).
        3. Example: "Grainy Risograph Press" (Overprinted translucent inks, dithered grain textures, monochromatic color depth, raw paper substrate).
        4. Example: "Volumetric Spectral Fluid" (Generative morphing gradients, soft-focus diffusion, bioluminescent light sources, spectral chromatic aberration).

        **YOUR TASK:**
        For EACH variation:
        - Invent a unique design persona name based on a NEW physical metaphor.
        - Rewrite the prompt to fully adopt that metaphor's visual language.
        - Generate high-fidelity HTML/CSS.

        Required JSON Output Format (stream ONE object per line):
        ` + String.fromCharCode(96) + `{ "name": "Persona Name", "html": "..." }` + String.fromCharCode(96) + `
        `.trim();

        const responseStream = await geminiGenerateContentStream({
            model: 'gemini-2.0-flash-exp',
             contents: [{ parts: [{ text: prompt }], role: 'user' }],
             config: { temperature: 1.2 }
        });

        for await (const variation of parseJsonStream(streamText(responseStream))) {
            if (variation.name && variation.html) {
                // INJECT BOILERPLATE into variation
                const fullHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
                        <style>
                            body { font-family: 'Inter', sans-serif; background: transparent; margin: 0; padding: 20px; color: white; }
                        </style>
                    </head>
                    <body>
                        ${variation.html}
                    </body>
                    </html>
                `;
                setComponentVariations(prev => [...prev, { ...variation, html: fullHtml }]);
            }
        }
    } catch (e: any) {
        console.error("Error generating variations:", e);
    } finally {
        setIsLoading(false);
    }
  }, [sessions, currentSessionIndex, focusedArtifactIndex]);

  const applyVariation = (html: string) => {
      if (focusedArtifactIndex === null) return;
      setSessions(prev => prev.map((sess, i) =>
          i === currentSessionIndex ? {
              ...sess,
              artifacts: sess.artifacts.map((art, j) =>
                j === focusedArtifactIndex ? { ...art, html, status: 'complete' } : art
              )
          } : sess
      ));
      setDrawerState(s => ({ ...s, isOpen: false }));
  };

  const handleShowCode = () => {
      const currentSession = sessions[currentSessionIndex];
      if (currentSession && focusedArtifactIndex !== null) {
          const artifact = currentSession.artifacts[focusedArtifactIndex];
          setDrawerState({ isOpen: true, mode: 'code', title: 'Source Code', data: artifact.html });
      }
  };

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmedInput = promptToUse.trim();

    if (!trimmedInput || isLoading) return;
    if (!manualPrompt) setInputValue('');

    setIsLoading(true);
    const baseTime = Date.now();
    const sessionId = generateId();

    const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
        id: `${sessionId}_${i}`,
        styleName: 'Designing...', 
        html: '',
        status: 'streaming',
    }));

    const newSession: Session = {
        id: sessionId,
        prompt: trimmedInput,
        timestamp: baseTime,
        artifacts: placeholderArtifacts
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length);
    setFocusedArtifactIndex(null);

    try {
        const stylePrompt = `
        Generate 3 distinct, highly evocative design directions for: "${trimmedInput}".

        **STRICT IP SAFEGUARD:**
        Never use artist or brand names. Use physical and material metaphors.

        **CREATIVE EXAMPLES (Do not simply copy these, use them as a guide for tone):**
        - Example A: "Asymmetrical Rectilinear Blockwork" (Grid-heavy, primary pigments, thick structural strokes, Bauhaus-functionalism vibe).
        - Example B: "Grainy Risograph Layering" (Tactile paper texture, overprinted translucent inks, dithered gradients).
        - Example C: "Kinetic Wireframe Suspension" (Floating silhouettes, thin balancing lines, organic primary shapes).
        - Example D: "Spectral Prismatic Diffusion" (Glassmorphism, caustic refraction, soft-focus morphing gradients).

        **GOAL:**
        Return ONLY a raw JSON array of 3 *NEW*, creative names for these directions (e.g. ["Tactile Risograph Press", "Kinetic Silhouette Balance", "Primary Pigment Gridwork"]).
        `.trim();

        const styleResponse = await geminiGenerateContent({
            model: 'gemini-2.0-flash-exp',
            contents: { role: 'user', parts: [{ text: stylePrompt }] }
        });

        let generatedStyles: string[] = [];
        const styleText = styleResponse.text || '[]';
        const jsonMatch = styleText.match(/[\[][\s\S]*[/\]]/);

        if (jsonMatch) {
            try {
                generatedStyles = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("Failed to parse styles, using fallbacks");
            }
        }

        if (!generatedStyles || generatedStyles.length < 3) {
            generatedStyles = [
                "Primary Pigment Gridwork",
                "Tactile Risograph Layering",
                "Kinetic Silhouette Balance"
            ];
        }

        generatedStyles = generatedStyles.slice(0, 3);

        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            return {
                ...s,
                artifacts: s.artifacts.map((art, i) => ({
                    ...art,
                    styleName: generatedStyles[i]
                }))
            };
        }));

        const generateArtifact = async (artifact: Artifact, styleInstruction: string) => {
            try {
                const prompt = `
                You are an award-winning Principal Product Designer. 
                Create a "Best-in-Class", world-level UI component for: "${trimmedInput}".

                **CONCEPTUAL DIRECTION: ${styleInstruction}**

                **VISUAL EXECUTION RULES:**
                1. **Sophisticated Layout**: Avoid generic boxes. Use Bento Grids, Asymmetrical layouts, or layered depth.
                2. **Typography**: Use high-contrast hierarchy. Use "Inter" or "Geist" fonts.
                3. **Advanced CSS**: Use backdrop-blur (glassmorphism), complex gradients, and subtle borders.
                4. **Tailwind Mastery**: Use Tailwind CSS for all styling. Leverage arbitrary values for precision (e.g., bg-[#0a0a0a]).
                5. **Interactivity**: Add smooth hover states and entry animations using CSS transitions.
                6. **Self-Contained**: Return ONLY the inner HTML content. Do NOT include <html> or <body> tags.

                Output ONLY the code content.
                  `.trim();

                const responseStream = await geminiGenerateContentStream({
                    model: 'gemini-2.0-flash-exp',
                    contents: [{ parts: [{ text: prompt }], role: "user" }],
                });

                let accumulatedHtml = '';
                for await (const chunk of streamText(responseStream)) {
                    const text = chunk.text;
                    if (typeof text === 'string') {
                        accumulatedHtml += text;
                        // During streaming, just show raw for feedback
                        setSessions(prev => prev.map(sess =>
                            sess.id === sessionId ? {
                                ...sess,
                                artifacts: sess.artifacts.map(art =>
                                    art.id === artifact.id ? { ...art, html: accumulatedHtml } : art
                                )
                            } : sess
                        ));
                    }
                }

                let finalHtml = accumulatedHtml.trim();
                if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
                if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
                if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

                // INJECT BOILERPLATE (Tailwind + Fonts)
                const fullHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
                        <style>
                            body { font-family: 'Inter', sans-serif; background: transparent; margin: 0; padding: 20px; color: white; }
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                        </style>
                    </head>
                    <body>
                        ${finalHtml}
                    </body>
                    </html>
                `;

                setSessions(prev => prev.map(sess =>
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art =>
                            art.id === artifact.id ? { ...art, html: fullHtml, status: finalHtml ? 'complete' : 'error' } : art
                        )
                    } : sess
                ));

                return { styleName: styleInstruction, html: fullHtml };

            } catch (e: any) {
                console.error('Error generating artifact:', e);
                setSessions(prev => prev.map(sess =>
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art =>
                            art.id === artifact.id ? { ...art, html: `<div style="color: #ff6b6b; padding: 20px;">Error: ${e.message}</div>`, status: 'error' } : art
                        )
                    } : sess
                ));
                return null;
            }
        };

        const results = await Promise.all(placeholderArtifacts.map((art, i) => generateArtifact(art, generatedStyles[i])));
        
        // Auto-save successful generations to Knowledge Base
        const successfulArtifacts = results.filter(r => r !== null && r.html && r.html.length > 100);
        if (successfulArtifacts.length > 0) {
            saveToKnowledgeBase({
                content: `ComponentStudio UI Component for "${trimmedInput}":\n\nStyles: ${successfulArtifacts.map(r => r?.styleName).join(", ")}\n\nCode Snippet (HTML/CSS): ${successfulArtifacts[0]?.html.substring(0, 1000)}...`,
                sourceApp: 'component-studio',
                sourceType: 'ui_component',
                metadata: {
                    prompt: trimmedInput,
                    variations: successfulArtifacts.length
                }
            });
        }

    } catch (e) {
        console.error("Fatal error in generation process", e);
    } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, isLoading, sessions.length]);

  const handleSurpriseMe = () => {
      const currentPrompt = placeholders[placeholderIndex];
      setInputValue(currentPrompt);
      handleSendMessage(currentPrompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Tab' && !inputValue && !isLoading) {
        event.preventDefault();
        setInputValue(placeholders[placeholderIndex]);
    }
  };

  const nextItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex < 2) setFocusedArtifactIndex(focusedArtifactIndex + 1);
      } else {
          if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
      }
  }, [currentSessionIndex, sessions.length, focusedArtifactIndex]);

  const prevItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
      } else {
           if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
      }
  }, [currentSessionIndex, focusedArtifactIndex]);

  const isLoadingDrawer = isLoading && drawerState.mode === 'variations' && componentVariations.length === 0;

  const hasStarted = sessions.length > 0 || isLoading;
  const currentSession = sessions[currentSessionIndex];

  let canGoBack = false;
  let canGoForward = false;

  if (hasStarted) {
      if (focusedArtifactIndex !== null) {
          canGoBack = focusedArtifactIndex > 0;
          canGoForward = focusedArtifactIndex < (currentSession?.artifacts.length || 0) - 1;
      } else {
          canGoBack = currentSessionIndex > 0;
          canGoForward = currentSessionIndex < sessions.length - 1;
      }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      background: '#09090b',
      overflow: 'hidden'
    }}>
        <SideDrawer
            isOpen={drawerState.isOpen}
            onClose={() => setDrawerState(s => ({...s, isOpen: false}))}
            title={drawerState.title}
        >
            {isLoadingDrawer && (
                 <div className="loading-state">
                     <ThinkingIcon />
                     Designing variations...
                 </div>
            )}

            {drawerState.mode === 'code' && (
                <pre className="code-block"><code>{drawerState.data}</code></pre>
            )}

            {drawerState.mode === 'variations' && (
                <div className="sexy-grid">
                    {componentVariations.map((v, i) => (
                         <div key={i} className="sexy-card" onClick={() => applyVariation(v.html)}>
                             <div className="sexy-preview">
                                 <iframe srcDoc={v.html} title={v.name} sandbox="allow-scripts" />
                             </div>
                             <div className="sexy-label">{v.name}</div>
                         </div>
                    ))}
                </div>
            )}
        </SideDrawer>

        <div className="immersive-app">
            <DottedGlowBackground
                gap={24}
                radius={1.5}
                color="rgba(255, 255, 255, 0.02)"
                glowColor="rgba(255, 255, 255, 0.15)"
                speedScale={0.5}
            />

            <div className={`stage-container ${focusedArtifactIndex !== null ? 'mode-focus' : 'mode-split'}`}>
                 <div className={`empty-state ${hasStarted ? 'fade-out' : ''}`}>
                     <div className="empty-content">
                         <h1>ComponentStudio</h1>
                         <p>Creative UI generation in a flash</p>
                         <div className="flex gap-4 justify-center">
                            <button className="surprise-button" onClick={handleSurpriseMe} disabled={isLoading}>
                                <SparklesIcon /> Surprise Me
                            </button>
                            {sessions.length > 0 && (
                                <button className="surprise-button" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setShowHistory(true)}>
                                    <History className="w-4 h-4 mr-2" /> Library
                                </button>
                            )}
                         </div>
                     </div>
                 </div>

                {sessions.map((session, sIndex) => {
                    let positionClass = 'hidden';
                    if (sIndex === currentSessionIndex) positionClass = 'active-session';
                    else if (sIndex < currentSessionIndex) positionClass = 'past-session';
                    else if (sIndex > currentSessionIndex) positionClass = 'future-session';

                    return (
                        <div key={session.id} className={`session-group ${positionClass}`}>
                            <div className="artifact-grid" ref={sIndex === currentSessionIndex ? gridScrollRef : null}>
                                {session.artifacts.map((artifact, aIndex) => {
                                    const isFocused = focusedArtifactIndex === aIndex;

                                    return (
                                        <ArtifactCard
                                            key={artifact.id}
                                            artifact={artifact}
                                            isFocused={isFocused}
                                            onClick={() => setFocusedArtifactIndex(aIndex)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

             {canGoBack && (
                <button className="nav-handle left" onClick={prevItem} aria-label="Previous">
                    <ArrowLeftIcon />
                </button>
             )}
             {canGoForward && (
                <button className="nav-handle right" onClick={nextItem} aria-label="Next">
                    <ArrowRightIcon />
                </button>
             )}

            <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible' : ''}`}>
                 <div className="active-prompt-label">
                    {currentSession?.prompt}
                 </div>
                 <div className="action-buttons">
                    <button onClick={() => setFocusedArtifactIndex(null)}>
                        <GridIcon /> Grid View
                    </button>
                    <button onClick={handleGenerateVariations} disabled={isLoading}>
                        <SparklesIcon /> Variations
                    </button>
                    <button onClick={handleShowCode}>
                        <CodeIcon /> Source
                    </button>
                 </div>
            </div>

            <div className="floating-input-container">
                <div className={`input-wrapper ${isLoading ? 'loading' : ''}`}>
                    {(!inputValue && !isLoading) && (
                        <div className="animated-placeholder" key={placeholderIndex}>
                            <span className="placeholder-text">{placeholders[placeholderIndex]}</span>
                            <span className="tab-hint">Tab</span>
                        </div>
                    )}
                    {!isLoading ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                    ) : (
                        <div className="input-generating-label">
                            <span className="generating-prompt-text">{currentSession?.prompt}</span>
                            <ThinkingIcon />
                        </div>
                    )}
                    <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim()}>
                        <ArrowUpIcon />
                    </button>
                </div>
            </div>
        </div>

        {/* History Overlay */}
        {showHistory && (
          <div className="absolute inset-0 z-[200] flex justify-center items-center p-4 md:p-20">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowHistory(false)} />
            <div className="relative w-full max-w-4xl max-h-full bg-[#09090b] border border-white/10 rounded-[40px] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <header className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Session Library</h3>
                <button onClick={() => setShowHistory(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center font-bold">&times;</button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.map((sess, idx) => (
                  <div 
                    key={sess.id}
                    onClick={() => { setCurrentSessionIndex(idx); setShowHistory(false); setFocusedArtifactIndex(null); }}
                    className="group relative bg-white/5 border border-white/5 hover:border-white/20 rounded-3xl p-6 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-slate-400" />
                      </div>
                      <button 
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">{sess.prompt}</h4>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">{new Date(sess.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
