"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { chatWithAgent } from "./actions";
import { toast } from "sonner";
import { getUpcomingTasks, getIncompleteTasks } from "@/lib/calendar-client";
import { useRouter } from "next/navigation";
import { Calendar, AlertTriangle, ArrowRight } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your connected AI Agent. I have access to your data across all Builder's Lab apps. Ask me about your articles, images, or workflows!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [incomplete, setIncomplete] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function checkTasks() {
      try {
        const up = await getUpcomingTasks(24 * 3); // Next 3 days
        const inc = await getIncompleteTasks();
        
        setUpcoming(up);
        setIncomplete(inc);

        if (up.length > 0 || inc.length > 0) {
          let summary = "📅 **Calendar Update:**\n\n";
          
          if (inc.length > 0) {
            summary += `⚠️ You have ${inc.length} overdue task(s) needing content.\n`;
          }
          
          if (up.length > 0) {
            summary += `📌 You have ${up.length} task(s) coming up in the next 3 days.\n`;
          }
          
          summary += "\nHow can I help you get ahead today?";
          
          setMessages(prev => [...prev, {
            role: "assistant",
            content: summary
          }]);
        }
      } catch (err) {
        console.error("Failed to fetch tasks for assistant:", err);
      }
    }
    checkTasks();
  }, []);

  const handleCreateContent = (task: any) => {
    const appMap: Record<string, string> = {
      'image': '/apps/banana-blitz',
      'carousel': '/apps/banana-blitz',
      'blog_post': '/apps/unravel',
      'social_post': '/apps/serendipity',
      'podcast': '/apps/insightlens',
      'video': '/apps/banana-blitz',
    };

    const appUrl = appMap[task.content_type] || '/apps';
    router.push(`${appUrl}?taskId=${task.id}&title=${encodeURIComponent(task.title)}`);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call the server action which handles RAG + Gemini
      const result = await chatWithAgent(input, messages);

      if (result.success && result.response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: result.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error("Failed to get response");
        setMessages((prev) => [...prev, { role: "assistant", content: "I encountered an error accessing your knowledge base." }]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong");
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
            <h1 className="text-lg font-semibold tracking-tight">AI Agent</h1>
          </div>
          <div className="w-32" />
        </div>
      </nav>

      {/* Chat Container */}
      <div className="relative z-10 container mx-auto px-6 py-6 max-w-4xl h-[calc(100vh-120px)] flex flex-col">
        {/* Quick Actions for Overdue Tasks */}
        {incomplete.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Priority: Overdue Tasks</h3>
            </div>
            <div className="space-y-2">
              {incomplete.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 group hover:border-white/20 transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{task.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{task.platform} // {task.content_type?.replace('_', ' ')}</span>
                  </div>
                  <button
                    onClick={() => handleCreateContent(task)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Create <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {incomplete.length > 3 && (
                <Link href="/calendar" className="block text-center text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase pt-1">
                  View all {incomplete.length} overdue tasks
                </Link>
              )}
            </div>
          </div>
        )}

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
              placeholder="Ask me about anything you've built..."
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
