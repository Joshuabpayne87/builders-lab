# Funnel Builder - Complete Design Document

**Date:** 2026-01-12
**Status:** Approved
**Type:** New Feature Enhancement

## Overview

Transform the funnel builder from a strategy-only tool into a complete funnel creation system that generates code, previews in sandbox, deploys to Builder's Lab, and integrates with the CRM for subscriber collection.

## User Requirements

- **Input:** Users describe their offer via chat with AI Sales Architect
- **Output:** Fully functional HTML landing page with opt-in form
- **Preview:** Live sandbox preview with working form
- **Deployment:** Host on Builder's Lab OR download to host elsewhere
- **CRM Integration:** Form submissions automatically create contacts in the user's CRM
- **Multi-Tenant:** Each user only sees their funnels and their contacts

## Technical Architecture

### Database Schema

**New Table: `bl_funnels`**

```sql
CREATE TABLE bl_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  html_code TEXT NOT NULL,
  strategy_doc TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_funnels_user_id ON bl_funnels(user_id);
CREATE INDEX idx_funnels_slug ON bl_funnels(slug);
CREATE INDEX idx_funnels_status ON bl_funnels(status);

-- RLS Policies
ALTER TABLE bl_funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own funnels"
  ON bl_funnels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own funnels"
  ON bl_funnels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funnels"
  ON bl_funnels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funnels"
  ON bl_funnels FOR DELETE
  USING (auth.uid() = user_id);
```

### API Endpoints

#### 1. `/api/funnels/generate` (POST)
- **Auth:** Required
- **Input:** `{ strategyDoc: string, title: string }`
- **Output:** `{ htmlCode: string }`
- **Purpose:** Generate HTML code from strategy using AI

#### 2. `/api/funnels/submit` (POST)
- **Auth:** Public (anyone can submit)
- **Input:** `{ funnelId: string, name: string, email: string, phone?: string, ...customFields }`
- **Output:** `{ success: boolean, message: string }`
- **Purpose:** Save form submission to funnel owner's CRM
- **Process:**
  1. Look up funnel by ID → get user_id
  2. Create contact in `bl_crm_contacts` with that user_id
  3. Increment funnel submission_count
  4. Mark contact with tag: `funnel:${funnelSlug}`

#### 3. `/api/funnels/deploy` (POST)
- **Auth:** Required
- **Input:** `{ title: string, slug?: string, htmlCode: string, strategyDoc: string }`
- **Output:** `{ funnelId: string, url: string, slug: string }`
- **Purpose:** Save funnel to database and publish
- **Process:**
  1. Validate slug is unique (or generate one)
  2. Insert into `bl_funnels` with status='published'
  3. Return deployment URL

#### 4. `/api/funnels/[id]/update` (PATCH)
- **Auth:** Required + ownership check
- **Input:** `{ title?: string, htmlCode?: string, status?: string }`
- **Output:** `{ success: boolean }`
- **Purpose:** Update existing funnel

#### 5. `/api/funnels/[id]/delete` (DELETE)
- **Auth:** Required + ownership check
- **Purpose:** Delete funnel

#### 6. `/api/funnels/list` (GET)
- **Auth:** Required
- **Output:** `{ funnels: Funnel[] }`
- **Purpose:** Get user's funnels with stats

#### 7. `/f/[slug]` (GET) - Public Route
- **Auth:** Public
- **Purpose:** Serve deployed funnel HTML
- **Process:**
  1. Look up funnel by slug where status='published'
  2. Return HTML with injected funnel ID for form submission

### Frontend Updates

#### FunnelContext.tsx
Add state:
```typescript
funnelId: string | null;
deployedUrl: string | null;
deployedSlug: string | null;
submissionCount: number;
```

#### FunnelChat.tsx
- After strategy generated, show "Generate Code" button
- Call `/api/funnels/generate` with strategy
- Set generated code in context
- Show loading state during generation

#### FunnelPreview.tsx
Add toolbar buttons:
- **Deploy** - Opens deployment modal
- **Download** - Downloads HTML file
- **Test Form** - Shows test submission form

Add deployment modal:
- Input for custom slug
- Preview URL: `builderslab.com/f/{slug}`
- Publish button
- Copy URL after published

#### New Component: DeploymentModal.tsx
```typescript
interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  strategyDoc: string;
  onDeploy: (url: string) => void;
}
```

### Code Generation Strategy

AI generates fully self-contained HTML with:

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Offer Title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- Hero Section -->
  <!-- Benefits Section -->
  <!-- Opt-in Form -->
  <!-- Footer -->

  <script>
    // Form submission handler
    const FUNNEL_ID = '__FUNNEL_ID__'; // Injected at runtime
    const form = document.getElementById('optinForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      const response = await fetch('/api/funnels/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, funnelId: FUNNEL_ID })
      });

      if (response.ok) {
        // Show success message
        window.location.href = '#success';
      }
    });
  </script>
</body>
</html>
```

**Form Fields (Minimum):**
- Name (required)
- Email (required)
- Phone (optional)

**Design Principles:**
- Mobile-first responsive
- Professional typography
- Clear CTA buttons
- Form validation
- Success/error states
- Tailwind CSS for styling

## User Flow

### Creating a Funnel

1. User navigates to `/apps/funnels`
2. Chats with Sales Architect about offer
3. AI generates strategy → displays in Strategy tab
4. User clicks "Generate Code" button
5. AI generates HTML → displays in Preview tab
6. User tests form in sandbox
7. User clicks "Deploy to Builder's Lab"
8. Enters custom slug (optional)
9. Clicks "Publish"
10. Gets shareable URL: `builderslab.com/f/{slug}`
11. Can copy URL or download HTML

### Form Submission Flow

1. Visitor lands on `builderslab.com/f/puppy-training-123`
2. Fills out opt-in form
3. Submits form
4. JavaScript POSTs to `/api/funnels/submit`
5. API creates contact in funnel owner's CRM
6. Increments submission count
7. Shows success message
8. Visitor sees thank you message

### Viewing Submissions

1. User navigates to `/apps/crm`
2. Sees new contacts with tag `funnel:puppy-training-123`
3. Can filter by funnel tag
4. Can see which funnel generated each lead

## Security & Multi-Tenancy

**Isolation:**
- Each funnel has `user_id` foreign key
- RLS policies ensure users only see their funnels
- Form submissions routed to correct user's CRM

**Public Endpoints:**
- `/api/funnels/submit` - Must be public for form submissions
- `/f/[slug]` - Must be public to serve funnels

**Protected Endpoints:**
- `/api/funnels/generate` - Requires auth
- `/api/funnels/deploy` - Requires auth + ownership
- `/api/funnels/[id]/update` - Requires auth + ownership
- `/api/funnels/[id]/delete` - Requires auth + ownership

**Validation:**
- Rate limiting on form submissions (prevent spam)
- Email validation
- Slug uniqueness validation
- HTML sanitization (if user can edit code directly)

## Implementation Phases

### Phase 1: Database & Core API
- Create `bl_funnels` table with migrations
- Implement `/api/funnels/submit` endpoint
- Test CRM integration

### Phase 2: Code Generation
- Update AI prompt to generate HTML
- Implement `/api/funnels/generate` endpoint
- Test generated code quality

### Phase 3: Deployment System
- Implement `/api/funnels/deploy` endpoint
- Create public route `/f/[slug]`
- Test deployment flow

### Phase 4: UI Updates
- Add "Generate Code" button to FunnelChat
- Update FunnelPreview with toolbar
- Create DeploymentModal component
- Add download functionality

### Phase 5: Testing & Polish
- Test multi-tenant isolation
- Test form submissions → CRM
- Add error handling
- Add loading states
- Add success notifications

## Success Metrics

- Users can generate funnel code in < 30 seconds
- Form submissions successfully create CRM contacts
- Deployed funnels load in < 2 seconds
- Zero cross-tenant data leaks
- Users can deploy and share URLs within 1 minute

## Future Enhancements

- Analytics dashboard (views, conversions, conversion rate)
- A/B testing different funnel versions
- Custom domain support
- Email autoresponder integration
- Multi-page funnels (landing → VSL → checkout)
- Template library
- Drag-and-drop editor
