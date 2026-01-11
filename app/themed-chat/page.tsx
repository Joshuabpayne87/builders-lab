"use client";

import { useState, useEffect, useRef } from "react";
import { useAgentTheme } from "@/lib/hooks/useAgentTheme";
import { Bot, User, Send, Palette, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ThemedChatPage() {
  const { theme, loading } = useAgentTheme();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Hello! This is your themed AI assistant. Try customizing my appearance in the Customize Agent page!' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'm here to help! This is a demo of your customized interface.",
        "Your theme looks great! You can customize colors, typography, layout, and effects.",
        "Notice how the colors, spacing, and message styles match what you configured?",
        "Try asking me anything, or go back to customize my appearance further!",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
    }, 1000);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F172A' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your theme...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize,
        lineHeight: theme.typography.lineHeight
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{
          backgroundColor: theme.colors.primary,
          color: theme.colors.text,
          backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none',
          borderColor: theme.colors.primary + '40'
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 flex items-center justify-center ${getAvatarClassName()}`}
              style={{
                background: theme.effects.gradients
                  ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary})`
                  : theme.colors.accent
              }}
            >
              {theme.layout.avatarStyle !== 'none' && (
                theme.layout.avatarStyle === 'hexagon' ? (
                  <div className="-rotate-45">
                    <Bot className="w-6 h-6" style={{ color: theme.colors.text }} />
                  </div>
                ) : (
                  <Bot className="w-6 h-6" style={{ color: theme.colors.text }} />
                )
              )}
            </div>
            <div>
              <h1 className="font-bold text-lg">Your AI Assistant</h1>
              <p className="text-sm opacity-80">Online • Themed Interface</p>
            </div>
          </div>

          <Link
            href="/customize-agent"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.colors.background + '40',
              color: theme.colors.text
            }}
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">Customize</span>
          </Link>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className={`max-w-4xl mx-auto p-6 ${getSpacingValue()}`}>
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              theme={theme}
              avatarClass={getAvatarClassName()}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div
        className="p-4 border-t"
        style={{
          borderColor: theme.colors.primary + '20',
          backgroundColor: theme.colors.background,
          backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg px-4 py-3 focus:outline-none transition-all"
              style={{
                backgroundColor: theme.colors.aiMessage,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.primary}40`
              }}
            />
            <button
              type="submit"
              className="p-3 rounded-lg transition-all hover:opacity-80"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.text
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Theme Info Banner */}
      <div
        className="p-2 text-center text-xs"
        style={{
          backgroundColor: theme.colors.primary + '20',
          color: theme.colors.text
        }}
      >
        <p className="opacity-70">
          Current Theme: <span className="font-semibold">{theme.theme_name}</span> •
          <Link href="/customize-agent" className="underline ml-1 hover:opacity-80">
            Edit Theme
          </Link>
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  theme,
  avatarClass
}: {
  message: { role: string; content: string };
  theme: any;
  avatarClass: string;
}) {
  const isUser = message.role === 'user';

  const getBubbleStyle = () => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: isUser ? theme.colors.userMessage : theme.colors.aiMessage,
      color: theme.colors.text,
      boxShadow: theme.effects.shadows ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none',
      transition: theme.effects.animations ? 'all 0.2s ease' : 'none'
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
          border: `1px solid ${isUser ? theme.colors.userMessage : theme.colors.aiMessage}40`
        };
      case 'minimal':
        return {
          ...baseStyle,
          borderRadius: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'transparent',
          border: `1px solid ${isUser ? theme.colors.userMessage : theme.colors.aiMessage}60`
        };
      case 'notion-style':
        return {
          ...baseStyle,
          borderRadius: '0.375rem',
          padding: '0.75rem',
          backgroundColor: isUser ? theme.colors.userMessage + '10' : 'transparent',
          borderLeft: `3px solid ${isUser ? theme.colors.userMessage : theme.colors.aiMessage}`
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {theme.layout.avatarStyle !== 'none' && (
        <div
          className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${avatarClass}`}
          style={{
            background: theme.effects.gradients && !isUser
              ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary})`
              : isUser ? theme.colors.userMessage : theme.colors.accent
          }}
        >
          {theme.layout.avatarStyle === 'hexagon' ? (
            <div className="-rotate-45">
              {isUser ? (
                <User className="w-4 h-4" style={{ color: theme.colors.text }} />
              ) : (
                <Bot className="w-4 h-4" style={{ color: theme.colors.text }} />
              )}
            </div>
          ) : (
            isUser ? (
              <User className="w-4 h-4" style={{ color: theme.colors.text }} />
            ) : (
              <Bot className="w-4 h-4" style={{ color: theme.colors.text }} />
            )
          )}
        </div>
      )}

      {/* Message Content */}
      <div className="flex-1 max-w-[80%]">
        <div
          className={`${theme.effects.animations ? 'animate-fade-in' : ''}`}
          style={getBubbleStyle()}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    </div>
  );
}
