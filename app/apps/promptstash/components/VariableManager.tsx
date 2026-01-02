"use client";

import React, { useState, useEffect, useRef } from 'react';
import { VariableResult } from '../types';
import { Layers, Copy, Check, RefreshCw, Edit3, Eye, Plus, FileDown } from 'lucide-react';

interface VariableManagerProps {
  variableResult: VariableResult;
  onRestart: () => void;
}

export const VariableManager: React.FC<VariableManagerProps> = ({ variableResult, onRestart }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [template, setTemplate] = useState(variableResult.template);
  const [finalOutput, setFinalOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize values with defaults
  useEffect(() => {
    const defaults: Record<string, string> = {};
    variableResult.variables.forEach(v => {
      defaults[v.name] = v.defaultValue;
    });
    setValues(defaults);
    setTemplate(variableResult.template);
  }, [variableResult]);

  // Update final output when values or template change
  useEffect(() => {
    let text = template;
    Object.entries(values).forEach(([key, val]) => {
       // Regex to replace all occurrences of {{key}}
       const regex = new RegExp(`{{${key}}}`, 'g');
       text = text.replace(regex, val);
    });
    setFinalOutput(text);
  }, [values, template]);

  const handleChange = (name: string, val: string) => {
    setValues(prev => ({ ...prev, [name]: val }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([finalOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-stash-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Increase delay to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const insertVariable = (variableName: string) => {
    if (mode !== 'edit' || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Inserts the template syntax {{variableName}} not the value
    const insertion = `{{${variableName}}}`;
    
    const newText = template.substring(0, start) + insertion + template.substring(end);
    setTemplate(newText);

    // Restore focus and move cursor after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  return (
    <div className="flex h-full">
      {/* Configuration Panel */}
      <div className="w-1/3 border-r border-ide-border bg-ide-panel flex flex-col overflow-y-auto p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
          <Layers size={20} className="text-ide-accent" />
          Template Variables
        </h3>
        
        <div className="space-y-6">
          {variableResult.variables.map((v) => (
            <div key={v.name} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-ide-text flex items-center gap-2">
                  <span>{v.name}</span>
                  {mode === 'edit' && (
                    <button 
                      onClick={() => insertVariable(v.name)}
                      className="flex items-center gap-1 p-1 px-2 bg-ide-accent/20 hover:bg-ide-accent/40 rounded text-ide-accent transition-all text-xs font-mono"
                      title={`Insert {{${v.name}}} into template`}
                    >
                      <Plus size={12} />
                      Insert
                    </button>
                  )}
                </label>
                <span className="text-xs text-ide-muted font-normal bg-ide-bg px-2 py-0.5 rounded border border-ide-border">
                  {v.description}
                </span>
              </div>
              <input
                type="text"
                value={values[v.name] || ''}
                onChange={(e) => handleChange(v.name, e.target.value)}
                className="w-full bg-ide-bg border border-ide-border rounded-md px-3 py-2 text-sm focus:border-ide-accent focus:ring-1 focus:ring-ide-accent outline-none transition-colors"
                placeholder={v.defaultValue}
              />
            </div>
          ))}
        </div>

        <div className="mt-auto pt-8">
            <button 
              onClick={onRestart}
              className="flex items-center gap-2 text-sm text-ide-muted hover:text-white transition-colors"
            >
              <RefreshCw size={14} />
              Start New Prompt
            </button>
        </div>
      </div>

      {/* Main Content Panel */}
      <div className="flex-1 flex flex-col bg-ide-bg">
        {/* Header / Tabs */}
        <div className="p-4 border-b border-ide-border flex justify-between items-center bg-ide-bg/50">
           <div className="flex bg-ide-panel p-1 rounded-lg border border-ide-border">
             <button 
               onClick={() => setMode('preview')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 mode === 'preview' 
                   ? 'bg-ide-accent text-white shadow-sm' 
                   : 'text-ide-muted hover:text-white hover:bg-white/5'
               }`}
             >
               <Eye size={16} /> Preview
             </button>
             <button 
               onClick={() => setMode('edit')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 mode === 'edit' 
                   ? 'bg-ide-accent text-white shadow-sm' 
                   : 'text-ide-muted hover:text-white hover:bg-white/5'
               }`}
             >
               <Edit3 size={16} /> Edit Template
             </button>
           </div>

           <div className="flex items-center gap-2">
             <button
               onClick={handleExport}
               className="flex items-center gap-2 px-3 py-1.5 bg-ide-panel border border-ide-border rounded text-sm hover:bg-white/5 transition-colors text-ide-text"
               title="Export as .txt"
             >
               <FileDown size={16} />
               Export
             </button>
             <button
               onClick={handleCopy}
               className="flex items-center gap-2 px-3 py-1.5 bg-ide-panel border border-ide-border rounded text-sm hover:bg-white/5 transition-colors text-ide-text"
             >
               {copied ? <Check size={16} className="text-ide-success" /> : <Copy size={16} />}
               {copied ? 'Copied!' : 'Copy'}
             </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative">
          {mode === 'preview' ? (
            <div className="absolute inset-0 p-6 overflow-y-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap text-ide-text leading-relaxed p-6 bg-ide-panel/30 rounded-lg border border-ide-border h-full overflow-auto">
                {finalOutput}
              </pre>
            </div>
          ) : (
            <div className="absolute inset-0 p-6 flex flex-col">
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 px-4 py-2 rounded-t-lg text-xs flex items-center gap-2">
                 <span>Edit mode active. Click <strong>Insert</strong> next to a variable on the left to add its placeholder (e.g. <code>{'{{variable}}'}</code>).</span>
              </div>
              <textarea 
                ref={textareaRef}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="flex-1 w-full p-6 font-mono text-sm bg-ide-bg border-x border-b border-ide-border rounded-b-lg outline-none resize-none text-ide-text focus:ring-1 focus:ring-ide-accent/50 transition-shadow"
                spellCheck={false}
              />
            </div>
          )}
        </div>
        
        {/* Footer Info */}
        <div className="p-4 border-t border-ide-border bg-ide-bg">
           <div className="text-xs text-ide-muted flex justify-between items-center">
              <span>
                {mode === 'preview' 
                  ? 'Viewing final prompt with values injected.' 
                  : 'Editing raw template structure. Use {{variableName}} syntax.'}
              </span>
              <span className="font-mono opacity-50">
                {finalOutput.length} chars
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};
