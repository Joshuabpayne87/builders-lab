'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader } from 'lucide-react';

interface RefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  funnelId: string;
  htmlCode: string;
  onRefinementComplete: (newCode: string) => void;
}

export default function RefinementModal({
  isOpen,
  onClose,
  funnelId,
  htmlCode,
  onRefinementComplete,
}: RefinementModalProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'What would you like to change on your landing page? (e.g., "Change headline to X", "Make the CTA button green", "Update the testimonials section")',
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/funnels/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnelId,
          htmlCode,
          refinementRequest: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine code');
      }

      const data = await response.json();

      if (data.success && data.htmlCode) {
        // Update the parent with the refined code
        onRefinementComplete(data.htmlCode);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '✅ Done! Your landing page has been updated. The changes are live now.',
          },
        ]);

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(data.error || 'Refinement failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error refining code';
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I had trouble making that change. ${errorMsg}. Please try rephrasing your request.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="font-semibold text-white">Refine Your Page</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-lg rounded-bl-none px-3 py-2 flex items-center gap-2">
                <Loader className="w-3 h-3 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-400">Making changes...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-600/30 rounded-lg px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-3 bg-slate-900/50">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Describe the change you want..."
              disabled={isLoading}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none h-[40px] min-h-[40px] max-h-[80px] disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
