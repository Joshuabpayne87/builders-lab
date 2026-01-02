"use client";

import React, { useState, useRef, useEffect } from 'react';
import { LensType, WorkflowNode, WorkflowEdge, InputMode, TransformationResult } from '../types';
import { transformContent } from '../services/geminiService';

interface WorkflowBuilderProps {
  onBack: () => void;
}

// --- ICONS & ASSETS ---

const TechIcons: Record<string, React.FC<{ className?: string }>> = {
  // Inputs
  'TEXT': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  ),
  'URL': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  'FILE': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  // Processors
  [LensType.SUMMARY]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  [LensType.OUTLINE]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  [LensType.MINDMAP]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <line x1="12" y1="12" x2="15.8" y2="8.2" />
      <line x1="12" y1="12" x2="8.2" y2="8.2" />
      <line x1="12" y1="12" x2="8.2" y2="15.8" />
      <line x1="12" y1="12" x2="15.8" y2="15.8" />
    </svg>
  ),
  [LensType.PODCAST]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  [LensType.SCRIPT]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  [LensType.VISUAL]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  [LensType.TRANSLATE]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  [LensType.QUIZ]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  [LensType.ELI5]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M7 17l3.5-3.5" />
      <path d="M17 7l-3.5 3.5" />
      <path d="M14 17h3v-3" />
      <path d="M10 7H7v3" />
    </svg>
  ),
  [LensType.CRITIQUE]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  [LensType.SOCIAL]: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  'EXPORT': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
};

const MODULES = [
  { type: 'INPUT', subType: 'TEXT', label: 'Raw Text Data', description: 'Paste text content' },
  { type: 'INPUT', subType: 'URL', label: 'Web Link', description: 'Analyze website' },
  { type: 'INPUT', subType: 'FILE', label: 'File Ingestion', description: 'Upload PDF/TXT' },
  
  // Processors
  { type: 'PROCESSOR', subType: LensType.SUMMARY, label: 'Summarizer', description: 'Key points & brief' },
  { type: 'PROCESSOR', subType: LensType.OUTLINE, label: 'Structure Engine', description: 'Hierarchical breakdown' },
  { type: 'PROCESSOR', subType: LensType.MINDMAP, label: 'Neural Mapper', description: 'Visualize connections' },
  { type: 'PROCESSOR', subType: LensType.PODCAST, label: 'Audio Synth', description: 'Generate dialogue' },
  { type: 'PROCESSOR', subType: LensType.SCRIPT, label: 'Script Writer', description: 'Video production' },
  { type: 'PROCESSOR', subType: LensType.VISUAL, label: 'Visualizer', description: 'Generate imagery' },
  { type: 'PROCESSOR', subType: LensType.TRANSLATE, label: 'Translator', description: 'Multi-language' },
  { type: 'PROCESSOR', subType: LensType.QUIZ, label: 'Knowledge Check', description: 'Assessment gen' },
  { type: 'PROCESSOR', subType: LensType.ELI5, label: 'Simplifier (ELI5)', description: 'Explain simply' },
  { type: 'PROCESSOR', subType: LensType.CRITIQUE, label: 'Critical Eye', description: 'Bias analysis' },
  { type: 'PROCESSOR', subType: LensType.SOCIAL, label: 'Social Amplifier', description: 'Content remix' },
  
  { type: 'OUTPUT', subType: 'EXPORT', label: 'Data Output', description: 'View & Save Results' },
];

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onBack }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Drag & Drop New Modules ---
  const handleDragStart = (e: React.DragEvent, module: any) => {
    e.dataTransfer.setData('module', JSON.stringify(module));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const moduleData = e.dataTransfer.getData('module');
    if (!moduleData) return;
    
    const module = JSON.parse(moduleData);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: module.type,
      subType: module.subType,
      label: module.label,
      x: e.clientX - rect.left - 80, 
      y: e.clientY - rect.top - 40,
      status: 'IDLE'
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  // --- Node Interactions ---
  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevents this from triggering canvas interactions
    if (!isProcessing) {
        setDraggingNodeId(id);
        setSelectedNodeId(id);
    }
  };

  const handleCanvasClick = () => {
    setSelectedNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (draggingNodeId) {
      setNodes((prev) => prev.map(n => 
        n.id === draggingNodeId ? { ...n, x: x - 80, y: y - 40 } : n
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setConnectingNodeId(null);
  };

  // --- Connection Logic ---
  const startConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!isProcessing) setConnectingNodeId(nodeId);
  };

  const endConnection = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (connectingNodeId && connectingNodeId !== targetId && !isProcessing) {
      const exists = edges.find(e => e.source === connectingNodeId && e.target === targetId);
      if (!exists) {
        setEdges(prev => [...prev, { id: crypto.randomUUID(), source: connectingNodeId, target: targetId }]);
      }
    }
    setConnectingNodeId(null);
  };

  const deleteNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isProcessing) return;
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(edge => edge.source !== id && edge.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // --- Data Handling ---
  const updateNodeData = (id: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };
  
  const updateNodeConfig = (id: string, key: string, value: string) => {
    setNodes(prev => prev.map(n => 
      n.id === id ? { ...n, config: { ...n.config, [key]: value } } : n
    ));
  };

  // --- Execution Engine ---
  const executeWorkflow = async () => {
    if (nodes.length === 0) return;
    setIsProcessing(true);

    // Reset non-input statuses
    setNodes(prev => prev.map(n => n.type === 'INPUT' ? n : { ...n, status: 'IDLE', output: undefined, errorMessage: undefined }));

    const processNode = async (nodeId: string): Promise<boolean> => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return false;

        if (node.type === 'INPUT') {
            const hasData = (node.subType === 'FILE' && node.inputFile) || 
                          (node.subType !== 'FILE' && node.inputValue);
            
            updateNodeData(nodeId, { status: hasData ? 'COMPLETE' : 'ERROR', errorMessage: hasData ? undefined : 'Missing Input Data' });
            return !!hasData;
        }

        updateNodeData(nodeId, { status: 'ACTIVE' });

        const incomingEdges = edges.filter(e => e.target === nodeId);
        if (incomingEdges.length === 0) {
            updateNodeData(nodeId, { status: 'ERROR', errorMessage: 'No input connected' });
            return false;
        }

        // Wait for all parents to complete
        const parents = incomingEdges.map(e => nodes.find(n => n.id === e.source)).filter(Boolean);
        const allParentsComplete = parents.every(p => p?.status === 'COMPLETE');
        
        if (!allParentsComplete) {
            // Check if any parent failed
            if (parents.some(p => p?.status === 'ERROR')) {
                 updateNodeData(nodeId, { status: 'ERROR', errorMessage: 'Upstream dependency failed' });
                 return false;
            }
             // Should have been sorted topologically, so if we are here and parents aren't done, something is wrong with sorting or logic
             return false;
        }

        // --- AGGREGATION FOR OUTPUT NODES ---
        if (node.type === 'OUTPUT') {
             // Collect outputs from ALL incoming edges
             const allParentOutputs = incomingEdges.map(edge => {
                 const parent = nodes.find(n => n.id === edge.source);
                 return parent?.output;
             }).filter((o): o is TransformationResult => !!o);

             if (allParentOutputs.length === 0) {
                 updateNodeData(nodeId, { status: 'ERROR', errorMessage: 'No data received from inputs' });
                 return false;
             }

             // Merge outputs into a single "Dashboard" result structure
             // We preserve specific types if they exist in the parents to trigger the correct UI renderers
             const aggregatedAudio = allParentOutputs.find(o => o.audioData)?.audioData;
             const aggregatedMindmap = allParentOutputs.find(o => o.mindMapData)?.mindMapData;
             const aggregatedImages = allParentOutputs.flatMap(o => o.images || []);
             
             // Combine text with a clear separator
             const aggregatedText = allParentOutputs
                .map(o => {
                    const title = o.type !== LensType.SUMMARY ? `[${o.type} OUTPUT]` : '';
                    const content = o.text ? o.text.trim() : '';
                    return content ? `${title}\n${content}` : null;
                })
                .filter(Boolean)
                .join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');

             const combinedOutput: TransformationResult = {
                 type: LensType.SUMMARY, // Base type, but we fill all slots
                 text: aggregatedText,
                 images: aggregatedImages,
                 audioData: aggregatedAudio,
                 mindMapData: aggregatedMindmap
             };
             
             updateNodeData(nodeId, { 
                 status: 'COMPLETE', 
                 output: combinedOutput 
             });
             return true;
        }

        // --- SINGLE INPUT FOR PROCESSORS ---
        // Processors typically take the primary text input from the first connected node
        const primaryParentId = incomingEdges[0].source;
        const primaryParent = nodes.find(n => n.id === primaryParentId);
        
        if (!primaryParent || primaryParent.status !== 'COMPLETE') return false;

        let inputContent: string | File = '';
        let inputType: 'TEXT' | 'URL' | 'FILE' = 'TEXT';

        if (primaryParent.type === 'INPUT') {
            if (primaryParent.subType === 'FILE' && primaryParent.inputFile) {
                inputContent = primaryParent.inputFile;
                inputType = 'FILE';
            } else if (primaryParent.subType === 'URL' && primaryParent.inputValue) {
                inputContent = primaryParent.inputValue;
                inputType = 'URL';
            } else {
                inputContent = primaryParent.inputValue || '';
                inputType = 'TEXT';
            }
        } else {
            // If parent is another processor, take its text output
            if (primaryParent.output?.text) {
                inputContent = primaryParent.output.text;
                inputType = 'TEXT';
            } else {
                updateNodeData(nodeId, { status: 'ERROR', errorMessage: 'Parent produced no text output to process' });
                return false;
            }
        }

        if (node.type === 'PROCESSOR') {
            try {
                const result = await transformContent(
                    inputContent, 
                    inputType, 
                    node.subType as LensType,
                    node.config?.customPrompt
                );
                updateNodeData(nodeId, { status: 'COMPLETE', output: result });
                return true;
            } catch (e) {
                console.error(e);
                updateNodeData(nodeId, { status: 'ERROR', errorMessage: 'Processing Failed. See Console.' });
                return false;
            }
        } 
        
        return false;
    };

    // Topological Sort Execution
    const buildAdjacencyList = () => {
        const adj: Record<string, string[]> = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            if (adj[e.source]) adj[e.source].push(e.target);
        });
        return adj;
    };

    const adj = buildAdjacencyList();
    const inDegree: Record<string, number> = {};
    nodes.forEach(n => inDegree[n.id] = 0);
    edges.forEach(e => inDegree[e.target]++);

    const zeroInDegree = nodes.filter(n => inDegree[n.id] === 0);
    const executionOrder: string[] = [];
    const q = zeroInDegree.map(n => n.id);

    while (q.length > 0) {
        const u = q.shift()!;
        executionOrder.push(u);
        if (adj[u]) {
            for (const v of adj[u]) {
                inDegree[v]--;
                if (inDegree[v] === 0) q.push(v);
            }
        }
    }

    for (const nodeId of executionOrder) {
        await new Promise(r => setTimeout(r, 100));
        await processNode(nodeId);
    }

    setIsProcessing(false);
  };

  // --- Render Helpers ---
  const getConnectorPath = (sourceId: string, targetX: number, targetY: number) => {
    const source = nodes.find(n => n.id === sourceId);
    if (!source) return '';
    const sx = source.x + 160;
    const sy = source.y + 40;
    const midX = (sx + targetX) / 2;
    return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${targetY}, ${targetX} ${targetY}`;
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const groups = ['INPUT', 'PROCESSOR', 'OUTPUT'];

  const getGroupColor = (type: string) => {
    if (type === 'INPUT') return 'border-cyan-500/50 text-cyan-400';
    if (type === 'PROCESSOR') return 'border-purple-500/50 text-purple-400';
    return 'border-green-500/50 text-green-400';
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] flex animate-fadeIn pb-4 relative">
      
      {/* LEFT PANEL: CARD DECKS */}
      <div className="w-80 p-4 shrink-0 transition-all absolute md:relative z-30 h-full -left-0 md:left-0 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 text-indigo-300 justify-start">
            <button onClick={onBack} className="hover:text-white transition-colors flex items-center gap-2 group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="font-bold tech-mono text-xs uppercase">Back to Hub</span>
            </button>
        </div>
        
        <div className="flex-1 overflow-visible space-y-4">
           {groups.map((group) => {
              const modulesInGroup = MODULES.filter(m => m.type === group);
              const groupColorClass = getGroupColor(group);
              
              return (
                 <div key={group} className="group relative transition-all duration-300">
                    
                    {/* The Deck "Cover" */}
                    <div className={`relative z-20 bg-slate-950/90 backdrop-blur-xl border p-4 rounded-xl shadow-xl flex items-center justify-between cursor-default transition-all group-hover:bg-slate-900 group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${groupColorClass}`}>
                       <div className="flex flex-col">
                           <span className="font-bold text-xs tracking-[0.2em] uppercase">{group} DECK</span>
                           <span className="text-[10px] text-slate-500 mt-1 font-mono">{modulesInGroup.length} MODULES AVAILABLE</span>
                       </div>
                       <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                          ▼
                       </div>
                    </div>

                    {/* The Fanning Cards */}
                    <div className="relative z-10 px-1 -mt-4 transition-all duration-500 ease-out max-h-0 opacity-0 overflow-hidden group-hover:max-h-[1000px] group-hover:opacity-100 group-hover:pt-6">
                        <div className="space-y-2 pb-2">
                          {modulesInGroup.map((module, i) => {
                              const Icon = TechIcons[module.subType] || TechIcons['TEXT'];
                              return (
                                  <div
                                      key={module.subType}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, module)}
                                      className="transform translate-y-[-20px] scale-95 opacity-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 origin-top"
                                      style={{ transitionDelay: `${i * 50}ms` }}
                                  >
                                      <div 
                                          className="bg-slate-900 border border-white/5 hover:border-cyan-400/50 hover:bg-slate-800 p-3 rounded-lg flex items-center gap-3 cursor-grab active:cursor-grabbing shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] group/card transition-all"
                                          title={module.description}
                                      >
                                          <div className="w-8 h-8 rounded-md bg-black/40 flex items-center justify-center text-slate-400 group-hover/card:text-cyan-300 group-hover/card:scale-110 transition-all">
                                              <Icon className="w-5 h-5" />
                                          </div>
                                          <div className="flex flex-col">
                                              <span className="text-sm font-bold text-slate-300 group-hover/card:text-white leading-none">{module.label}</span>
                                              <span className="text-[10px] text-slate-600 group-hover/card:text-cyan-500/70 mt-1 leading-none font-mono uppercase">{module.description}</span>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                        </div>
                    </div>

                    {/* Decorative Stack Depth Effect */}
                    <div className="absolute top-1 left-2 right-2 h-full bg-slate-800/50 rounded-xl -z-10 transition-all group-hover:opacity-0 pointer-events-none border border-white/5"></div>
                    <div className="absolute top-2 left-4 right-4 h-full bg-slate-800/30 rounded-xl -z-20 transition-all group-hover:opacity-0 pointer-events-none border border-white/5"></div>
                 </div>
              );
           })}
        </div>
      </div>

      {/* CENTER: CANVAS */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden ml-4 md:ml-0 mr-4 rounded-2xl border border-indigo-500/10 shadow-2xl bg-[#020617]">
        
        {/* Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="pointer-events-auto bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-xs text-indigo-200 font-bold tracking-widest tech-mono">NEURAL_BUILDER_V2</span>
            </div>
            <div className="pointer-events-auto flex gap-3">
                 <button 
                    onClick={() => { setNodes([]); setEdges([]); setSelectedNodeId(null); }}
                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 text-xs font-bold transition-colors"
                 >
                    CLEAR
                 </button>
                 <button 
                    onClick={executeWorkflow}
                    disabled={isProcessing || nodes.length === 0}
                    className={`px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${isProcessing ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400/50'}`}
                 >
                    {isProcessing ? (
                        <><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> EXECUTING...</>
                    ) : (
                        <>▶ RUN_SEQUENCE</>
                    )}
                 </button>
            </div>
        </div>

        {/* Grid Area */}
        <div 
            ref={canvasRef}
            onClick={handleCanvasClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="flex-1 relative w-full h-full overflow-hidden"
            style={{
                backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', 
                backgroundSize: '30px 30px'
            }}
        >
            {/* SVG Connections Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <filter id="glow-line">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-orb">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {edges.map(edge => {
                    const source = nodes.find(n => n.id === edge.source);
                    const target = nodes.find(n => n.id === edge.target);
                    if (!source || !target) return null;
                    
                    const sx = source.x + 160;
                    const sy = source.y + 40;
                    const tx = target.x;
                    const ty = target.y + 40;
                    const isActive = source.status === 'COMPLETE' || source.status === 'ACTIVE';
                    const isTransmitting = target.status === 'ACTIVE'; // Data is moving into target
                    const edgePathId = `path-${edge.id}`;

                    return (
                        <g key={edge.id}>
                            <path 
                                id={edgePathId}
                                d={`M ${sx} ${sy} C ${(sx+tx)/2} ${sy}, ${(sx+tx)/2} ${ty}, ${tx} ${ty}`}
                                fill="none"
                                stroke={isActive ? "#22d3ee" : "#4f46e5"} 
                                strokeWidth={isActive ? "3" : "2"}
                                strokeOpacity={isActive ? "0.8" : "0.4"}
                                filter={isActive ? "url(#glow-line)" : ""}
                                className={isActive && isProcessing ? "animate-pulse" : ""}
                            />
                            
                            {/* MOVING GLOWING ORB */}
                            {isTransmitting && (
                                <circle r="4" fill="#fff" filter="url(#glow-orb)">
                                    <animateMotion dur="1s" repeatCount="indefinite">
                                        <mpath href={`#${edgePathId}`} />
                                    </animateMotion>
                                </circle>
                            )}
                        </g>
                    );
                })}

                {connectingNodeId && (
                    <path 
                        d={getConnectorPath(connectingNodeId, mousePos.x, mousePos.y)}
                        fill="none"
                        stroke="#94a3b8" 
                        strokeWidth="2" 
                        strokeDasharray="4,4"
                    />
                )}
            </svg>

            {/* Nodes Layer */}
            {nodes.map(node => {
                const Icon = TechIcons[node.subType] || TechIcons['TEXT'];
                return (
                    <div
                        key={node.id}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute w-40 h-20 rounded-xl border backdrop-blur-xl transition-all z-10 flex flex-col justify-between select-none cursor-pointer group
                            ${selectedNodeId === node.id ? 'ring-2 ring-white border-transparent shadow-[0_0_30px_rgba(99,102,241,0.3)]' : ''}
                            ${node.status === 'ACTIVE' ? 'bg-indigo-950/80 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 
                              node.status === 'COMPLETE' ? 'bg-indigo-950/60 border-green-500/50' : 
                              node.status === 'ERROR' ? 'bg-red-950/60 border-red-500/50' : 
                              'bg-slate-900/80 border-white/10 hover:border-indigo-500/50'}
                        `}
                        style={{ left: node.x, top: node.y }}
                    >
                        <button 
                            onClick={(e) => deleteNode(e, node.id)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
                        >
                            ×
                        </button>

                        <div className="p-3 border-b border-white/5 flex items-center gap-3">
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${ 
                                node.status === 'ACTIVE' ? 'text-cyan-300 animate-spin-slow' : 'text-slate-400'
                            }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-200 truncate tracking-wide">{node.label}</span>
                        </div>

                        <div className="px-3 pb-2 flex justify-between items-end">
                             <div className="flex gap-1">
                                {node.type === 'INPUT' && (node.inputValue || node.inputFile) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"></span>
                                )}
                                {node.config?.customPrompt && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_5px_purple]"></span>
                                )}
                             </div>
                             <span className={`text-[9px] tech-mono uppercase ml-auto font-bold ${ 
                                node.status === 'ACTIVE' ? 'text-cyan-300 animate-pulse' : 
                                node.status === 'COMPLETE' ? 'text-green-400' : 
                                node.status === 'ERROR' ? 'text-red-400' : 'text-slate-600'
                            }`}>
                                {node.status === 'ERROR' ? 'ERR' : node.status}
                            </span>
                        </div>

                        {/* Input Port */}
                        {node.type !== 'INPUT' && (
                             <div 
                                onMouseUp={(e) => endConnection(e, node.id)}
                                className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-indigo-500 hover:border-cyan-400 hover:scale-125 transition-all cursor-crosshair flex items-center justify-center z-20 shadow-lg"
                             >
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full pointer-events-none"></div>
                             </div>
                        )}

                        {/* Output Port */}
                        {node.type !== 'OUTPUT' && (
                            <div 
                                onMouseDown={(e) => startConnection(e, node.id)}
                                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-purple-500 hover:border-pink-400 hover:scale-125 transition-all cursor-crosshair flex items-center justify-center z-20 shadow-lg"
                            >
                                 <div className="w-1.5 h-1.5 bg-purple-400 rounded-full pointer-events-none"></div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* FLOATING INSPECTOR PANEL (POPUP) */}
      {selectedNode && (
        <div className="absolute right-6 top-20 bottom-6 w-80 md:w-96 glass-panel rounded-2xl flex flex-col overflow-hidden animate-slideLeft shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/20 z-50 backdrop-blur-2xl">
            
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-slate-900/90 to-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-lg shadow-indigo-500/10">
                        {TechIcons[selectedNode.subType] ? React.createElement(TechIcons[selectedNode.subType], { className: "w-6 h-6" }) : <span>?</span>}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">{selectedNode.label}</h3>
                        <p className="text-[10px] text-cyan-400 tech-mono uppercase tracking-wider">ID: {selectedNode.id.substring(0,8)}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedNodeId(null)} 
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                    ✕
                </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                {/* Error Message */}
                {selectedNode.errorMessage && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-pulse">
                        <div className="flex items-center gap-2 mb-1 text-red-400 font-bold text-xs uppercase tracking-wider">
                            <span>⚠</span> System Alert
                        </div>
                        <p className="text-sm text-red-200/80">{selectedNode.errorMessage}</p>
                    </div>
                )}

                {/* CONFIGURATION SECTION */}
                {selectedNode.type === 'PROCESSOR' && (
                    <div className="space-y-3 animate-fadeIn">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                            Neural Configuration
                        </div>
                        
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors">
                            <label className="block text-xs text-slate-400 mb-2">Custom Instructions (Prompt Override)</label>
                            <textarea
                                className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-indigo-100 focus:border-indigo-500 outline-none resize-none tech-mono placeholder-indigo-500/30 transition-all focus:bg-black/50"
                                placeholder="E.g., 'Focus on dates', 'Translate to French', 'Make it funny'..."
                                value={selectedNode.config?.customPrompt || ''}
                                onChange={(e) => updateNodeConfig(selectedNode.id, 'customPrompt', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* INPUT CONFIG */}
                {selectedNode.type === 'INPUT' && (
                    <div className="space-y-3 animate-fadeIn">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                            Data Source
                        </div>
                        
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        {selectedNode.subType === 'TEXT' && (
                            <textarea
                                className="w-full h-40 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-slate-200 focus:border-indigo-500 outline-none resize-none tech-mono focus:bg-black/50 transition-all"
                                placeholder="Enter raw text data here..."
                                value={selectedNode.inputValue || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { inputValue: e.target.value })}
                            />
                        )}

                        {selectedNode.subType === 'URL' && (
                             <input
                                type="url"
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-cyan-300 focus:border-indigo-500 outline-none focus:bg-black/50 transition-all"
                                placeholder="https://..."
                                value={selectedNode.inputValue || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { inputValue: e.target.value })}
                            />
                        )}

                        {selectedNode.subType === 'FILE' && (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-cyan-400/50 transition-all group"
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            updateNodeData(selectedNode.id, { inputFile: e.target.files[0] });
                                        }
                                    }}
                                />
                                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform text-slate-500 group-hover:text-cyan-400">
                                   <TechIcons.FILE className="w-8 h-8" />
                                </span>
                                <span className="text-xs text-slate-400 group-hover:text-cyan-300 font-medium">
                                    {selectedNode.inputFile ? selectedNode.inputFile.name : 'Click to Ingest File'}
                                </span>
                            </div>
                        )}
                        </div>
                    </div>
                )}

                {/* OUTPUT DISPLAY */}
                {(selectedNode.type === 'PROCESSOR' || selectedNode.type === 'OUTPUT') && (
                    <div className="space-y-3 animate-fadeIn">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                Neural Output
                            </div>
                            {selectedNode.status === 'COMPLETE' && (
                                <span className="text-[10px] text-green-400 bg-green-900/20 border border-green-500/30 px-2 py-0.5 rounded tech-mono">
                                    GENERATION_COMPLETE
                                </span>
                            )}
                        </div>

                        {selectedNode.status !== 'COMPLETE' ? (
                            <div className="h-32 bg-black/20 rounded-xl flex items-center justify-center text-xs text-slate-500 border border-white/5 border-dashed italic">
                                {selectedNode.status === 'ACTIVE' ? 
                                    <span className="animate-pulse text-cyan-400">Processing Neural Pathways...</span> : 
                                    'Awaiting execution sequence...'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedNode.output?.audioData && (
                                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                                         <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                                                <span className="text-[10px] text-pink-400 font-mono">AUDIO_STREAM_ACTIVE</span>
                                            </div>
                                         </div>
                                        <audio controls className="w-full h-8" src={`data:audio/wav;base64,${selectedNode.output.audioData}`} />
                                    </div>
                                )}

                                {selectedNode.output?.images && selectedNode.output.images.length > 0 && (
                                     <div className="grid grid-cols-1 gap-4">
                                        {selectedNode.output.images.map((img, i) => (
                                            <div key={i} className="relative group">
                                                <img src={`data:image/png;base64,${img}`} className="w-full rounded-xl border border-white/10 shadow-lg" alt="Result" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
                                                    <span className="text-white font-bold text-xs bg-black/60 px-2 py-1 rounded">VISUAL_GENERATED</span>
                                                </div>
                                            </div>
                                        ))}
                                     </div>
                                )}

                                {selectedNode.output?.mindMapData && (
                                    <div className="p-4 bg-indigo-900/20 rounded-xl text-xs text-indigo-300 border border-indigo-500/30 flex items-center gap-3">
                                        <span className="text-2xl">🧠</span>
                                        <div>
                                            <p className="font-bold">Mind Map Generated</p>
                                            <p className="opacity-70">{selectedNode.output.mindMapData.children?.length || 0} primary branches detected</p>
                                        </div>
                                    </div>
                                )}

                                {selectedNode.output?.text && (
                                    <div className="bg-black/40 rounded-xl p-4 border border-white/10 max-h-[400px] overflow-y-auto custom-scrollbar hover:border-white/20 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] text-indigo-400 font-mono">TEXT_OUTPUT_BUFFER</span>
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(selectedNode.output?.text || '')}
                                                className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-slate-300 transition-colors"
                                            >
                                                COPY
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-light">{selectedNode.output.text}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default WorkflowBuilder;
