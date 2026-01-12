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
const FUNNEL_ID = '__FUNNEL_ID__';
const form = document.getElementById('optinForm');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

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
    const response = await fetch(window.location.origin + '/api/funnels/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
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
