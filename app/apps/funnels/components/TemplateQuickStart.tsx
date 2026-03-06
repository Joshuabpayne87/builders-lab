'use client';

import { useState } from 'react';
import { Sparkles, ChevronRight, X } from 'lucide-react';
import { FUNNEL_TEMPLATES } from '../templates';
import type { FunnelTemplate } from '../types';
import TemplateConfigurator from './TemplateConfigurator';

interface TemplateQuickStartProps {
  onTemplateSelected: (strategyDoc: string) => void;
  onSkip: () => void;
}

export default function TemplateQuickStart({ onTemplateSelected, onSkip }: TemplateQuickStartProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FunnelTemplate['category'] | 'all'>('all');

  const categories: Array<{ id: FunnelTemplate['category'] | 'all'; label: string }> = [
    { id: 'all', label: 'All Templates' },
    { id: 'saas', label: 'SaaS' },
    { id: 'course', label: 'Courses' },
    { id: 'service', label: 'Services' },
    { id: 'agency', label: 'Agency' },
    { id: 'ecommerce', label: 'Ecommerce' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? FUNNEL_TEMPLATES
    : FUNNEL_TEMPLATES.filter(t => t.category === selectedCategory);

  if (selectedTemplate) {
    return (
      <TemplateConfigurator
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        onSubmit={onTemplateSelected}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Quick Start Templates</h2>
              <p className="text-xs text-slate-400">Choose a template to get started instantly</p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3 border-b border-slate-800 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                <div className="flex gap-2 mt-3">
                  {template.quickStartQuestions.map((q, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300"
                    >
                      {q.variable}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors mt-1 flex-shrink-0 ml-3" />
            </div>
          </button>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No templates found in this category
          </div>
        )}
      </div>

      {/* Skip Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <button
          onClick={onSkip}
          className="w-full px-4 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors border border-slate-700 hover:border-slate-500 rounded-lg"
        >
          Skip Templates, Use Custom Chat
        </button>
      </div>
    </div>
  );
}
