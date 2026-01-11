# Agent Interface Customization

A complete visual customization system for your AI agent interface with real-time preview and one-click deployment.

## Features

- **Live Preview**: See changes instantly as you customize
- **8 Preset Themes**: Start with professionally designed themes
- **Full Customization**: Colors, typography, layout, effects
- **Real-time Sync**: Changes apply instantly across all devices
- **One-Click Apply**: Save and deploy your theme with one button
- **Persistent**: Your theme is saved and loads automatically

## How to Use

### 1. Access the Customization Page

Navigate to `/customize-agent` or click the "Customize Agent" link in your dashboard.

### 2. Choose a Starting Point

**Option A: Start with a Preset**
- Browse the preset themes in the right panel
- Click any preset to apply it instantly
- Then customize to make it your own

**Option B: Start from Scratch**
- Begin customizing the default theme
- Adjust colors, typography, layout, and effects

### 3. Customize Your Theme

#### Colors
- **Primary**: Main brand color (headers, buttons)
- **Secondary**: Accent color (highlights, effects)
- **Background**: Main background color
- **User Message**: Your message bubble color
- **AI Message**: AI message bubble color
- **Text**: All text color
- **Accent**: Additional accent color

#### Typography
- **Font Family**: Choose from 5 font options
- **Font Size**: 14px to 18px
- **Line Height**: Compact to spacious reading

#### Layout
- **Layout Type**: sidebar | fullscreen | compact | floating
- **Message Style**: bubbles | cards | minimal | notion-style
- **Avatar Style**: circular | square | hexagon | none
- **Spacing**: compact | comfortable | spacious

#### Effects
- **Animations**: Smooth transitions and animations
- **Glass Effect**: Frosted glass backdrop blur
- **Shadows**: Depth and elevation shadows
- **Gradients**: Gradient backgrounds and effects

### 4. Preview in Real-Time

The center panel shows a live preview of your theme with sample messages. Everything updates instantly as you make changes.

### 5. Apply Your Theme

Click the "Apply Theme" button in the top-right corner to save and activate your theme. It will apply immediately to:
- The themed chat page (`/themed-chat`)
- Any other pages using `useAgentTheme()` hook

### 6. Test Your Theme

Visit `/themed-chat` to interact with your AI assistant using your custom theme.

## Preset Themes

### 1. Cyberpunk
Neon colors, futuristic vibes, high contrast
- Colors: Cyan, Magenta, Dark Purple
- Style: Cards with glass effect
- Best for: Tech-forward, gaming, digital art

### 2. Minimal Light
Clean, professional, easy on the eyes
- Colors: Black, White, Gray
- Style: Minimal bubbles
- Best for: Professional, corporate, documentation

### 3. Forest
Natural greens, calming, organic
- Colors: Emerald, Green, Dark Green
- Style: Bubbles with gradients
- Best for: Wellness, sustainability, nature

### 4. Ocean Breeze
Cool blues, refreshing, spacious
- Colors: Sky Blue, Cyan, Navy
- Style: Bubbles with glass effect
- Best for: Productivity, focus, clarity

### 5. Sunset
Warm oranges and reds, energetic
- Colors: Amber, Orange, Red
- Style: Cards with gradients
- Best for: Creative, bold, attention-grabbing

### 6. Monochrome
Grayscale, minimalist, code-focused
- Colors: Grays, Black, White
- Style: Minimal, no effects
- Best for: Developers, minimalists, focus

### 7. Notion Style
Clean, document-like, familiar
- Colors: Beige, Gray, Blue accent
- Style: Notion-style with border accents
- Best for: Note-taking, documentation, productivity

### 8. Neon Dreams
Purple and pink neon, modern
- Colors: Purple, Pink, Indigo
- Style: Bubbles with glass and gradients
- Best for: Modern, creative, engaging

## Technical Details

### Database Schema

```sql
user_agent_themes
├── id (uuid)
├── user_id (uuid)
├── theme_name (text)
├── colors (jsonb)
├── typography (jsonb)
├── layout (jsonb)
├── effects (jsonb)
├── custom_css (text, optional)
├── is_active (boolean)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### React Hook: `useAgentTheme()`

Use this hook in any component to apply the user's theme:

```typescript
import { useAgentTheme } from '@/lib/hooks/useAgentTheme';

export default function MyComponent() {
  const { theme, cssVars, loading } = useAgentTheme();

  if (loading) return <div>Loading theme...</div>;

  return (
    <div style={cssVars}>
      {/* Your themed content */}
    </div>
  );
}
```

### Real-time Updates

The system uses Supabase Realtime to sync theme changes instantly:
- Changes in `/customize-agent` update the database
- Database triggers ensure only one active theme per user
- Realtime listeners in `useAgentTheme()` apply updates immediately
- No page refresh needed

## Integration with Existing Apps

### Option 1: Use the Hook

```typescript
import { useAgentTheme } from '@/lib/hooks/useAgentTheme';

const { theme, loading } = useAgentTheme();

// Apply theme colors
<div style={{
  backgroundColor: theme.colors.background,
  color: theme.colors.text
}}>
```

### Option 2: Use CSS Variables

```typescript
import { useAgentTheme } from '@/lib/hooks/useAgentTheme';

const { cssVars } = useAgentTheme();

// Apply as inline styles
<div style={cssVars}>
  {/* Uses --color-primary, --color-background, etc. */}
</div>
```

### Option 3: Use Theme Styles Hook

```typescript
import { useThemeStyles } from '@/lib/hooks/useAgentTheme';

const {
  containerStyle,
  primaryButtonStyle,
  userMessageStyle,
  aiMessageStyle
} = useThemeStyles();

<div style={containerStyle}>
  <button style={primaryButtonStyle}>Click</button>
</div>
```

## Advanced: Custom CSS

For advanced users, you can add custom CSS in the theme object:

```typescript
const theme = {
  // ... other properties
  custom_css: `
    .message-bubble {
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  `
};
```

## Troubleshooting

### Theme Not Applying
1. Ensure you're logged in
2. Click "Apply Theme" button to save
3. Check browser console for errors
4. Try refreshing the page

### Real-time Updates Not Working
1. Check Supabase Realtime is enabled
2. Verify RLS policies allow user access
3. Check network tab for subscription errors

### Preview Looks Different Than Live
1. Some browsers cache styles differently
2. Try hard refresh (Ctrl+Shift+R)
3. Check if custom CSS conflicts with theme

## Future Enhancements

- Import/Export themes as JSON
- Share themes with other users
- Theme marketplace
- Mobile-specific themes
- Dark/Light mode toggle
- More preset themes
- Theme version history
- AI-generated themes based on preferences
