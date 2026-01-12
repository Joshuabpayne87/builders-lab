# Funnel Builder

AI-powered funnel builder that generates landing pages, previews them in a sandbox, deploys to Builder's Lab, and integrates with CRM for lead capture.

## Features

- **AI-Powered Strategy Generation**: Chat with Sales Architect to create funnel strategy
- **Automated Code Generation**: Generate complete HTML landing pages with Gemini AI
- **Live Preview**: Preview funnels in desktop and mobile views
- **One-Click Deployment**: Deploy funnels with custom slugs
- **CRM Integration**: Automatically capture leads in your CRM
- **Form Submissions**: Built-in form handling with validation
- **Download HTML**: Export generated landing pages

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase (Database & Auth)
- Google Gemini AI
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NEXT_PUBLIC_APP_URL`: Your application URL (e.g., http://localhost:3000)

4. Run database migrations:
   ```bash
   psql $DATABASE_URL -f supabase/migrations/20260112_update_funnels_for_landing_pages.sql
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000/apps/funnels](http://localhost:3000/apps/funnels)

## Usage

### Creating a Funnel

1. Navigate to `/apps/funnels`
2. Chat with the Sales Architect about your offer
3. Review the generated strategy document
4. Click "Generate Landing Page" to create HTML
5. Preview the landing page in desktop/mobile views
6. Deploy with a custom slug or download the HTML

### Deploying a Funnel

1. After generating code, click "Deploy"
2. Enter a custom slug (optional)
3. Click "Deploy Now"
4. Your funnel will be live at `/f/your-slug`

### Form Submissions

All form submissions are automatically:
- Saved to your CRM as leads
- Tagged with the funnel slug
- Tracked with submission counts

## API Endpoints

- `POST /api/funnels/chat` - Chat with Sales Architect
- `POST /api/funnels/generate` - Generate HTML code
- `POST /api/funnels/deploy` - Deploy funnel
- `POST /api/funnels/submit` - Handle form submissions
- `GET /f/[slug]` - Public funnel page

## Database Schema

### bl_funnels_projects

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `name`: Text
- `domain_slug`: Text (Unique)
- `html_code`: Text
- `strategy_doc`: Text
- `submission_count`: Integer
- `status`: Enum ('draft', 'published', 'archived')
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Project Structure

```
app/
├── apps/funnels/
│   ├── components/
│   │   ├── FunnelChat.tsx
│   │   ├── FunnelPreview.tsx
│   │   └── DeploymentModal.tsx
│   ├── services/
│   │   └── funnelService.ts
│   ├── FunnelContext.tsx
│   ├── types.ts
│   └── page.tsx
├── api/funnels/
│   ├── chat/route.ts
│   ├── generate/route.ts
│   ├── deploy/route.ts
│   └── submit/route.ts
└── f/[slug]/page.tsx
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
