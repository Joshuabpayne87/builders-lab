import type { FunnelTemplate } from '../types';

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  {
    id: 'saas-free-trial',
    name: 'SaaS Free Trial',
    category: 'saas',
    description: 'Sign up for a free trial of your SaaS product',
    quickStartQuestions: [
      {
        variable: 'PRODUCT_NAME',
        question: 'What is your product name?',
        placeholder: 'e.g., TaskFlow, NotionAI, BuildersCRM'
      },
      {
        variable: 'KEY_BENEFIT',
        question: 'What is the main benefit?',
        placeholder: 'e.g., Save 10 hours per week on admin work'
      },
      {
        variable: 'TARGET_AUDIENCE',
        question: 'Who is this for?',
        placeholder: 'e.g., Freelance web developers, Small business owners'
      }
    ],
    strategyDoc: `# 🎯 Funnel Strategy: {{PRODUCT_NAME}} - Free Trial

## Target Avatar
**Who:** {{TARGET_AUDIENCE}}
**Pain Points:**
- Spending too much time on manual, repetitive tasks
- Lacking visibility into their business operations
- Struggling to scale without hiring more people
**Desires:** Automate workflows and focus on high-value work

## Offer Positioning
**Core Promise:** {{KEY_BENEFIT}}
**Unique Mechanism:** Industry-leading automation with zero setup required
**Price Point:** Free 14-day trial, then $49-99/month

## Landing Page Copy

### Headline
Stop Wasting Time on Manual Work. Start Your {{PRODUCT_NAME}} Free Trial Today.

### Subheadline
{{PRODUCT_NAME}} automates your busywork so you can focus on what matters. {{KEY_BENEFIT}}.

### Hero Section
**Visual Description:** Modern dashboard interface showing automated workflows in action
**Primary CTA:** Start Free 14-Day Trial

### Problem Section
- Tired of toggling between 5+ different tools?
- Manually copying data between systems?
- Losing productivity to repetitive administrative tasks?

### Solution Section
{{PRODUCT_NAME}} connects your entire workflow into one intelligent system. Your data flows automatically between apps, tasks are prioritized intelligently, and your team stays perfectly synced. No manual data entry. No context switching. Just pure productivity.

### Benefits/Features
- **Automated Data Sync** - Information flows automatically between all your apps
- **Intelligent Prioritization** - AI learns your workflow and suggests optimizations
- **Team Collaboration** - Real-time updates keep everyone in sync
- **Custom Workflows** - Build automations without coding
- **Smart Reporting** - Instant insights into your business performance
- **Mobile Access** - Full functionality on the go
- **99.9% Uptime** - Enterprise-grade reliability

### Social Proof
- Trusted by 5,000+ teams worldwide
- 4.9/5 stars on leading review platforms
- Average 3x productivity increase within first month

### Final CTA Section
**Headline:** Ready to Reclaim 10 Hours a Week?
**CTA Button:** Start Free Trial Now
**Subtext:** No credit card required. Full access to all features for 14 days. Cancel anytime.

## Form Fields
- Name (required)
- Email (required)
- Phone (optional)

## Design Direction
**Color Scheme:** Modern blue (#3B82F6) with white backgrounds
**Vibe:** Clean, professional, trustworthy (like Stripe or Linear)
**Key Elements:** Dashboard screenshot, benefit icons, customer logos`
  },

  {
    id: 'course-webinar',
    name: 'Course/Webinar Registration',
    category: 'course',
    description: 'Capture registrations for an online course or webinar',
    quickStartQuestions: [
      {
        variable: 'COURSE_TITLE',
        question: 'What is your course/webinar title?',
        placeholder: 'e.g., Advanced SEO Masterclass, AI Marketing Blueprint'
      },
      {
        variable: 'LEARNING_OUTCOME',
        question: 'What will students learn?',
        placeholder: 'e.g., Generate $10K/month from SEO, Launch AI products in 30 days'
      },
      {
        variable: 'INSTRUCTOR_NAME',
        question: 'Your name or brand name?',
        placeholder: 'e.g., John Smith, Digital Academy'
      }
    ],
    strategyDoc: `# 🎯 Funnel Strategy: {{COURSE_TITLE}}

## Target Avatar
**Who:** Professionals and entrepreneurs seeking to level up their skills
**Pain Points:**
- Spending money on courses that don't deliver real results
- Feeling overwhelmed and unsure where to start
- Lacking a structured, proven framework to follow
**Desires:** Learn from someone who's actually done it, in a way that gets results

## Offer Positioning
**Core Promise:** {{LEARNING_OUTCOME}}
**Unique Mechanism:** Proven step-by-step system taught by {{INSTRUCTOR_NAME}}
**Price Point:** Free registration + optional paid upsell after

## Landing Page Copy

### Headline
{{LEARNING_OUTCOME}} (Join {{COURSE_TITLE}})

### Subheadline
A proven step-by-step system that works. Thousands of students have transformed their careers with {{COURSE_TITLE}}.

### Hero Section
**Visual Description:** Instructor headshot, course module preview, or transformation results
**Primary CTA:** Register Free Now

### Problem Section
- You've tried other courses but didn't see real results
- The information exists everywhere but it's scattered and overwhelming
- You're ready to learn from someone who's actually built a successful business

### Solution Section
{{COURSE_TITLE}} cuts through the noise and delivers a proven framework that works. {{INSTRUCTOR_NAME}} distills years of experience into a step-by-step system you can implement immediately. You'll get clarity on exactly what works and what to do first.

### Benefits/Features
- **Step-by-Step Video Training** - Follow along at your own pace
- **Done-For-You Templates** - Copy systems that actually work
- **Lifetime Access** - Study whenever it fits your schedule
- **Bonus Resources** - Swipe files, checklists, and frameworks
- **Community Support** - Learn from other ambitious people
- **Weekly Live Q&A** - Ask {{INSTRUCTOR_NAME}} directly

### Social Proof
- 10,000+ students worldwide
- Average 5-year income increase of $50K+
- 94% satisfaction rate

### Final CTA Section
**Headline:** Lock In Your Spot (Limited Availability)
**CTA Button:** Register Free Today
**Subtext:** First batch closes in 48 hours. Spots are limited.

## Form Fields
- Name (required)
- Email (required)
- Phone (optional)

## Design Direction
**Color Scheme:** Energetic orange/gold (#F97316) with dark backgrounds
**Vibe:** Exclusive, high-value, ambitious
**Key Elements:** Instructor photo, student success stories, countdown timer`
  },

  {
    id: 'service-booking',
    name: 'Service Consultation Booking',
    category: 'service',
    description: 'Book consultations for your professional services',
    quickStartQuestions: [
      {
        variable: 'SERVICE_NAME',
        question: 'What service do you offer?',
        placeholder: 'e.g., Business Strategy Consulting, Executive Coaching, Brand Design'
      },
      {
        variable: 'IDEAL_CLIENT',
        question: 'Who is your ideal client?',
        placeholder: 'e.g., Growth-stage startups, C-suite executives, e-commerce brands'
      },
      {
        variable: 'TRANSFORMATION',
        question: 'What transformation do you provide?',
        placeholder: 'e.g., Scale from $1M to $10M ARR, Land your dream role'
      }
    ],
    strategyDoc: `# 🎯 Funnel Strategy: {{SERVICE_NAME}}

## Target Avatar
**Who:** {{IDEAL_CLIENT}}
**Pain Points:**
- Trying to figure it out alone and getting stuck
- Making expensive mistakes that cost time and money
- Needing expert guidance to move forward confidently
**Desires:** Work with a trusted expert who understands their specific situation

## Offer Positioning
**Core Promise:** {{TRANSFORMATION}}
**Unique Mechanism:** Personalized strategy session with proven framework
**Price Point:** Free initial consultation (paid services after)

## Landing Page Copy

### Headline
Get Your Personalized {{SERVICE_NAME}} Strategy

### Subheadline
Book a free consultation with {{INSTRUCTOR_NAME}}. We'll assess your situation and create a custom action plan.

### Hero Section
**Visual Description:** Professional headshot, office environment, or success metrics
**Primary CTA:** Book Free Consultation

### Problem Section
- You're not sure if investing in {{SERVICE_NAME}} is right for you
- You've had bad experiences with consultants before
- You need to know if there's actually a path forward

### Solution Section
A free strategy session removes the guesswork. {{INSTRUCTOR_NAME}} will diagnose exactly where you stand, what's holding you back, and exactly what needs to happen next. No pressure. Just clear direction.

### Benefits/Features
- **Custom Strategy Session** - Tailored to your specific situation
- **Honest Assessment** - We'll tell you what you need to hear
- **Actionable Roadmap** - Clear next steps you can implement
- **No Obligation** - This is a free consultation
- **20-Year Track Record** - Proven results with hundreds of clients
- **Flexible Packages** - Options for every budget

### Social Proof
- 200+ successful client transformations
- Average ROI of 5x within first year
- Featured in [Industry Publication]

### Final CTA Section
**Headline:** Get Clarity on Your Path Forward
**CTA Button:** Book Your Free Consultation
**Subtext:** Limited to 5 consultations per week. Book now to secure your spot.

## Form Fields
- Name (required)
- Email (required)
- Phone (required)

## Design Direction
**Color Scheme:** Professional blue (#1E40AF) with premium accents
**Vibe:** Trustworthy, authoritative, results-driven
**Key Elements:** Testimonial videos, client logos, case study snippets`
  },

  {
    id: 'agency-leads',
    name: 'Agency Lead Capture',
    category: 'agency',
    description: 'Generate qualified B2B leads for your agency',
    quickStartQuestions: [
      {
        variable: 'SERVICE_OFFERING',
        question: 'What service does your agency provide?',
        placeholder: 'e.g., Web Design, SEO Services, Social Media Marketing'
      },
      {
        variable: 'IDEAL_PROSPECT',
        question: 'Who are your ideal clients?',
        placeholder: 'e.g., E-commerce brands, Local service businesses, SaaS startups'
      },
      {
        variable: 'UNIQUE_OFFER',
        question: 'What makes you different?',
        placeholder: 'e.g., Guaranteed 3x ROI, 30-day onboarding guarantee'
      }
    ],
    strategyDoc: `# 🎯 Funnel Strategy: {{SERVICE_OFFERING}} Agency

## Target Avatar
**Who:** {{IDEAL_PROSPECT}}
**Pain Points:**
- Not generating enough leads consistently
- Struggling with marketing ROI and attribution
- Don't have the in-house expertise to do it themselves
**Desires:** Partner with a proven agency that can scale their business predictably

## Offer Positioning
**Core Promise:** {{UNIQUE_OFFER}}
**Unique Mechanism:** Proven agency framework with dedicated account management
**Price Point:** $2K-$10K/month managed services

## Landing Page Copy

### Headline
Get More {{IDEAL_PROSPECT}} Without Burning Cash on Ads

### Subheadline
Our proven {{SERVICE_OFFERING}} system has generated $50M+ in revenue for our clients. See how we can do the same for you.

### Hero Section
**Visual Description:** Success metrics dashboard, team photo, or case study results
**Primary CTA:** Get Free Strategy Audit

### Problem Section
- Your current marketing is inconsistent and unpredictable
- You don't know which channels actually work
- In-house hires are expensive and take months to ramp up

### Solution Section
We've systematized {{SERVICE_OFFERING}} to turn it into a predictable revenue engine. Our 7-step framework removes the guesswork. In just 90 days, you'll see measurable results. Most importantly, you'll know exactly what's working.

### Benefits/Features
- **Proven 7-Step Framework** - Tested with 100+ companies
- **Dedicated Account Manager** - Your personal growth partner
- **Monthly Reporting** - Full transparency on ROI and metrics
- **Quarterly Strategy Sessions** - Continuous optimization
- **Exclusive Tools Access** - Premium software at no extra cost
- **Guaranteed Results** - {{UNIQUE_OFFER}}

### Social Proof
- 50+ successful case studies
- Average 250% ROI in first year
- Trusted by companies like [Brand 1], [Brand 2], [Brand 3]

### Final CTA Section
**Headline:** Ready to Predictably Scale?
**CTA Button:** Get Your Free Strategy Audit
**Subtext:** Takes 15 minutes. No obligation. See exactly what we'd do for your business.

## Form Fields
- Name (required)
- Email (required)
- Company Name (required)
- Phone (optional)

## Design Direction
**Color Scheme:** Corporate blue (#0F172A) with green accents
**Vibe:** Professional, data-driven, results-focused
**Key Elements:** Client testimonials, metrics dashboard, success metrics`
  },

  {
    id: 'product-launch',
    name: 'Product Launch',
    category: 'ecommerce',
    description: 'Build buzz and early access for your upcoming product',
    quickStartQuestions: [
      {
        variable: 'PRODUCT_NAME',
        question: 'What product are you launching?',
        placeholder: 'e.g., AI Writing Assistant, Premium Coffee Brand'
      },
      {
        variable: 'PROBLEM_SOLVED',
        question: 'What problem does it solve?',
        placeholder: 'e.g., Generate high-quality content in seconds, Ethically sourced premium coffee'
      },
      {
        variable: 'LAUNCH_DATE',
        question: 'When does it launch?',
        placeholder: 'e.g., March 15, 2024'
      }
    ],
    strategyDoc: `# 🎯 Funnel Strategy: {{PRODUCT_NAME}} Launch

## Target Avatar
**Who:** Early adopters seeking innovative solutions
**Pain Points:**
- Waiting for products that actually solve their problems
- Tired of subpar solutions from existing players
- Want exclusive early access before it goes mainstream
**Desires:** Be among the first to access something game-changing

## Offer Positioning
**Core Promise:** {{PROBLEM_SOLVED}}
**Unique Mechanism:** Founding member exclusive access + special pricing
**Price Point:** Early bird special, then 2x increase at launch

## Landing Page Copy

### Headline
The {{PRODUCT_NAME}} Is Finally Here

### Subheadline
Join 1,000+ founders and professionals getting exclusive early access. Regular price: $99/month. Founding member price: $29/month. Locked in forever.

### Hero Section
**Visual Description:** Product demo video or stunning product photography
**Primary CTA:** Claim Your Founding Member Spot

### Problem Section
- Current solutions are outdated and inefficient
- You're forced to juggle multiple tools that don't work together
- You need something purpose-built for modern workflows

### Solution Section
We spent 2 years researching and 6 months building {{PRODUCT_NAME}}. It's specifically designed to solve the biggest pain points in this space. Early feedback from beta users is overwhelming. Now we're opening up 1,000 founding member spots at a special introductory price.

### Benefits/Features
- **Lifetime Founding Member Pricing** - Lock in $29/month forever
- **Early Access** - Use it now before official launch {{LAUNCH_DATE}}
- **Exclusive Community** - Connect with other early adopters
- **Direct Input** - Help shape the product roadmap
- **White Glove Onboarding** - Personal setup call included
- **Full Feature Access** - Everything included, no hidden tiers

### Social Proof
- 1,000+ people on waitlist
- Featured in [Tech Publication]
- Founded by [Credible Founder]

### Final CTA Section
**Headline:** Join the Founding Member Circle
**CTA Button:** Claim Your Spot Now
**Subtext:** Only 1,000 spots available at this price. This offer closes {{LAUNCH_DATE}}.

## Form Fields
- Name (required)
- Email (required)
- Phone (optional)

## Design Direction
**Color Scheme:** Bold, modern (Indigo #4F46E5 with gradient accents)
**Vibe:** Exclusive, innovative, premium
**Key Elements:** Product demo video, founder bio, countdown timer to launch date`
  }
];

export function getTemplateById(id: string): FunnelTemplate | undefined {
  return FUNNEL_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: FunnelTemplate['category']): FunnelTemplate[] {
  return FUNNEL_TEMPLATES.filter(t => t.category === category);
}
