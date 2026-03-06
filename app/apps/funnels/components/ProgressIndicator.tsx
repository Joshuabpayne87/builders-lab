'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ProgressStage {
  id: string;
  label: string;
  description: string;
}

const GENERATION_STAGES: ProgressStage[] = [
  { id: 'analyzing', label: 'Analyzing Strategy', description: 'Processing your strategy document...' },
  { id: 'designing', label: 'Designing Layout', description: 'Creating page structure and components...' },
  { id: 'writing', label: 'Writing Code', description: 'Generating HTML, CSS, and JavaScript...' },
  { id: 'finalizing', label: 'Finalizing', description: 'Optimizing and preparing for deployment...' },
];

interface ProgressIndicatorProps {
  isVisible: boolean;
  currentStageId?: string;
}

export default function ProgressIndicator({ isVisible, currentStageId }: ProgressIndicatorProps) {
  const [displayStages, setDisplayStages] = useState<string[]>(['analyzing']);

  useEffect(() => {
    if (!isVisible) {
      setDisplayStages(['analyzing']);
      return;
    }

    // Simulate progression through stages
    const stageIds = GENERATION_STAGES.map(s => s.id);
    const timeouts: NodeJS.Timeout[] = [];

    GENERATION_STAGES.forEach((stage, index) => {
      const timeout = setTimeout(() => {
        setDisplayStages(prev => {
          if (!prev.includes(stage.id)) {
            return [...prev, stage.id];
          }
          return prev;
        });
      }, index * 1500); // Each stage takes ~1.5 seconds

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const completedCount = displayStages.length;
  const progressPercentage = (completedCount / GENERATION_STAGES.length) * 100;
  const currentIndex = displayStages.length - 1;
  const currentStage = GENERATION_STAGES[currentIndex] || GENERATION_STAGES[0];

  return (
    <div className="mx-4 mb-4 bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="animate-spin">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="font-semibold text-slate-200 text-sm">Generating Your Landing Page</h3>
      </div>

      {/* Current Status */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-indigo-400">{currentStage.label}</p>
        <p className="text-xs text-slate-400">{currentStage.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Stage List */}
      <div className="space-y-1">
        {GENERATION_STAGES.map((stage, index) => {
          const isCompleted = displayStages.includes(stage.id);
          const isActive = index === currentIndex && isVisible;

          return (
            <div key={stage.id} className="flex items-center gap-2 text-xs">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isCompleted
                    ? 'bg-indigo-600 text-white'
                    : isActive
                    ? 'bg-indigo-600/50 text-slate-300 animate-pulse'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`transition-colors ${
                  isCompleted ? 'text-indigo-400' : isActive ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Percentage */}
      <div className="text-right">
        <span className="text-xs font-medium text-slate-400">
          {Math.round(progressPercentage)}%
        </span>
      </div>
    </div>
  );
}
