# Funnel Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete funnel builder that generates landing pages, previews in sandbox, deploys to Builder's Lab, and integrates with CRM for lead capture.

**Architecture:** Extend existing funnel database schema with simple landing page workflow. AI generates self-contained HTML, user previews in iframe, deploys to public URL, form submissions create CRM contacts.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Google Gemini AI, Tailwind CSS

---

## Task 1: Update Database Schema

**Files:**
- Modify: `supabase/FUNNELS_SETUP.sql`
- Create: `supabase/migrations/20260112_update_funnels_for_landing_pages.sql`

**Step 1: Add migration file for new fields**

Create `supabase/migrations/20260112_update_funnels_for_landing_pages.sql`:

```sql
-- Add fields needed for simple landing page funnels
ALTER TABLE bl_funnels_projects
ADD COLUMN IF NOT EXISTS html_code TEXT,
ADD COLUMN IF NOT EXISTS strategy_doc TEXT,
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft';

-- Update domain_slug to be NOT NULL for published funnels
-- Add check constraint for published funnels requiring slug
ALTER TABLE bl_funnels_projects
ADD CONSTRAINT require_slug_when_published
CHECK (status != 'published' OR domain_slug IS NOT NULL);

-- Add index for slug lookups
CREATE INDEX IF NOT EXISTS idx_funnels_domain_slug ON bl_funnels_projects(domain_slug);

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_funnels_user_id ON bl_funnels_projects(user_id);

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_funnels_status ON bl_funnels_projects(status);
```

**Step 2: Run migration locally**

Run: `psql $DATABASE_URL -f supabase/migrations/20260112_update_funnels_for_landing_pages.sql`

Expected: Tables updated successfully

**Step 3: Commit database changes**

```bash
git add supabase/migrations/20260112_update_funnels_for_landing_pages.sql
git commit -m "feat(db): add landing page fields to funnels schema"
```

---

## Task 2: Create Funnel Types

**Files:**
- Create: `app/apps/funnels/types.ts`

**Step 1: Create type definitions**

Create `app/apps/funnels/types.ts`:

```typescript
// Funnel Type Definitions

export type FunnelStage = 'IDEA' | 'STRATEGY' | 'BLUEPRINT' | 'CODE';
export type FunnelStatus = 'draft' | 'published' | 'archived';

export interface Funnel {
  id: string;
  user_id: string;
  name: string;
  domain_slug: string | null;
  current_stage: 'IDEA' | 'STRATEGY' | 'CONTENT' | 'BUILD' | 'QA' | 'PUBLISHED';
  offer_details: Record<string, any> | null;
  html_code: string | null;
  strategy_doc: string | null;
  submission_count: number;
  status: FunnelStatus;
  created_at: string;
  updated_at: string;
}

export interface FunnelFormData {
  name: string;
  domain_slug?: string;
  html_code?: string;
  strategy_doc?: string;
  status?: FunnelStatus;
}

export interface FunnelSubmission {
  funnelId: string;
  name: string;
  email: string;
  phone?: string;
  [key: string]: any; // Allow custom fields
}

export interface GenerateCodeRequest {
  strategyDoc: string;
  title: string;
}

export interface GenerateCodeResponse {
  htmlCode: string;
}

export interface DeployFunnelRequest {
  name: string;
  slug?: string;
  htmlCode: string;
  strategyDoc: string;
}

export interface DeployFunnelResponse {
  funnelId: string;
  url: string;
  slug: string;
}
```

**Step 2: Commit type definitions**

```bash
git add app/apps/funnels/types.ts
git commit -m "feat(funnels): add TypeScript type definitions"
```

---

## Task 3: Update Funnel Context

**Files:**
- Modify: `app/apps/funnels/FunnelContext.tsx`

**Step 1: Update context with new state**

In `app/apps/funnels/FunnelContext.tsx`, replace the entire file:

```typescript
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { FunnelStage } from './types';

interface FunnelContextType {
  stage: FunnelStage;
  setStage: (stage: FunnelStage) => void;
  strategyDoc: string;
  setStrategyDoc: (doc: string) => void;
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  isGenerating: boolean;
  setIsGenerating: (is: boolean) => void;

  // New state for deployment
  funnelId: string | null;
  setFunnelId: (id: string | null) => void;
  deployedUrl: string | null;
  setDeployedUrl: (url: string | null) => void;
  deployedSlug: string | null;
  setDeployedSlug: (slug: string | null) => void;
  submissionCount: number;
  setSubmissionCount: (count: number) => void;
}

const FunnelContext = createContext<FunnelContextType | undefined>(undefined);

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<FunnelStage>('IDEA');
  const [strategyDoc, setStrategyDoc] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // New deployment state
  const [funnelId, setFunnelId] = useState<string | null>(null);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [deployedSlug, setDeployedSlug] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);

  return (
    <FunnelContext.Provider
      value={{
        stage,
        setStage,
        strategyDoc,
        setStrategyDoc,
        generatedCode,
        setGeneratedCode,
        isGenerating,
        setIsGenerating,
        funnelId,
        setFunnelId,
        deployedUrl,
        setDeployedUrl,
        deployedSlug,
        setDeployedSlug,
        submissionCount,
        setSubmissionCount,
      }}
    >
      {children}
    </FunnelContext.Provider>
  );
}

export function useFunnel() {
  const context = useContext(FunnelContext);
  if (context === undefined) {
    throw new Error('useFunnel must be used within a FunnelProvider');
  }
  return context;
}
```

**Step 2: Commit context updates**

```bash
git add app/apps/funnels/FunnelContext.tsx
git commit -m "feat(funnels): add deployment state to context"
```

---

## Task 4: Create Funnel Service

**Files:**
- Create: `app/apps/funnels/services/funnelService.ts`

**Step 1: Create service for database operations**

Create `app/apps/funnels/services/funnelService.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import type { Funnel, FunnelFormData } from "../types";

/**
 * Get all funnels for the current user
 */
export async function getUserFunnels(): Promise<Funnel[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch funnels: ${error.message}`);
  return data as Funnel[];
}

/**
 * Get a single funnel by ID
 */
export async function getFunnel(funnelId: string): Promise<Funnel | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .select("*")
    .eq("id", funnelId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch funnel: ${error.message}`);
  }

  return data as Funnel;
}

/**
 * Get a funnel by slug (for public access)
 */
export async function getFunnelBySlug(slug: string): Promise<Funnel | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .select("*")
    .eq("domain_slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch funnel: ${error.message}`);
  }

  return data as Funnel;
}

/**
 * Create a new funnel
 */
export async function createFunnel(formData: FunnelFormData): Promise<Funnel> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .insert({
      user_id: user.id,
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create funnel: ${error.message}`);
  return data as Funnel;
}

/**
 * Update an existing funnel
 */
export async function updateFunnel(
  funnelId: string,
  formData: Partial<FunnelFormData>
): Promise<Funnel> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("bl_funnels_projects")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", funnelId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update funnel: ${error.message}`);
  return data as Funnel;
}

/**
 * Increment submission count
 */
export async function incrementSubmissionCount(funnelId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_funnel_submissions", {
    funnel_id: funnelId,
  });

  if (error) {
    // Fallback: manual increment if RPC doesn't exist
    const { data: funnel } = await supabase
      .from("bl_funnels_projects")
      .select("submission_count")
      .eq("id", funnelId)
      .single();

    if (funnel) {
      await supabase
        .from("bl_funnels_projects")
        .update({
          submission_count: (funnel.submission_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", funnelId);
    }
  }
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string, excludeFunnelId?: string): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from("bl_funnels_projects")
    .select("id")
    .eq("domain_slug", slug);

  if (excludeFunnelId) {
    query = query.neq("id", excludeFunnelId);
  }

  const { data } = await query.single();

  return !data;
}

/**
 * Generate unique slug from title
 */
export function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);

  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
}
```

**Step 2: Add database function for increment**

Create `supabase/migrations/20260112_add_increment_function.sql`:

```sql
-- Function to safely increment submission count
CREATE OR REPLACE FUNCTION increment_funnel_submissions(funnel_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE bl_funnels_projects
  SET
    submission_count = COALESCE(submission_count, 0) + 1,
    updated_at = NOW()
  WHERE id = funnel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 3: Commit service and migration**

```bash
git add app/apps/funnels/services/funnelService.ts supabase/migrations/20260112_add_increment_function.sql
git commit -m "feat(funnels): add funnel database service"
```

---

## Task 5: Create Form Submission API

**Files:**
- Create: `app/api/funnels/submit/route.ts`

**Step 1: Create submission endpoint**

Create `app/api/funnels/submit/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFunnelBySlug, incrementSubmissionCount } from "@/app/apps/funnels/services/funnelService";
import type { FunnelSubmission } from "@/app/apps/funnels/types";

export async function POST(req: Request) {
  try {
    const body: FunnelSubmission = await req.json();
    const { funnelId, name, email, phone, ...customFields } = body;

    // Validate required fields
    if (!funnelId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: funnelId, name, email" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get funnel to find owner
    const { data: funnel, error: funnelError } = await supabase
      .from("bl_funnels_projects")
      .select("id, user_id, domain_slug")
      .eq("id", funnelId)
      .eq("status", "published")
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: "Funnel not found or not published" },
        { status: 404 }
      );
    }

    // Create contact in funnel owner's CRM
    const { data: contact, error: contactError } = await supabase
      .from("bl_crm_contacts")
      .insert({
        user_id: funnel.user_id,
        name,
        email,
        phone: phone || null,
        contact_type: "LEAD",
        status: "ACTIVE",
        tags: [`funnel:${funnel.domain_slug}`],
        notes: `Captured from funnel: ${funnel.domain_slug}`,
      })
      .select()
      .single();

    if (contactError) {
      // Check if contact already exists (duplicate email)
      if (contactError.code === "23505") {
        // Update existing contact instead
        const { error: updateError } = await supabase
          .from("bl_crm_contacts")
          .update({
            last_contacted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", funnel.user_id)
          .eq("email", email);

        if (updateError) {
          console.error("Failed to update existing contact:", updateError);
        }
      } else {
        console.error("Failed to create contact:", contactError);
        return NextResponse.json(
          { error: "Failed to save submission" },
          { status: 500 }
        );
      }
    }

    // Increment funnel submission count
    await incrementSubmissionCount(funnelId);

    // Create lead record
    if (contact) {
      await supabase.from("bl_funnels_leads").insert({
        funnel_id: funnelId,
        contact_id: contact.id,
        step_id: null, // Not using steps for simple landing pages
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch soon.",
    });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit submission API**

```bash
git add app/api/funnels/submit/route.ts
git commit -m "feat(api): add funnel form submission endpoint"
```

---

## Task 6: Create Code Generation API

**Files:**
- Create: `app/api/funnels/generate/route.ts`

**Step 1: Create generation endpoint**

Create `app/api/funnels/generate/route.ts`:

```typescript
import { createGeminiClient } from "@/lib/gemini";
import { NextResponse } from "next/server";
import type { GenerateCodeRequest, GenerateCodeResponse } from "@/app/apps/funnels/types";

const CODE_GENERATION_PROMPT = `
You are a world-class landing page developer. Generate a complete, self-contained HTML landing page based on the strategy document provided.

REQUIREMENTS:
1. Single HTML file with embedded CSS and JavaScript
2. Use Tailwind CSS via CDN
3. Mobile-first responsive design
4. Professional, modern UI
5. Opt-in form with validation
6. Form submits to /api/funnels/submit via POST
7. Include success/error states
8. NO external dependencies except Tailwind CDN

FORM STRUCTURE:
- Must include: name (required), email (required), phone (optional)
- Form ID must be "optinForm"
- Submit button should disable during submission
- Show loading state during submission
- Show success message after submission
- Handle errors gracefully

STYLE GUIDELINES:
- Clean, professional design
- High contrast for readability
- Clear call-to-action buttons
- Trust indicators (if relevant)
- Benefit-focused copy
- Mobile-optimized

The generated HTML should be production-ready and require zero modifications.

IMPORTANT: The HTML must include this exact JavaScript for form submission:

\`\`\`javascript
const FUNNEL_ID = '__FUNNEL_ID__'; // This will be replaced at runtime
const form = document.getElementById('optinForm');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  const formData = new FormData(form);
  const data = {
    funnelId: FUNNEL_ID,
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || ''
  };

  try {
    const response = await fetch('/api/funnels/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      // Show success
      form.innerHTML = '<div class="text-center p-8 bg-green-50 rounded-lg"><h3 class="text-2xl font-bold text-green-800 mb-2">Success!</h3><p class="text-green-700">Thank you for signing up. We\\'ll be in touch soon!</p></div>';
    } else {
      throw new Error(result.error || 'Submission failed');
    }
  } catch (error) {
    alert('Something went wrong. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Get Started';
  }
});
\`\`\`

Now generate the HTML:
`;

export async function POST(req: Request) {
  try {
    const { strategyDoc, title }: GenerateCodeRequest = await req.json();

    if (!strategyDoc || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = createGeminiClient();

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: CODE_GENERATION_PROMPT,
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a landing page for this offer:\n\nTitle: ${title}\n\nStrategy:\n${strategyDoc}`,
            },
          ],
        },
      ],
    });

    let htmlCode = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract HTML from markdown code blocks if present
    const codeBlockMatch = htmlCode.match(/```html\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      htmlCode = codeBlockMatch[1];
    }

    if (!htmlCode.includes("<!DOCTYPE html")) {
      return NextResponse.json(
        { error: "Failed to generate valid HTML" },
        { status: 500 }
      );
    }

    const response: GenerateCodeResponse = { htmlCode };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Code generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit generation API**

```bash
git add app/api/funnels/generate/route.ts
git commit -m "feat(api): add AI code generation endpoint"
```

---

## Task 7: Create Deployment API

**Files:**
- Create: `app/api/funnels/deploy/route.ts`

**Step 1: Create deployment endpoint**

Create `app/api/funnels/deploy/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createFunnel, isSlugAvailable, generateSlug } from "@/app/apps/funnels/services/funnelService";
import type { DeployFunnelRequest, DeployFunnelResponse } from "@/app/apps/funnels/types";

export async function POST(req: Request) {
  try {
    const { name, slug, htmlCode, strategyDoc }: DeployFunnelRequest = await req.json();

    if (!name || !htmlCode) {
      return NextResponse.json(
        { error: "Missing required fields: name, htmlCode" },
        { status: 400 }
      );
    }

    // Generate or validate slug
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = generateSlug(name);
    } else {
      // Validate slug format
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(finalSlug)) {
        return NextResponse.json(
          { error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only." },
          { status: 400 }
        );
      }

      // Check if slug is available
      const available = await isSlugAvailable(finalSlug);
      if (!available) {
        return NextResponse.json(
          { error: "This slug is already taken. Please choose another." },
          { status: 409 }
        );
      }
    }

    // Create funnel
    const funnel = await createFunnel({
      name,
      domain_slug: finalSlug,
      html_code: htmlCode,
      strategy_doc: strategyDoc,
      status: "published",
    });

    const deployUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/f/${finalSlug}`;

    const response: DeployFunnelResponse = {
      funnelId: funnel.id,
      url: deployUrl,
      slug: finalSlug,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: "Failed to deploy funnel" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit deployment API**

```bash
git add app/api/funnels/deploy/route.ts
git commit -m "feat(api): add funnel deployment endpoint"
```

---

## Task 8: Create Public Funnel Page

**Files:**
- Create: `app/f/[slug]/page.tsx`

**Step 1: Create public funnel route**

Create `app/f/[slug]/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import { getFunnelBySlug } from "@/app/apps/funnels/services/funnelService";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicFunnelPage({ params }: PageProps) {
  const { slug } = await params;

  const funnel = await getFunnelBySlug(slug);

  if (!funnel || !funnel.html_code) {
    notFound();
  }

  // Inject funnel ID into the HTML
  const htmlWithId = funnel.html_code.replace(
    /__FUNNEL_ID__/g,
    funnel.id
  );

  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlWithId }}
      suppressHydrationWarning
    />
  );
}
```

**Step 2: Create not found page**

Create `app/f/[slug]/not-found.tsx`:

```typescript
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-slate-400 mb-8">Funnel not found</p>
        <a
          href="/"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
```

**Step 3: Commit public pages**

```bash
git add app/f/[slug]/page.tsx app/f/[slug]/not-found.tsx
git commit -m "feat(pages): add public funnel hosting route"
```

---

## Task 9: Update Funnel Chat Component

**Files:**
- Modify: `app/apps/funnels/components/FunnelChat.tsx`

**Step 1: Add Generate Code button**

In `app/apps/funnels/components/FunnelChat.tsx`, add after line 65 (after strategyDoc is set):

```typescript
// Add state for showing generate button
const [showGenerateButton, setShowGenerateButton] = useState(false);

// Update the strategyMatch section (around line 57-66):
if (strategyMatch) {
  const strategyText = strategyMatch[1].trim();
  setStrategyDoc(strategyText);
  setStage('STRATEGY');
  setShowGenerateButton(true); // Add this line

  aiContent = aiContent.replace(/\[UPDATE_STRATEGY\][\s\S]*?\[\/UPDATE_STRATEGY\]/, '').trim();
  if (!aiContent) aiContent = "I've drafted the strategy document for you. Check the panel to the right.";
}
```

**Step 2: Add Generate Code handler**

Add this function before the return statement:

```typescript
const handleGenerateCode = async () => {
  setIsLoading(true);
  setShowGenerateButton(false);
  setIsGenerating(true);

  try {
    const response = await fetch('/api/funnels/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategyDoc,
        title: 'Landing Page', // TODO: Extract from strategy
      }),
    });

    if (!response.ok) throw new Error('Failed to generate code');

    const data = await response.json();
    setGeneratedCode(data.htmlCode);
    setStage('CODE');

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Your landing page is ready! Check the Preview tab to see it in action."
    }]);
  } catch (error) {
    console.error('Code generation error:', error);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I had trouble generating the code. Please try again."
    }]);
  } finally {
    setIsLoading(false);
    setIsGenerating(false);
  }
};
```

**Step 3: Add button to UI**

After the input area (around line 164), add:

```typescript
{/* Generate Code Button */}
{showGenerateButton && (
  <div className="p-4 bg-slate-900/50 border-t border-slate-800">
    <button
      onClick={handleGenerateCode}
      disabled={isLoading}
      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <Sparkles className="w-4 h-4" />
      Generate Landing Page Code
    </button>
  </div>
)}
```

**Step 4: Add import at top**

```typescript
const { setStrategyDoc, setStage, setGeneratedCode, setIsGenerating } = useFunnel();
```

**Step 5: Commit chat updates**

```bash
git add app/apps/funnels/components/FunnelChat.tsx
git commit -m "feat(ui): add generate code button to funnel chat"
```

---

## Task 10: Create Deployment Modal

**Files:**
- Create: `app/apps/funnels/components/DeploymentModal.tsx`

**Step 1: Create modal component**

Create `app/apps/funnels/components/DeploymentModal.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { X, Globe, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  strategyDoc: string;
  onDeploy: (url: string, slug: string, funnelId: string) => void;
}

export default function DeploymentModal({
  isOpen,
  onClose,
  htmlCode,
  strategyDoc,
  onDeploy,
}: DeploymentModalProps) {
  const [step, setStep] = useState<'input' | 'deploying' | 'success'>('input');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://builderslab.com';

  const previewUrl = slug ? `${baseUrl}/f/${slug}` : '';

  const handleDeploy = async () => {
    if (!title.trim()) {
      setError('Please enter a funnel name');
      return;
    }

    setError('');
    setStep('deploying');

    try {
      const response = await fetch('/api/funnels/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          slug: slug || undefined,
          htmlCode,
          strategyDoc,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      setDeployedUrl(data.url);
      setStep('success');
      onDeploy(data.url, data.slug, data.funnelId);
    } catch (err: any) {
      setError(err.message);
      setStep('input');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(deployedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSlugChange = (value: string) => {
    // Auto-format slug: lowercase, replace spaces with hyphens, remove special chars
    const formatted = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setSlug(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {step === 'success' ? 'Funnel Deployed!' : 'Deploy to Builder\'s Lab'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Funnel Name *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Puppy Training Course"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Custom URL Slug (optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="e.g., puppy-training-2024"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Leave blank to auto-generate. Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

              {previewUrl && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Your funnel will be available at:</p>
                  <p className="text-sm text-indigo-400 font-mono break-all">{previewUrl}</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'deploying' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-full mb-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-300 font-medium">Deploying your funnel...</p>
              <p className="text-sm text-slate-500 mt-2">This will only take a moment</p>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-slate-300 font-medium mb-2">Your funnel is live!</p>
                <p className="text-sm text-slate-500">Share this URL to start collecting leads</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Funnel URL:</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-indigo-400 font-mono break-all flex-1">{deployedUrl}</p>
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copiedUrl ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800">
          {step === 'input' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={!title.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                Deploy Funnel
              </button>
            </>
          )}
          {step === 'success' && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit modal component**

```bash
git add app/apps/funnels/components/DeploymentModal.tsx
git commit -m "feat(ui): add deployment modal component"
```

---

## Task 11: Update Funnel Preview Component

**Files:**
- Modify: `app/apps/funnels/components/FunnelPreview.tsx`

**Step 1: Add toolbar buttons and modal**

Add imports at the top:

```typescript
import { Download, Globe } from 'lucide-react';
import DeploymentModal from './DeploymentModal';
```

**Step 2: Add state for modal**

After existing useState hooks:

```typescript
const [showDeployModal, setShowDeployModal] = useState(false);
```

**Step 3: Add deploy and download handlers**

Before the return statement:

```typescript
const {
  strategyDoc,
  generatedCode,
  isGenerating,
  setDeployedUrl,
  setDeployedSlug,
  setFunnelId,
} = useFunnel();

const handleDeploy = (url: string, slug: string, funnelId: string) => {
  setDeployedUrl(url);
  setDeployedSlug(slug);
  setFunnelId(funnelId);
  setShowDeployModal(false);
};

const handleDownload = () => {
  const blob = new Blob([generatedCode], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'landing-page.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

**Step 4: Add buttons to toolbar**

After the device toggles section (around line 84), add:

```typescript
{/* Action Buttons */}
{generatedCode && activeTab === 'preview' && (
  <div className="flex items-center gap-2 border-l border-slate-800 pl-4 ml-4">
    <button
      onClick={() => setShowDeployModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
    >
      <Globe className="w-4 h-4" />
      Deploy
    </button>
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
    >
      <Download className="w-4 h-4" />
      Download
    </button>
  </div>
)}
```

**Step 5: Add modal to render**

Before the closing div:

```typescript
{/* Deployment Modal */}
<DeploymentModal
  isOpen={showDeployModal}
  onClose={() => setShowDeployModal(false)}
  htmlCode={generatedCode}
  strategyDoc={strategyDoc}
  onDeploy={handleDeploy}
/>
```

**Step 6: Commit preview updates**

```bash
git add app/apps/funnels/components/FunnelPreview.tsx
git commit -m "feat(ui): add deploy and download buttons to preview"
```

---

## Task 12: Add Environment Variables

**Files:**
- Modify: `.env.local` (or create if doesn't exist)

**Step 1: Add required environment variable**

Add to `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 2: Update for production**

Note: For production deployment, set this to your actual domain:
```bash
NEXT_PUBLIC_APP_URL=https://builderslab.com
```

**Step 3: Don't commit .env.local**

Ensure `.env.local` is in `.gitignore`:

```bash
git status
# Verify .env.local is not tracked
```

---

## Task 13: Test Complete Flow

**Step 1: Start development server**

Run: `npm run dev`

Expected: Server starts on http://localhost:3000

**Step 2: Test strategy generation**

1. Navigate to http://localhost:3000/apps/funnels
2. Chat: "I want to sell a puppy training course for $47"
3. Expected: Strategy document appears in right panel

**Step 3: Test code generation**

1. Click "Generate Landing Page Code" button
2. Expected: Loading state, then code appears in Preview tab

**Step 4: Test preview**

1. Switch to Preview tab
2. Expected: Landing page renders in iframe
3. Switch device view to mobile
4. Expected: Responsive layout

**Step 5: Test deployment**

1. Click "Deploy" button
2. Enter name: "Puppy Training 2024"
3. Enter slug: "puppy-training-test"
4. Click "Deploy Funnel"
5. Expected: Success message with URL

**Step 6: Test public funnel**

1. Copy deployment URL
2. Open in new incognito window
3. Expected: Landing page loads
4. Fill out form with test data
5. Submit form
6. Expected: Success message

**Step 7: Test CRM integration**

1. Navigate to http://localhost:3000/apps/crm
2. Expected: New contact appears with tag "funnel:puppy-training-test"

**Step 8: Test download**

1. Back in funnel preview, click "Download"
2. Expected: HTML file downloads
3. Open file in browser
4. Expected: Landing page loads (form won't work without server)

**Step 9: Commit if all tests pass**

```bash
git add -A
git commit -m "test: verify complete funnel builder flow"
```

---

## Task 14: Add Error Handling & Polish

**Files:**
- Modify: `app/apps/funnels/components/FunnelChat.tsx`
- Modify: `app/api/funnels/submit/route.ts`

**Step 1: Add error handling to chat**

In `FunnelChat.tsx`, update the handleGenerateCode function:

```typescript
const handleGenerateCode = async () => {
  setIsLoading(true);
  setShowGenerateButton(false);
  setIsGenerating(true);

  try {
    const response = await fetch('/api/funnels/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategyDoc,
        title: extractTitleFromStrategy(strategyDoc) || 'Landing Page',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Generation failed');
    }

    const data = await response.json();
    setGeneratedCode(data.htmlCode);
    setStage('CODE');

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: "✨ Your landing page is ready! Check the Preview tab to see it in action. You can deploy it or download the code."
    }]);
  } catch (error: any) {
    console.error('Code generation error:', error);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `❌ I had trouble generating the code: ${error.message}. Please try again or rephrase your strategy.`
    }]);
    setShowGenerateButton(true);
  } finally {
    setIsLoading(false);
    setIsGenerating(false);
  }
};

// Helper to extract title from strategy
const extractTitleFromStrategy = (strategy: string): string | null => {
  const match = strategy.match(/^#\s+(.+)$/m);
  return match ? match[1] : null;
};
```

**Step 2: Add rate limiting to submission API**

In `app/api/funnels/submit/route.ts`, add rate limiting:

```typescript
// At the top of the file
const submissionCache = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_SUBMISSIONS_PER_WINDOW = 5;

// In the POST function, before validation
const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
const cacheKey = `${clientIp}:${funnelId}`;
const now = Date.now();
const lastSubmission = submissionCache.get(cacheKey) || 0;

if (now - lastSubmission < RATE_LIMIT_WINDOW) {
  return NextResponse.json(
    { error: "Too many submissions. Please wait a moment." },
    { status: 429 }
  );
}

submissionCache.set(cacheKey, now);

// Clean up old entries
if (submissionCache.size > 1000) {
  const cutoff = now - RATE_LIMIT_WINDOW;
  for (const [key, timestamp] of submissionCache.entries()) {
    if (timestamp < cutoff) {
      submissionCache.delete(key);
    }
  }
}
```

**Step 3: Commit error handling improvements**

```bash
git add app/apps/funnels/components/FunnelChat.tsx app/api/funnels/submit/route.ts
git commit -m "feat: add error handling and rate limiting"
```

---

## Task 15: Documentation & Cleanup

**Files:**
- Create: `app/apps/funnels/README.md`

**Step 1: Create documentation**

Create `app/apps/funnels/README.md`:

```markdown
# Funnel Builder

A complete funnel creation system that generates landing pages, previews in sandbox, deploys to Builder's Lab hosting, and integrates with CRM for lead capture.

## Features

- **AI Strategy Generation**: Chat with Sales Architect to define your offer
- **Code Generation**: AI generates complete HTML landing pages
- **Live Preview**: See your funnel in desktop/mobile views
- **One-Click Deploy**: Publish to builderslab.com/f/{your-slug}
- **CRM Integration**: Form submissions automatically create contacts
- **Download Option**: Export HTML to host anywhere

## User Flow

1. Chat with AI about your offer
2. Review generated strategy
3. Click "Generate Landing Page Code"
4. Preview in sandbox
5. Deploy to Builder's Lab OR download HTML
6. Share URL to collect leads

## API Endpoints

- `POST /api/funnels/generate` - Generate HTML from strategy
- `POST /api/funnels/submit` - Handle form submissions
- `POST /api/funnels/deploy` - Deploy funnel to hosting
- `GET /f/[slug]` - Serve public funnel page

## Database Tables

- `bl_funnels_projects` - Stores funnels with HTML code
- `bl_funnels_leads` - Tracks form submissions
- `bl_crm_contacts` - Stores leads in user's CRM

## Multi-Tenant Architecture

Each funnel belongs to one user. Form submissions create contacts in the funnel owner's CRM, not the visitor's. RLS policies ensure data isolation.

## Environment Variables

- `NEXT_PUBLIC_APP_URL` - Base URL for deployment URLs

## Testing

See Task 13 in implementation plan for complete testing checklist.
```

**Step 2: Commit documentation**

```bash
git add app/apps/funnels/README.md
git commit -m "docs: add funnel builder documentation"
```

---

## Final Checklist

- [ ] Database schema updated with new fields
- [ ] Type definitions created
- [ ] Funnel service implemented
- [ ] Form submission API working
- [ ] Code generation API working
- [ ] Deployment API working
- [ ] Public funnel route working
- [ ] Chat component has generate button
- [ ] Preview has deploy/download buttons
- [ ] Deployment modal works
- [ ] Complete flow tested end-to-end
- [ ] Error handling added
- [ ] Documentation created
- [ ] All code committed to git

---

## Success Criteria

✅ User can describe offer in chat
✅ AI generates strategy document
✅ User can generate code with one click
✅ Code previews in sandbox
✅ User can deploy to unique URL
✅ Public funnel loads and accepts submissions
✅ Submissions create CRM contacts with correct user_id
✅ User can download HTML file
✅ No cross-tenant data leaks
✅ Error states handled gracefully

---

**Plan complete and saved to `docs/plans/2026-01-12-funnel-builder-implementation.md`.**
