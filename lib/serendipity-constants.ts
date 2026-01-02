import { AlertTriangle, TrendingUp, BookOpen, Target, Compass, Database, Mail, Video, Filter, RefreshCw } from 'lucide-react';

export interface ContentFramework {
  id: string;
  label: string;
  description: string;
  icon: any;
  promptContext: string;
}

export interface Hook {
  id: string;
  text: string;
}

export const CONTENT_FRAMEWORKS: ContentFramework[] = [
  {
    id: 'context-engine',
    label: "1. The Context Engine",
    description: "Build a knowledge base that answers for you.",
    icon: Database,
    promptContext: "STRUCTURE: 1. Problem: 'Stop answering the same questions.' 2. Solution: 'Build a Context Engine.' 3. Steps: Centralize docs -> Feed to AI -> Query. 4. Result: Instant answers."
  },
  {
    id: 'outreach-clarifier',
    label: "2. The Outreach Clarifier",
    description: "Research prospects before sending emails.",
    icon: Mail,
    promptContext: "STRUCTURE: 1. Problem: 'Cold outreach is dead.' 2. Solution: 'The Outreach Clarifier.' 3. Steps: Scrape URL -> Analyze Pain Points -> Draft Personal Email. 4. Result: Higher reply rate."
  },
  {
    id: 'meeting-transformer',
    label: "3. The Meeting Transformer",
    description: "Turn talk into action items.",
    icon: Video,
    promptContext: "STRUCTURE: 1. Problem: 'Lost in meeting notes.' 2. Solution: 'The Meeting Transformer.' 3. Steps: Record -> Transcribe -> Extract Action Items. 4. Result: 60 mins -> 3 mins summary."
  },
  {
    id: 'content-repurposer',
    label: "4. The Content Repurposer",
    description: "One idea, ten formats.",
    icon: RefreshCw,
    promptContext: "STRUCTURE: 1. Problem: 'Content treadmill burnout.' 2. Solution: 'The Repurposer.' 3. Steps: Long Video -> Blog -> LinkedIn -> Tweet -> Newsletter. 4. Result: Infinite content."
  },
  {
    id: 'lead-scorer',
    label: "5. The Lead Scorer",
    description: "Focus on buyers, not browsers.",
    icon: Filter,
    promptContext: "STRUCTURE: 1. Problem: 'Wasting time on bad leads.' 2. Solution: 'The AI Lead Scorer.' 3. Steps: Intake Form -> AI Analysis against Criteria -> Score 1-100. 4. Result: Sales efficiency."
  },
  {
    id: 'myth-buster',
    label: "The Myth Buster",
    description: "Challenge a common belief in your industry.",
    icon: AlertTriangle,
    promptContext: "STRUCTURE: 1. State a commonly held belief. 2. Explain why it is wrong/outdated. 3. Present the better alternative (your truth). 4. Give evidence/examples. TONE: Authoritative, slightly polarizing."
  },
  {
    id: 'case-study',
    label: "The Case Study",
    description: "Break down a specific win or result (Before & After).",
    icon: TrendingUp,
    promptContext: "STRUCTURE: 1. The Problem (Before state). 2. The Agitation (Why it was hard). 3. The Solution (What changed). 4. The Result (Metrics/Outcome). 5. The Takeaway for the reader. TONE: Analytical, inspiring."
  },
  {
    id: 'how-to',
    label: "The Step-by-Step",
    description: "Pure educational value. A clear guide.",
    icon: BookOpen,
    promptContext: "STRUCTURE: 1. Promise the outcome in the hook. 2. List the requirements. 3. Provide numbered steps (Step 1, Step 2...). 4. Mention common pitfalls to avoid. TONE: Helpful, clear, teacher-like."
  },
  {
    id: 'mistake-fix',
    label: "The Mistake & Fix",
    description: "Identify a pain point and solve it immediately.",
    icon: Target,
    promptContext: "STRUCTURE: 1. 'Stop doing [X]'. 2. Explain why it hurts growth/results. 3. Introduce 'The Fix' (simple tweak). 4. Explain the benefit of the fix. TONE: Urgent, direct."
  },
  {
    id: 'future-cast',
    label: "The Future Cast",
    description: "Predict where the industry is going next.",
    icon: Compass,
    promptContext: "STRUCTURE: 1. Identify a current trend. 2. Project it forward 12 months. 3. Describe the impact on the reader. 4. Give 3 steps to prepare. TONE: Visionary, confident."
  }
];

export const INITIAL_HOOKS: Hook[] = [
  { id: 'h1', text: "This AI workflow saves me 10 hours a week — here's how." },
  { id: 'h2', text: "Everyone is collecting tools. Here's how to actually use them." },
  { id: 'h3', text: "If I had to start over with AI from day one… I'd do this." },
  { id: 'h4', text: "AI isn't magic — it's structure. Let me show you." },
  { id: 'h5', text: "Here's one workflow every business owner should build today." },
  { id: 'h6', text: "Stop scrolling. This AI system will change your content game." },
  { id: 'h7', text: "One prompt that saves me hours every week." },
  { id: 'h8', text: "If you're overwhelmed by AI, try this simple system." },
  { id: 'h9', text: "This workflow handles my entire morning routine." },
  { id: 'h10', text: "The easiest AI automation I've ever built." },
  { id: 'h11', text: "If you run a business, you NEED this workflow." },
  { id: 'h12', text: "AI won't replace you — but people using AI will." },
  { id: 'h13', text: "Save this. You'll thank me later." },
  { id: 'h14', text: "The workflow I wish I built sooner…" },
  { id: 'h15', text: "This is how creators automate 80% of their content." },
  { id: 'h16', text: "Small businesses: this one's for you." },
  { id: 'h17', text: "3 AI tools I use daily (and how)." },
  { id: 'h18', text: "Most workflows break because they miss this one step…" },
  { id: 'h19', text: "Here's the system behind my content engine." },
  { id: 'h20', text: "This isn't a hack — it's a repeatable process." },
  { id: 'h21', text: "I built an AI assistant that does my research for me." },
  { id: 'h22', text: "This is the simplest AI automation I recommend." },
  { id: 'h23', text: "The #1 workflow that made my business easier." },
  { id: 'h24', text: "This took me from chaos → clarity." },
  { id: 'h25', text: "If you only build one AI workflow this month, make it this one." },
];

export const PINNED_SCRIPT = `[Hook]
"Most businesses are drowning in tools but starving for systems.
Here are the 5 AI Workflows Every Business Should Build immediately."

[Value]
"1. The Context Engine: Stop answering the same questions. Build a knowledge base that answers for you.
2. The Outreach Clarifier: Don't just send emails. Use AI to research the prospect so your message actually lands.
3. The Meeting Transformer: Turn 60 minutes of talk into 3 minutes of action items.
4. The Content Repurposer: One idea, ten formats. Stop creating from scratch every day.
5. The Lead Scorer: Focus your energy only on the people who are actually ready to buy."

[Positioning]
"These aren't just 'hacks'. This is the operating system for a modern, high-leverage business.
I've packaged all 5 of these workflows into a single blueprint."

[Call To Action]
"If you want the blueprint, comment 'SYSTEMS' below and I'll send it over.
Let's get to work."`;
