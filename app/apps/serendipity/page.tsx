"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Video,
  Mic,
  Menu,
  X,
  Palette,
  Globe
} from "lucide-react";
import WorkflowGenerator from "./components/WorkflowGenerator";
import MarketResearch from "./components/MarketResearch";
import CanvasStudio from "./components/CanvasStudio";
import HookLibrary from "./components/HookLibrary";
import ScriptView from "./components/ScriptView";

export default function SerendipityPage() {
  const [activeTab, setActiveTab] = useState("workflows");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [canvasInitialImage, setCanvasInitialImage] = useState<string | null>(null);

  const navItems = [
    { id: "workflows", label: "Workflow Engine", icon: LayoutDashboard },
    { id: "research", label: "Market Intelligence", icon: Globe },
    { id: "canvas", label: "Canvas Studio", icon: Palette },
    { id: "hooks", label: "Hook Library", icon: Video },
    { id: "script", label: "Lead Magnet Script", icon: Mic },
  ];

  const handleOpenInCanvas = (imageUrl: string) => {
    setCanvasInitialImage(imageUrl);
    setActiveTab("canvas");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "workflows":
        return <WorkflowGenerator />;
      case "research":
        return <MarketResearch />;
      case "hooks":
        return <HookLibrary />;
      case "script":
        return <ScriptView onOpenInCanvas={handleOpenInCanvas} />;
      case "canvas":
        return (
          <CanvasStudio
            initialImage={canvasInitialImage}
            onClearInitialImage={() => setCanvasInitialImage(null)}
          />
        );
      default:
        return <WorkflowGenerator />;
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full relative z-10">
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 tracking-tight font-sans">
          Serendipity
        </h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group ${
              activeTab === item.id
                ? "bg-gradient-to-r from-violet-600/20 to-transparent text-white border-l-2 border-fuchsia-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 transition-colors ${activeTab === item.id ? "text-fuchsia-400" : "text-slate-500 group-hover:text-slate-300"}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm px-4 py-2 hover:bg-white/5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="glass-panel rounded-2xl p-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider relative z-10">System Status</p>
          <div className="flex items-center space-x-2 relative z-10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse"></div>
            <span className="text-xs text-slate-300">Gemini 2.5 Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Dark glassmorphism styling
  const glassStyles = `
    .serendipity-container {
      background-color: #020617;
      min-height: 100vh;
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    .glass-button {
      background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .glass-button:hover {
      background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }
    .glass-button-active {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
    }
    .glass-input {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }
    .glass-input:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(139, 92, 246, 0.4);
    }
    .glass-input::placeholder {
      color: rgba(226, 232, 240, 0.4);
    }
    .glass-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .glass-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.03);
    }
    .glass-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .glass-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.3);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(139, 92, 246, 0.5);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out;
    }
    @keyframes animate-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-in {
      animation: animate-in 0.3s ease-out;
    }
    .fade-in {
      animation: animate-in 0.3s ease-out;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: glassStyles }} />
      <div className="min-h-screen flex text-slate-200 selection:bg-fuchsia-500/30 selection:text-fuchsia-100 relative bg-[#020617] overflow-x-hidden">
        {/* Background Gradients Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ background: "radial-gradient(circle at 0% 0%, rgba(88,28,135,0.15), transparent 40%)" }}></div>
          <div className="absolute top-0 right-0 w-full h-full" style={{ background: "radial-gradient(circle at 100% 0%, rgba(192,38,211,0.1), transparent 40%)" }}></div>
          <div className="absolute bottom-0 right-0 w-full h-full" style={{ background: "radial-gradient(circle at 100% 100%, rgba(14,165,233,0.1), transparent 40%)" }}></div>
          <div className="absolute bottom-0 left-0 w-full h-full" style={{ background: "radial-gradient(circle at 0% 100%, rgba(88,28,135,0.1), transparent 40%)" }}></div>
        </div>

        {/* Desktop Sidebar with Glassmorphism */}
        <aside className="hidden md:block w-72 fixed h-full z-20 border-r border-white/5 bg-[#020617]/60 backdrop-blur-2xl">
          <NavContent />
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-30 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">Serendipity</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white transition-colors">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-[#020617] md:hidden pt-20 animate-in fade-in">
            <NavContent />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 md:ml-72 p-4 md:p-10 pt-24 md:pt-10 min-h-screen overflow-y-auto relative z-10">
          <div className="max-w-6xl mx-auto animate-fadeIn">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
}
