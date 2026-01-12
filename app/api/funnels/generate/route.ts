import { createGeminiClient } from "@/lib/gemini";
import { NextResponse } from "next/server";
import type { GenerateCodeRequest, GenerateCodeResponse } from "@/app/apps/funnels/types";

const CODE_GENERATION_PROMPT = `
You are an elite landing page developer specializing in premium, conversion-focused designs. Generate a stunning, production-ready HTML landing page that looks like it was built by v0.dev or a top design agency.

DESIGN PHILOSOPHY:
- **Premium aesthetics** - Think Stripe, Linear, Vercel, Framer
- **Modern & sophisticated** - Gradients, subtle animations, glassmorphism
- **Conversion-optimized** - Clear hierarchy, compelling CTAs, trust signals
- **Delightful interactions** - Smooth hover effects, micro-animations, transitions
- **MOBILE-FIRST & FULLY RESPONSIVE** - Must look perfect on phones, tablets, and desktops

TECHNICAL REQUIREMENTS:
1. Single HTML file with embedded CSS and JavaScript
2. Use Tailwind CSS via CDN (latest version)
3. **CRITICAL: Mobile-first responsive design** - Design for mobile FIRST, then scale up
4. Smooth animations and transitions
5. Professional color schemes with gradients
6. Modern typography (Inter, Plus Jakarta Sans, or similar via Google Fonts)
7. Opt-in form with validation and beautiful states
8. Form submits to /api/funnels/submit via POST
9. NO external dependencies except Tailwind CDN and Google Fonts

MOBILE-FIRST RESPONSIVE DESIGN RULES:
- **Base styles are for mobile** (320px-640px)
- Use Tailwind responsive prefixes: sm: (640px+), md: (768px+), lg: (1024px+), xl: (1280px+)
- Text sizes: text-3xl on mobile → text-5xl md:text-6xl lg:text-7xl on desktop
- Padding: p-4 on mobile → p-8 md:p-12 lg:p-16 on desktop
- Grid layouts: grid-cols-1 on mobile → md:grid-cols-2 lg:grid-cols-3 on desktop
- Images and videos must be responsive with proper aspect ratios
- Touch-friendly buttons: min-h-[44px] for mobile tap targets
- Readable font sizes on mobile: minimum 16px (text-base) for body text
- Stack elements vertically on mobile, horizontal on desktop
- Test all interactions work on touch devices

VISUAL DESIGN GUIDELINES:

**Color & Gradients:**
- Use sophisticated color palettes (not basic primary colors)
- Implement gradient backgrounds (linear, radial, mesh)
- Example: bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
- Dark mode friendly contrast ratios

**Typography:**
- Large, bold headlines (text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl)
- Proper font weights (font-semibold, font-bold, font-extrabold)
- Line height and letter spacing for readability
- Gradient text effects where appropriate
- Mobile: text-3xl, Desktop: text-6xl or larger

**Spacing & Layout:**
- Mobile: py-8 px-4, Desktop: py-16 md:py-24 lg:py-32 px-4 md:px-8
- Max-width containers (max-w-7xl, max-w-6xl)
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Proper section separation with responsive spacing

**Components & Effects:**
- Glassmorphism cards: backdrop-blur-lg bg-white/80 border border-white/20
- Subtle shadows: shadow-xl shadow-2xl
- Rounded corners: rounded-2xl rounded-3xl
- Hover effects: hover:scale-105 transition-transform duration-300
- Animated gradients for CTAs
- Icon placeholders using emoji or Unicode symbols

**Hero Section:**
- Full-width gradient background
- Large headline with gradient text effect (responsive sizing)
- Compelling subheadline
- Primary CTA button with gradient and hover animation
- Hero image/illustration placeholder or abstract gradient shapes
- Stack vertically on mobile, side-by-side on desktop

**Features Section:**
- Card-based layout with hover effects
- Icons (use emoji or Unicode)
- Benefit-focused copy
- Subtle animations on scroll (use CSS animations)
- Single column on mobile, 2-3 columns on desktop

**Social Proof:**
- Testimonial cards with avatars (use gradient circles as placeholders)
- Stats/metrics with large numbers
- Trust badges or logos (use placeholder gradients)
- Stack on mobile, grid on desktop

**Form Design:**
- Beautiful input fields with focus states
- Floating labels or clear labels
- Gradient submit button with hover/active states
- Loading spinner during submission
- Success state with celebration effect
- Full width on mobile, constrained width on desktop
- Touch-friendly input heights (min-h-[44px])

FORM STRUCTURE:
- Must include: name (required), email (required), phone (optional)
- Form ID must be "optinForm"
- Submit button should disable during submission with loading state
- Show animated success message after submission
- Handle errors gracefully with inline error messages

ANIMATION EXAMPLES:
CSS animations to use:
- fadeInUp: opacity 0 to 1, translateY 30px to 0
- gradient: background-position animation for gradient effects
- Use animation classes like animate-fadeInUp and animate-gradient
- Smooth transitions with duration-300 or duration-500

EXAMPLE RESPONSIVE BUTTON:
Use classes: w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-h-[44px]

EXAMPLE RESPONSIVE CARD:
Use classes: p-6 sm:p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200/50 transform hover:-translate-y-2 transition-all duration-300

EXAMPLE RESPONSIVE HERO:
Use classes: min-h-screen flex items-center px-4 py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
Headline: text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold
Subheadline: text-lg sm:text-xl md:text-2xl text-gray-600
Layout: flex-col lg:flex-row for stacking on mobile, side-by-side on desktop

// Form submission handler with enhanced UX:
// - Retrieves FUNNEL_ID from __FUNNEL_ID__ placeholder
// - Targets form element with ID 'optinForm'
// - On form submit: prevents default behavior, disables submit button, displays animated loading spinner
// - Collects form data (name, email, phone) using FormData API
// - Sends POST request to /api/funnels/submit endpoint with funnelId and form data as JSON
// - On successful response: replaces entire form with animated success message featuring celebration emoji
// - On error: displays error message below form, re-enables submit button, auto-removes error after 5 seconds
// - Implements proper error handling with try-catch and user-friendly error messaging

OUTPUT REQUIREMENTS:
- Return ONLY the complete HTML code
- No markdown code blocks, no explanations
- Production-ready, zero modifications needed
- Must look premium and professional on ALL devices
- **MUST be fully responsive and mobile-optimized**
- Must include smooth animations and transitions
- Test on mobile viewport (375px) and desktop (1920px)

Now generate the stunning, mobile-first landing page based on the strategy provided:
`;

export async function POST(req: Request) {
  try {
    const body: GenerateCodeRequest = await req.json();
    const { strategyDoc, title } = body;

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
              text: `Strategy Document:\n\n${strategyDoc}\n\nPage Title: ${title}\n\nGenerate the complete HTML landing page now.`,
            },
          ],
        },
      ],
    });

    let htmlCode = result.text || "";

    htmlCode = htmlCode.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

    const response: GenerateCodeResponse = {
      htmlCode,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Code generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate code", success: false },
      { status: 500 }
    );
  }
}
