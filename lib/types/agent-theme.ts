/**
 * Type definitions for Agent Theme Customization
 */

export interface AgentThemeColors {
  primary: string;
  secondary: string;
  background: string;
  userMessage: string;
  aiMessage: string;
  text: string;
  accent: string;
}

export interface AgentThemeTypography {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
}

export type LayoutType = 'sidebar' | 'fullscreen' | 'compact' | 'floating';
export type MessageStyle = 'bubbles' | 'cards' | 'minimal' | 'notion-style';
export type AvatarStyle = 'circular' | 'square' | 'hexagon' | 'none';
export type Spacing = 'compact' | 'comfortable' | 'spacious';

export interface AgentThemeLayout {
  type: LayoutType;
  messageStyle: MessageStyle;
  avatarStyle: AvatarStyle;
  spacing: Spacing;
}

export interface AgentThemeEffects {
  animations: boolean;
  glassEffect: boolean;
  shadows: boolean;
  gradients: boolean;
}

export interface AgentTheme {
  id?: string;
  user_id?: string;
  theme_name: string;
  colors: AgentThemeColors;
  typography: AgentThemeTypography;
  layout: AgentThemeLayout;
  effects: AgentThemeEffects;
  custom_css?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Default theme
export const DEFAULT_THEME: AgentTheme = {
  theme_name: 'Default',
  colors: {
    primary: '#8B5CF6',
    secondary: '#EC4899',
    background: '#0F172A',
    userMessage: '#8B5CF6',
    aiMessage: '#1E293B',
    text: '#F1F5F9',
    accent: '#EC4899'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '16px',
    lineHeight: '1.5'
  },
  layout: {
    type: 'sidebar',
    messageStyle: 'bubbles',
    avatarStyle: 'circular',
    spacing: 'comfortable'
  },
  effects: {
    animations: true,
    glassEffect: false,
    shadows: true,
    gradients: true
  }
};

// Preset themes library
export const PRESET_THEMES: AgentTheme[] = [
  {
    theme_name: 'Cyberpunk',
    colors: {
      primary: '#00F0FF',
      secondary: '#FF00E5',
      background: '#0A0E27',
      userMessage: '#00F0FF',
      aiMessage: '#1A1F3A',
      text: '#FFFFFF',
      accent: '#FF00E5'
    },
    typography: {
      fontFamily: 'Orbitron, monospace',
      fontSize: '16px',
      lineHeight: '1.6'
    },
    layout: {
      type: 'fullscreen',
      messageStyle: 'cards',
      avatarStyle: 'hexagon',
      spacing: 'comfortable'
    },
    effects: {
      animations: true,
      glassEffect: true,
      shadows: true,
      gradients: true
    }
  },
  {
    theme_name: 'Minimal Light',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      background: '#FFFFFF',
      userMessage: '#F3F4F6',
      aiMessage: '#FFFFFF',
      text: '#111827',
      accent: '#3B82F6'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '15px',
      lineHeight: '1.5'
    },
    layout: {
      type: 'compact',
      messageStyle: 'minimal',
      avatarStyle: 'circular',
      spacing: 'compact'
    },
    effects: {
      animations: false,
      glassEffect: false,
      shadows: true,
      gradients: false
    }
  },
  {
    theme_name: 'Forest',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      background: '#064E3B',
      userMessage: '#10B981',
      aiMessage: '#065F46',
      text: '#ECFDF5',
      accent: '#34D399'
    },
    typography: {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      lineHeight: '1.6'
    },
    layout: {
      type: 'sidebar',
      messageStyle: 'bubbles',
      avatarStyle: 'circular',
      spacing: 'spacious'
    },
    effects: {
      animations: true,
      glassEffect: false,
      shadows: true,
      gradients: true
    }
  },
  {
    theme_name: 'Ocean Breeze',
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      background: '#0C4A6E',
      userMessage: '#0EA5E9',
      aiMessage: '#075985',
      text: '#F0F9FF',
      accent: '#38BDF8'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5'
    },
    layout: {
      type: 'sidebar',
      messageStyle: 'bubbles',
      avatarStyle: 'circular',
      spacing: 'comfortable'
    },
    effects: {
      animations: true,
      glassEffect: true,
      shadows: true,
      gradients: true
    }
  },
  {
    theme_name: 'Sunset',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      background: '#78350F',
      userMessage: '#F59E0B',
      aiMessage: '#92400E',
      text: '#FEF3C7',
      accent: '#EF4444'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5'
    },
    layout: {
      type: 'fullscreen',
      messageStyle: 'cards',
      avatarStyle: 'square',
      spacing: 'comfortable'
    },
    effects: {
      animations: true,
      glassEffect: false,
      shadows: true,
      gradients: true
    }
  },
  {
    theme_name: 'Monochrome',
    colors: {
      primary: '#71717A',
      secondary: '#A1A1AA',
      background: '#18181B',
      userMessage: '#27272A',
      aiMessage: '#3F3F46',
      text: '#FAFAFA',
      accent: '#A1A1AA'
    },
    typography: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '15px',
      lineHeight: '1.6'
    },
    layout: {
      type: 'compact',
      messageStyle: 'minimal',
      avatarStyle: 'square',
      spacing: 'compact'
    },
    effects: {
      animations: false,
      glassEffect: false,
      shadows: false,
      gradients: false
    }
  },
  {
    theme_name: 'Notion Style',
    colors: {
      primary: '#37352F',
      secondary: '#787774',
      background: '#FFFFFF',
      userMessage: '#F7F6F3',
      aiMessage: '#FFFFFF',
      text: '#37352F',
      accent: '#2EAADC'
    },
    typography: {
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5'
    },
    layout: {
      type: 'fullscreen',
      messageStyle: 'notion-style',
      avatarStyle: 'none',
      spacing: 'spacious'
    },
    effects: {
      animations: false,
      glassEffect: false,
      shadows: false,
      gradients: false
    }
  },
  {
    theme_name: 'Neon Dreams',
    colors: {
      primary: '#A78BFA',
      secondary: '#F472B6',
      background: '#1E1B4B',
      userMessage: '#A78BFA',
      aiMessage: '#312E81',
      text: '#F5F3FF',
      accent: '#F472B6'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5'
    },
    layout: {
      type: 'floating',
      messageStyle: 'bubbles',
      avatarStyle: 'circular',
      spacing: 'comfortable'
    },
    effects: {
      animations: true,
      glassEffect: true,
      shadows: true,
      gradients: true
    }
  }
];
