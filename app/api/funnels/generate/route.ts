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

TECHNICAL REQUIREMENTS:
1. Single HTML file with embedded CSS and JavaScript
2. Use Tailwind CSS via CDN (latest version)
3. Mobile-first responsive design
4. Smooth animations and transitions
5. Professional color schemes with gradients
6. Modern typography (Inter, Plus Jakarta Sans, or similar via Google Fonts)
7. Opt-in form with validation and beautiful states
8. Form submits to /api/funnels/submit via POST
9. NO external dependencies except Tailwind CDN and Google Fonts

VISUAL DESIGN GUIDELINES:

**Color & Gradients:**
- Use sophisticated color palettes (not basic primary colors)
- Implement gradient backgrounds (linear, radial, mesh)
- Example: bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
- Dark mode friendly contrast ratios

**Typography:**
- Large, bold headlines (text-5xl to text-7xl)
- Proper font weights (font-semibold, font-bold, font-extrabold)
- Line height and letter spacing for readability
- Gradient text effects where appropriate

**Spacing & Layout:**
- Generous whitespace (py-16, py-24, py-32)
- Max-width containers (max-w-7xl, max-w-6xl)
- Grid layouts for features (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Proper section separation

**Components & Effects:**
- Glassmorphism cards: backdrop-blur-lg bg-white/80 border border-white/20
- Subtle shadows: shadow-xl shadow-2xl
- Rounded corners: rounded-2xl rounded-3xl
- Hover effects: hover:scale-105 transition-transform duration-300
- Animated gradients for CTAs
- Icon placeholders using emoji or Unicode symbols

**Hero Section:**
- Full-width gradient background
- Large headline with gradient text effect
- Compelling subheadline
- Primary CTA button with gradient and hover animation
- Hero image/illustration placeholder or abstract gradient shapes

**Features Section:**
- Card-based layout with hover effects
- Icons (use emoji or Unicode)
- Benefit-focused copy
- Subtle animations on scroll (use CSS animations)

**Social Proof:**
- Testimonial cards with avatars (use gradient circles as placeholders)
- Stats/metrics with large numbers
- Trust badges or logos (use placeholder gradients)

**Form Design:**
- Beautiful input fields with focus states
- Floating labels or clear labels
- Gradient submit button with hover/active states
- Loading spinner during submission
- Success state with celebration effect

FORM STRUCTURE:
- Must include: name (required), email (required), phone (optional)
- Form ID must be "optinForm"
- Submit button should disable during submission with loading state
- Show animated success message after submission
- Handle errors gracefully with inline error messages

ANIMATION EXAMPLES:
\`\`\`css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
\`\`\`

EXAMPLE BUTTON STYLES:
\`\`\`html
<button class="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
  <span class="relative z-10">Get Started</span>
  <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
</button>
\`\`\`

EXAMPLE CARD STYLES:
\`\`\`html
<div class="group p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200/50 transform hover:-translate-y-2 transition-all duration-300">
  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4">
    ✨
  </div>
  <h3 class="text-xl font-bold text-gray-900 mb-2">Feature Title</h3>
  <p class="text-gray-600">Feature description with clear benefits.</p>
</div>
\`\`\`

CRITICAL: Include this exact JavaScript for form submission (with enhanced UX):

\`\`\`javascript
const FUNNEL_ID = '__FUNNEL_ID__';
const form = document.getElementById('optinForm');
const submitBtn = form.querySelector('button[type="submit"]');
const originalBtnText = submitBtn.innerHTML;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

  const formData = new FormData(form);
  const data = {
    funnelId: FUNNEL_ID,
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || ''
  };

  try {
    const response = await fetch(window.location.origin + '/api/funnels/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      form.innerHTML = '<div class="text-center p-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 animate-fadeInUp"><div class="text-6xl mb-4">🎉</div><h3 class="text-3xl font-bold text-green-900 mb-3">Success!</h3><p class="text-lg text-green-700">Thank you for signing up. We\\'ll be in touch soon!</p></div>';
    } else {
      throw new Error(result.error || 'Submission failed');
    }
  } catch (error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm';
    errorDiv.textContent = 'Something went wrong. Please try again.';
    form.appendChild(errorDiv);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    setTimeout(() => errorDiv.remove(), 5000);
  }
});
\`\`\`

OUTPUT REQUIREMENTS:
- Return ONLY the complete HTML code
- No markdown code blocks, no explanations
- Production-ready, zero modifications needed
- Must look premium and professional
- Must be fully responsive
- Must include smooth animations and transitions

Now generate the stunning landing page based on the strategy provided:
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
