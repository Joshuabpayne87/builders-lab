"use client";

import React from 'react';
import { Terminal, Wand2, BarChart2, Layers, ChevronRight, ArrowLeft } from 'lucide-react';
import { AppStep } from '../types';
import Link from 'next/link';

interface LayoutProps {
  currentStep: AppStep;
  children: React.ReactNode;
}

const steps = [
  { id: AppStep.DRAFT, label: 'Draft', icon: Terminal },
  { id: AppStep.ANALYSIS, label: 'Analysis', icon: BarChart2 },
  { id: AppStep.REWRITE, label: 'Refine', icon: Wand2 },
  { id: AppStep.VARIABLES, label: 'Template', icon: Layers },
];

export const Layout: React.FC<LayoutProps> = ({ currentStep, children }) => {
  return (
    <div className="flex h-screen bg-ide-bg text-ide-text overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-ide-border bg-ide-bg flex flex-col">
        <div className="p-4 border-b border-ide-border">
            <Link href="/dashboard" className="flex items-center gap-2 text-xs text-ide-muted hover:text-white mb-4 transition-colors">
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-ide-accent rounded-lg flex items-center justify-center">
                    <Terminal size={18} className="text-white" />
                </div>
                <h1 className="font-bold text-lg tracking-tight">PromptStash</h1>
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            // Basic logic to determine if step is "passed" (for visual styling)
            const stepOrder = [AppStep.DRAFT, AppStep.ANALYSIS, AppStep.REWRITE, AppStep.VARIABLES];
            const isCompleted = stepOrder.indexOf(currentStep) > stepOrder.indexOf(step.id);

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive 
                    ? 'bg-ide-panel border border-ide-accent/50 text-white shadow-sm' 
                    : isCompleted 
                      ? 'text-ide-success opacity-80'
                      : 'text-ide-muted opacity-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-ide-accent' : isCompleted ? 'text-ide-success' : ''} />
                <span className="font-medium text-sm">{step.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-ide-accent" />}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ide-border text-xs text-ide-muted">
          <p>Powered by Gemini 2.5 Flash</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-ide-bg relative">
         {children}
      </main>
    </div>
  );
};
