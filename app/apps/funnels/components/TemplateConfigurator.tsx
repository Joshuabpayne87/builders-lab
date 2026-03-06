'use client';

import { useState } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import type { FunnelTemplate } from '../types';

interface TemplateConfiguratorProps {
  template: FunnelTemplate;
  onBack: () => void;
  onSubmit: (strategyDoc: string) => void;
}

export default function TemplateConfigurator({
  template,
  onBack,
  onSubmit
}: TemplateConfiguratorProps) {
  const [variables, setVariables] = useState<Record<string, string>>(
    Object.fromEntries(template.quickStartQuestions.map(q => [q.variable, '']))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (variable: string, value: string) => {
    setVariables(prev => ({ ...prev, [variable]: value }));
  };

  const isAllFilled = template.quickStartQuestions.every(
    q => variables[q.variable]?.trim()
  );

  const handleSubmit = async () => {
    if (!isAllFilled) return;

    setIsSubmitting(true);

    // Replace template variables with user input
    let strategyDoc = template.strategyDoc;
    Object.entries(variables).forEach(([key, value]) => {
      strategyDoc = strategyDoc.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    onSubmit(strategyDoc);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Templates</span>
        </button>
        <h2 className="font-semibold text-white">{template.name}</h2>
        <p className="text-xs text-slate-400 mt-1">{template.description}</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-400">
            Fill in the details below. These answers will personalize your entire strategy.
          </p>
        </div>

        {template.quickStartQuestions.map((question, index) => (
          <div key={question.variable}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {index + 1}. {question.question}
            </label>
            <input
              type="text"
              value={variables[question.variable] || ''}
              onChange={(e) => handleInputChange(question.variable, e.target.value)}
              placeholder={question.placeholder}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-slate-600"
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
        <button
          onClick={handleSubmit}
          disabled={!isAllFilled || isSubmitting}
          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Generating Strategy...' : 'Generate Strategy'}
        </button>
        <button
          onClick={onBack}
          className="w-full px-4 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors border border-slate-700 hover:border-slate-500 rounded-lg"
        >
          Back
        </button>
      </div>
    </div>
  );
}
