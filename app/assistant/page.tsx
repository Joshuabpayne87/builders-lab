"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Loader2, Sparkles, Palette } from "lucide-react";
import { chatWithAgent, getFlowranceGreeting } from "./actions";
import { toast } from "sonner";
import { getUpcomingTasks, getIncompleteTasks } from "@/lib/calendar-client";
import { useRouter } from "next/navigation";
import { Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import { useAgentTheme } from "@/lib/hooks/useAgentTheme";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const router = useRouter();
  const { theme, loading: themeLoading } = useAgentTheme();
  const assistantName = "Flowrance";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [incomplete, setIncomplete] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickPrompts = [
    "Summarize my last session and next step.",
    "What are my top priorities today?",
    "Draft a 3-day content plan from my calendar.",
    "Turn my latest notes into a short post.",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAssistant() {
      try {
        const [greetingResult, up, inc] = await Promise.all([
          getFlowranceGreeting(),
          getUpcomingTasks(24 * 3),
          getIncompleteTasks(),
        ]);

        if (!isMounted) return;

        setUpcoming(up);
        setIncomplete(inc);

        const nextMessages: Message[] = [];
        if (greetingResult?.success && greetingResult.greeting) {
          nextMessages.push({ role: "assistant", content: greetingResult.greeting });
        }

        if (up.length > 0 || inc.length > 0) {
          let summary = "Calendar update:\n\n";

          if (inc.length > 0) {
            summary += `You have ${inc.length} overdue task(s) needing content.\n`;
          }

          if (up.length > 0) {
            summary += `You have ${up.length} task(s) coming up in the next 3 days.\n`;
          }

          summary += "\nHow can I help you get ahead today?";

          nextMessages.push({ role: "assistant", content: summary });
        }

        if (nextMessages.length > 0) {
          setMessages(nextMessages);
        } else {
          setMessages([
            {
              role: "assistant",
              content: "Good to see you. What do you want to focus on today?",
            },
          ]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to bootstrap assistant:", err);
        setMessages([
          {
            role: "assistant",
            content: "Good to see you. What do you want to focus on today?",
          },
        ]);
      }
    }

    bootstrapAssistant();
    return () => {
      isMounted = false;
    };
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

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const calendarValue =
    incomplete.length > 0
      ? `${incomplete.length} overdue`
      : `${upcoming.length} upcoming`;
  const calendarHint =
    incomplete.length > 0 ? "Resolve overdue items" : "No overdue tasks";
  const calendarTone =
    incomplete.length > 0 ? theme.colors.accent : theme.colors.secondary;

  const statusItems = [
    {
      label: "Knowledge Base",
      value: "Connected",
      hint: "Search ready",
      tone: theme.colors.accent,
    },
    {
      label: "Calendar",
      value: calendarValue,
      hint: calendarHint,
      tone: calendarTone,
    },
    {
      label: "Skills",
      value: "Available",
      hint: "Tooling ready",
      tone: theme.colors.secondary,
    },
    {
      label: "Focus",
      value: "Ask for a plan",
      hint: "Set priorities",
      tone: theme.colors.primary,
    },
  ];

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

  // Theme helper functions
  const getAvatarClassName = () => {
    switch (theme.layout.avatarStyle) {
      case 'circular':
        return 'rounded-full';
      case 'square':
        return 'rounded-lg';
      case 'hexagon':
        return 'rounded-lg rotate-45';
      case 'none':
        return 'hidden';
      default:
        return 'rounded-full';
    }
  };

  const getSpacingValue = () => {
    switch (theme.layout.spacing) {
      case 'compact':
        return 'space-y-2';
      case 'comfortable':
        return 'space-y-4';
      case 'spacious':
        return 'space-y-6';
      default:
        return 'space-y-4';
    }
  };

  const getBubbleStyle = (isUser: boolean) => {
    const borderTone = isUser ? theme.colors.userMessage : theme.colors.aiMessage;
    const accentTone = isUser ? theme.colors.secondary : theme.colors.accent;
    const baseStyle: React.CSSProperties = {
      backgroundColor: isUser ? theme.colors.userMessage : theme.colors.aiMessage,
      color: theme.colors.text,
      boxShadow: theme.effects.shadows ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none',
      transition: theme.effects.animations ? 'all 0.2s ease' : 'none',
      border: `1px solid ${borderTone}2a`,
      backgroundImage: theme.effects.gradients
        ? `linear-gradient(135deg, ${accentTone}22, transparent 65%)`
        : undefined
    };

    switch (theme.layout.messageStyle) {
      case 'bubbles':
        return {
          ...baseStyle,
          borderRadius: '1.5rem',
          padding: '0.75rem 1rem'
        };
      case 'cards':
        return {
          ...baseStyle,
          borderRadius: '0.75rem',
          padding: '1rem',
          border: `1px solid ${borderTone}40`
        };
      case 'minimal':
        return {
          ...baseStyle,
          borderRadius: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'transparent',
          border: `1px solid ${borderTone}60`
        };
      case 'notion-style':
        return {
          ...baseStyle,
          borderRadius: '0.375rem',
          padding: '0.75rem',
          backgroundColor: isUser ? theme.colors.userMessage + '10' : 'transparent',
          border: 'none',
          borderLeft: `3px solid ${borderTone}`
        };
      default:
        return baseStyle;
    }
  };

  if (themeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: theme.colors.primary }} />
          <p style={{ color: theme.colors.text }}>Loading your theme...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize,
        lineHeight: theme.typography.lineHeight
      }}
    >
      {/* Background Effects */}
      {theme.effects.gradients && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="relative z-10 border-b"
        style={{
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary + '40',
          backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none'
        }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-colors hover:opacity-80"
            style={{ color: theme.colors.text }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: theme.colors.secondary }} />
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: theme.colors.text }}>
              {assistantName}
            </h1>
          </div>
          <Link
            href="/customize-agent"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{
              backgroundColor: theme.colors.background + '40',
              color: theme.colors.text
            }}
          >
            <Palette className="w-4 h-4" />
            <span className="text-xs font-medium">Customize</span>
          </Link>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 max-w-5xl min-h-[calc(100dvh-120px)] md:h-[calc(100vh-120px)] flex flex-col">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] mb-6">
          <div
            className="relative overflow-hidden rounded-2xl border p-5"
            style={{
              backgroundColor: theme.colors.background + "40",
              borderColor: theme.colors.primary + "30",
              backdropFilter: theme.effects.glassEffect ? "blur(12px)" : "none",
            }}
          >
            {theme.effects.gradients && (
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background: `radial-gradient(circle at top left, ${theme.colors.accent}45, transparent 65%)`,
                }}
              />
            )}
            <div className="relative flex items-center gap-4">
              <div
                className={`w-12 h-12 flex items-center justify-center ${getAvatarClassName()}`}
                style={{
                  background: theme.effects.gradients
                    ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary})`
                    : theme.colors.accent,
                }}
              >
                {theme.layout.avatarStyle !== "none" && (
                  theme.layout.avatarStyle === "hexagon" ? (
                    <div className="-rotate-45">
                      <Bot className="w-6 h-6" style={{ color: theme.colors.text }} />
                    </div>
                  ) : (
                    <Bot className="w-6 h-6" style={{ color: theme.colors.text }} />
                  )
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {assistantName}
                </p>
                <h2 className="text-lg font-semibold">
                  Your Builder's Lab strategist
                </h2>
                <p className="text-xs opacity-70">
                  Connected to your knowledge base, calendar, and skills.
                </p>
              </div>
            </div>
            <div className="relative mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
              {["Knowledge Base", "Calendar", "Skills", "Content Drafting"].map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-full border"
                  style={{
                    borderColor: theme.colors.primary + "30",
                    backgroundColor: theme.colors.background + "60",
                    color: theme.colors.text,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: theme.colors.aiMessage,
              borderColor: theme.colors.primary + "30",
              backdropFilter: theme.effects.glassEffect ? "blur(12px)" : "none",
            }}
          >
            <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-3">
              Quick prompts
            </p>
            <div className="flex flex-col gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="group flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-all hover:opacity-90"
                  style={{
                    borderColor: theme.colors.primary + "20",
                    backgroundColor: theme.colors.background + "60",
                    color: theme.colors.text,
                  }}
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-90" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4 mb-6">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border p-4"
              style={{
                backgroundColor: theme.colors.background + "50",
                borderColor: theme.colors.primary + "20",
                backdropFilter: theme.effects.glassEffect ? "blur(10px)" : "none",
              }}
            >
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.tone }}
                />
                <span>{item.label}</span>
              </div>
              <p className="mt-3 text-sm font-semibold">{item.value}</p>
              <p className="text-[11px] opacity-60">{item.hint}</p>
            </div>
          ))}
        </div>
        {/* Quick Actions for Overdue Tasks */}
        {incomplete.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Priority: Overdue Tasks</h3>
            </div>
            <div className="space-y-2">
              {incomplete.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl border group hover:border-opacity-50 transition-all"
                  style={{
                    backgroundColor: theme.colors.background + '40',
                    borderColor: theme.colors.primary + '20'
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" style={{ color: theme.colors.text }}>{task.title}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-widest" style={{ color: theme.colors.text }}>{task.platform} // {task.content_type?.replace('_', ' ')}</span>
                  </div>
                  <button
                    onClick={() => handleCreateContent(task)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold hover:opacity-80 transition-all"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.text
                    }}
                  >
                    Create <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {incomplete.length > 3 && (
                <Link
                  href="/calendar"
                  className="block text-center text-[10px] font-bold hover:opacity-80 transition-colors uppercase pt-1"
                  style={{ color: theme.colors.text + '80' }}
                >
                  View all {incomplete.length} overdue tasks
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto mb-4 ${getSpacingValue()} scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}>
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {theme.layout.avatarStyle !== 'none' && (
                  <div
                    className={`w-9 h-9 flex-shrink-0 flex items-center justify-center ${getAvatarClassName()}`}
                    style={{
                      background: theme.effects.gradients && !isUser
                        ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary})`
                        : isUser ? theme.colors.userMessage : theme.colors.accent
                    }}
                  >
                    {theme.layout.avatarStyle === 'hexagon' ? (
                      <div className="-rotate-45">
                        {isUser ? (
                          <User className="w-5 h-5" style={{ color: theme.colors.text }} />
                        ) : (
                          <Bot className="w-5 h-5" style={{ color: theme.colors.text }} />
                        )}
                      </div>
                    ) : (
                      isUser ? (
                        <User className="w-5 h-5" style={{ color: theme.colors.text }} />
                      ) : (
                        <Bot className="w-5 h-5" style={{ color: theme.colors.text }} />
                      )
                    )}
                  </div>
                )}
                <div className="flex-1 max-w-[70%]">
                  <div style={getBubbleStyle(isUser)}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 justify-start">
              {theme.layout.avatarStyle !== 'none' && (
                <div
                  className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${getAvatarClassName()}`}
                  style={{
                    background: theme.effects.gradients
                      ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary})`
                      : theme.colors.accent
                  }}
                >
                  <Bot className="w-5 h-5" style={{ color: theme.colors.text }} />
                </div>
              )}
              <div style={{
                ...getBubbleStyle(false),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: theme.colors.text }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: theme.colors.aiMessage,
            border: `1px solid ${theme.colors.primary}40`,
            backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none'
          }}
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Ask ${assistantName} about anything you've built...`}
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.primary}40`,
              }}
              disabled={loading}
              ref={inputRef}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-80 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.text,
                boxShadow: theme.effects.shadows ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
