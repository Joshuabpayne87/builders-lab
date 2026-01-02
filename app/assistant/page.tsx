"use client";

import { useState, useRef, useEffect } from "react";
import { createGeminiClient } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant across all Builder's Lab tools. I can help you with content creation, prompt engineering, insights, and more. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const ai = createGeminiClient();
      const supabase = createClient();

      // Get user context from all their saved data
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let context = "";
      if (user) {
        // Get recent articles
        const { data: articles } = await supabase
          .from("bl_articles")
          .select("title, summary")
          .eq("user_id", user.id)
          .limit(5)
          .order("created_at", { ascending: false });

        // Get recent prompts
        const { data: prompts } = await supabase
          .from("bl_prompts")
          .select("title, content")
          .eq("user_id", user.id)
          .limit(5)
          .order("created_at", { ascending: false });

        if (articles?.length || prompts?.length) {
          context = `\n\nUser Context (their recent work):\n`;
          if (articles?.length) {
            context += `Recent Articles: ${articles.map((a) => a.title).join(", ")}\n`;
          }
          if (prompts?.length) {
            context += `Recent Prompts: ${prompts.map((p) => p.title).join(", ")}\n`;
          }
        }
      }

      const conversationHistory = messages
        .slice(-10)
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

      const systemPrompt = `You are an AI assistant for The Builder's Lab, a unified productivity suite with 5 tools:
1. Unravel - Convert threads/URLs to articles
2. PromptStash - Prompt engineering IDE
3. InsightLens - Content transformation (summaries, mind maps, podcasts)
4. Banana Blitz - AI image generation
5. Serendipity - Content strategy planning

You help users across all these tools, maintaining context and providing guidance.${context}

Conversation History:
${conversationHistory}

User: ${input}

Provide helpful, concise responses. Reference their past work when relevant.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.text ?? "Sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white/80" />
            <h1 className="text-lg font-semibold tracking-tight">AI Assistant</h1>
          </div>
          <div className="w-32" />
        </div>
      </nav>

      {/* Chat Container */}
      <div className="relative z-10 container mx-auto px-6 py-6 max-w-4xl h-[calc(100vh-120px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white/80" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-white text-black"
                    : "bg-black/30 border border-white/10 text-slate-200"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white/80" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white/80" />
              </div>
              <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-white/60" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about your projects..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
