'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, Code } from 'lucide-react';
import { useFunnel } from '../FunnelContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function FunnelChat() {
  const { strategyDoc, setStrategyDoc, setStage, setGeneratedCode, setIsGenerating, isGenerating } = useFunnel();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to Funnels. I'm your Sales Architect. Let's build a high-converting funnel. To start, tell me: **What is the core offer you want to sell?**"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      const strategyMatch = aiContent.match(/\[UPDATE_STRATEGY\]([\s\S]*?)\[\/UPDATE_STRATEGY\]/);
      if (strategyMatch) {
        const strategyText = strategyMatch[1].trim();
        setStrategyDoc(strategyText);
        setStage('STRATEGY');

        aiContent = aiContent.replace(/\[UPDATE_STRATEGY\][\s\S]*?\[\/UPDATE_STRATEGY\]/, '').trim();
        if (!aiContent) aiContent = "I've drafted the strategy document for you. Check the panel to the right.";
      }

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

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Sales Architect</h2>
            <p className="text-xs text-slate-400">Phase 1: Idea Generation</p>
          </div>
        </div>

        {strategyDoc && (
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Code className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Landing Page'}
          </button>
        )}
      </div>
  
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          
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
  