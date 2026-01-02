# The Builder's Lab 🚀

A unified AI productivity suite combining 5 powerful tools into one seamless platform.

## 🎯 What's Inside

### 1. **Unravel** - Thread to Article Converter
Transform messy social media threads and URLs into polished blog posts or viral social media content.

### 2. **PromptStash** - AI Prompt Engineering IDE
Analyze, score, and optimize your AI prompts with intelligent suggestions and auto-refinement.

### 3. **InsightLens** - Content Transformer
Convert any content into summaries, mind maps, podcast scripts, or bullet points.

### 4. **Banana Blitz** - AI Image Generator
Turn text descriptions into stunning social media visuals using Gemini AI.

### 5. **Serendipity** - Content Strategist
Generate complete content workflows, lead magnets, email sequences, and social campaigns.

## ✨ Features

- **Single Sign-On** - One account across all tools
- **Supabase Auth** - Secure authentication with email/password and Google OAuth
- **Persistent Storage** - All your creations saved to Supabase
- **AI Assistant** - Personal AI that maintains context across all tools
- **Modern UI** - Beautiful, responsive design with Tailwind CSS
- **Fast Performance** - Built with Next.js 15 and Turbopack

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- A Google Gemini API key ([ai.google.dev](https://ai.google.dev))

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Go to the SQL Editor and run the scripts from `DATABASE_SCHEMA.md`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Enable Google OAuth (Optional)

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
the_builders_lab_app/
├── app/
│   ├── apps/
│   │   ├── unravel/          # Thread converter
│   │   ├── promptstash/      # Prompt IDE
│   │   ├── insightlens/      # Content transformer
│   │   ├── banana-blitz/     # Image generator
│   │   └── serendipity/      # Content strategist
│   ├── assistant/            # AI Assistant
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Main hub
│   └── layout.tsx            # Root layout
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── gemini.ts            # Gemini AI client
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utilities
├── DATABASE_SCHEMA.md       # Database setup guide
└── README.md               # This file
```

## 🗄️ Database Setup

See `DATABASE_SCHEMA.md` for detailed database schema and setup instructions.

Quick setup:
1. Open Supabase SQL Editor
2. Copy scripts from `DATABASE_SCHEMA.md`
3. Execute each table creation script
4. Verify Row Level Security policies are active

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts` to customize the color scheme:

```ts
theme: {
  extend: {
    colors: {
      // Your custom colors here
    }
  }
}
```

### Adding New Tools

1. Create a new page in `app/apps/your-tool/page.tsx`
2. Add the tool to the dashboard in `app/dashboard/page.tsx`
3. Create database table if needed (see `DATABASE_SCHEMA.md`)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to add all these in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_GEMINI_API_KEY
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.5 Flash
- **Icons**: Lucide React
- **Build Tool**: Turbopack

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 💡 Tips

- **API Keys**: Never commit your `.env.local` file to Git
- **Database**: Run database migrations before deploying
- **Testing**: Test all features with your Supabase project before deploying
- **Performance**: Use Turbopack for faster development (`npm run dev --turbo`)

## 🐛 Troubleshooting

### "API Key not found" error
- Check that your `.env.local` file exists
- Verify environment variable names match exactly
- Restart the development server after adding env vars

### Authentication not working
- Verify Supabase URL and anon key are correct
- Check that database tables and RLS policies are set up
- Ensure redirect URLs are configured in Supabase

### Images not generating
- Verify Gemini API key has image generation enabled
- Check that you're using the correct model (`gemini-2.0-flash-exp`)

## 📞 Support

For issues and questions:
- Check the documentation in this README
- Review `DATABASE_SCHEMA.md` for database setup
- Open an issue on GitHub

---

Built with ❤️ using Next.js, Supabase, and Google Gemini
