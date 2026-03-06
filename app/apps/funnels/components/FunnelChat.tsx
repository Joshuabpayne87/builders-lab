'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, Code } from 'lucide-react';
import { useFunnel } from '../FunnelContext';
import TemplateQuickStart from './TemplateQuickStart';
import NotificationsPanel from './NotificationsPanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function FunnelChat() {
  const { strategyDoc, setStrategyDoc, setStage, setGeneratedCode, setIsGenerating, isGenerating, setFunnelId } = useFunnel();
  const [showTemplates, setShowTemplates] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Welcome to The Builder's Lab Funnel Builder. I'm your Conversion Strategist.\n\nI'll help you architect a high-converting landing page that captures leads and drives sales. Let's start with the fundamentals:\n\n**What are you selling?** (Be specific - product, service, membership, course, etc.)"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleTemplateSelected = (strategyDocFromTemplate: string) => {
    // User selected a template and filled in the details
    setStrategyDoc(strategyDocFromTemplate);
    setStage('STRATEGY');
    setShowTemplates(false);

    // Trigger code generation automatically
    setTimeout(() => {
      handleGenerateCode();
    }, 500);
  };

  const handleSkipTemplates = () => {
    setShowTemplates(false);
  };

  const handleSuggestedAnswer = async (answer: string) => {
    if (isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: answer };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/funnels/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      let aiContent = data.content;

      // Check for strategy update
      const strategyMatch = aiContent.match(/\[UPDATE_STRATEGY\]([\s\S]*?)\[\/UPDATE_STRATEGY\]/);
      if (strategyMatch) {
        const strategyText = strategyMatch[1].trim();
        setStrategyDoc(strategyText);
        setStage('STRATEGY');

        aiContent = aiContent.replace(/\[UPDATE_STRATEGY\][\s\S]*?\[\/UPDATE_STRATEGY\]/, '').trim();
      }

      // Check for auto-generate trigger
      const shouldGenerate = aiContent.includes('[GENERATE_PAGE]');
      if (shouldGenerate) {
        aiContent = aiContent.replace(/\[GENERATE_PAGE\]/g, '').trim();

        // Auto-trigger code generation
        if (strategyDoc || strategyMatch) {
          setTimeout(() => {
            handleGenerateCode();
          }, 500);
        }
      }

      if (!aiContent) aiContent = "I've drafted the strategy document for you. Check the panel to the right.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the server. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/funnels/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      let aiContent = data.content;

      // Check for strategy update
      const strategyMatch = aiContent.match(/\[UPDATE_STRATEGY\]([\s\S]*?)\[\/UPDATE_STRATEGY\]/);
      if (strategyMatch) {
        const strategyText = strategyMatch[1].trim();
        setStrategyDoc(strategyText);
        setStage('STRATEGY');

        aiContent = aiContent.replace(/\[UPDATE_STRATEGY\][\s\S]*?\[\/UPDATE_STRATEGY\]/, '').trim();
      }

      // Check for auto-generate trigger
      const shouldGenerate = aiContent.includes('[GENERATE_PAGE]');
      if (shouldGenerate) {
        aiContent = aiContent.replace(/\[GENERATE_PAGE\]/g, '').trim();

        // Auto-trigger code generation
        if (strategyDoc || strategyMatch) {
          setTimeout(() => {
            handleGenerateCode();
          }, 500);
        }
      }

      if (!aiContent) aiContent = "I've drafted the strategy document for you. Check the panel to the right.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the server. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!strategyDoc || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/funnels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyDoc,
          title: 'Landing Page'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate code');

      const data = await response.json();
      if (data.success && data.htmlCode) {
        setGeneratedCode(data.htmlCode);
        setStage('CODE');

        // Set the funnel ID if returned from the API
        if (data.funnelId) {
          setFunnelId(data.funnelId);
          console.log('[FUNNEL CHAT] Funnel created with ID:', data.funnelId);
        }

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "✨ I've generated your landing page! Check the preview on the right. You can now deploy it or download the HTML."
        }]);
      }
    } catch (error) {
      console.error('Code generation error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I had trouble generating the code. Please try again."
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (showTemplates) {
    return (
      <TemplateQuickStart
        onTemplateSelected={handleTemplateSelected}
        onSkip={handleSkipTemplates}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Sales Architect</h2>
              <p className="text-xs text-slate-400">Conversion Strategist</p>
            </div>
          </div>
          <NotificationsPanel />
        </div>
      </div>
  
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {messages.map((msg) => {
            // Parse suggested answers from assistant messages
            const suggestedAnswersMatch = msg.role === 'assistant'
              ? msg.content.match(/\[SUGGEST_ANSWERS:([^\]]+)\]/)
              : null;

            const suggestedAnswers = suggestedAnswersMatch
              ? suggestedAnswersMatch[1].split('|').map(a => a.trim())
              : [];

            // Remove the [SUGGEST_ANSWERS:...] tag from display
            const displayContent = msg.content.replace(/\[SUGGEST_ANSWERS:[^\]]+\]/g, '').trim();

            return (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{displayContent}</div>
                  </div>
                </div>

                {/* Suggested answers buttons */}
                {suggestedAnswers.length > 0 && (
                  <div className="flex gap-2 mt-3 justify-start flex-wrap">
                    {suggestedAnswers.map((answer, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedAnswer(answer)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-300 hover:text-slate-100 disabled:text-slate-500 text-xs rounded-full border border-slate-700 transition-all"
                      >
                        {answer}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe your offer..."
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none h-[50px] min-h-[50px] max-h-[120px] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        <div className="flex justify-between items-center mt-2 px-1">
            <button className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> Attach Context
            </button>
             <span className="text-[10px] text-slate-600">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
  