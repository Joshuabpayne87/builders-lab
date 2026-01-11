"use client";

import type { AgentTheme } from "@/lib/types/agent-theme";
import { Bot, User, Send } from "lucide-react";

interface ChatPreviewProps {
  theme: AgentTheme;
}

export function ChatPreview({ theme }: ChatPreviewProps) {
  const sampleMessages = [
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' },
    { role: 'user', content: 'I need help planning my project timeline' },
    { role: 'assistant', content: 'I\'d be happy to help you plan your project timeline! Let\'s break this down:\n\n1. **Define milestones**: What are your key deliverables?\n2. **Estimate durations**: How long will each phase take?\n3. **Identify dependencies**: What needs to happen before what?\n4. **Buffer time**: Add 20% for unexpected delays\n\nWhat type of project are you working on?' },
    { role: 'user', content: 'It\'s a mobile app launch' },
    { role: 'assistant', content: 'Perfect! Here\'s a typical mobile app launch timeline:\n\n**Phase 1: Development** (8-12 weeks)\n• Core features\n• UI/UX polish\n• Testing\n\n**Phase 2: Pre-Launch** (2-3 weeks)\n• App store setup\n• Marketing materials\n• Beta testing\n\n**Phase 3: Launch** (1 week)\n• Submit to stores\n• PR push\n• Monitor feedback\n\nDoes this match your needs?' }
  ];

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

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize,
        lineHeight: theme.typography.lineHeight,
        height: '70vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Chat Header */}
      <div
        className="p-4 border-b"
        style={{
          backgroundColor: theme.colors.primary,
          color: theme.colors.text,
          backdropFilter: theme.effects.glassEffect ? 'blur(10px)' : 'none',
          borderColor: theme.colors.primary + '40'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 flex items-center justify-center ${getAvatarClassName()}`}
            style={{
              background: theme.effects.gradients
                ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary})`
                : theme.colors.accent
            }}
          >
            {theme.layout.avatarStyle !== 'none' && (
              theme.layout.avatarStyle === 'hexagon' ? (
                <div className="-rotate-45">
                  <Bot className="w-5 h-5" style={{ color: theme.colors.text }} />
                </div>
              ) : (
                <Bot className="w-5 h-5" style={{ color: theme.colors.text }} />
              )
            )}
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs opacity-80">Online • Ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className={`flex-1 p-6 overflow-y-auto ${getSpacingValue()}`}
        style={{
          backgroundColor: theme.colors.background
        }}
      >
        {sampleMessages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            theme={theme}
            avatarClass={getAvatarClassName()}
          />
        ))}
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
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            disabled
            className="flex-1 rounded-lg px-4 py-3 focus:outline-none transition-all"
            style={{
              backgroundColor: theme.colors.aiMessage,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.primary}40`
            }}
          />
          <button
            disabled
            className="p-3 rounded-lg transition-all"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.text,
              opacity: 0.5
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
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
  theme: AgentTheme;
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
