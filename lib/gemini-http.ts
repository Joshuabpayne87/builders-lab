type GeminiGeneratePayload = {
  model: string;
  contents: any;
  config?: any;
};

type GeminiGenerateResponse = {
  text?: string;
  candidates?: any[];
  usageMetadata?: any;
  modelVersion?: string;
};

export async function geminiGenerateContent(payload: GeminiGeneratePayload): Promise<GeminiGenerateResponse> {
  const baseUrl = typeof window === "undefined"
    ? ((process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")).replace(/\/$/, ""))
    : "";
  const response = await fetch(`${baseUrl}/api/gemini/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Gemini request failed.");
  }

  return response.json();
}

export async function geminiGenerateContentStream(payload: GeminiGeneratePayload) {
  const baseUrl = typeof window === "undefined"
    ? ((process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")).replace(/\/$/, ""))
    : "";
  const response = await fetch(`${baseUrl}/api/gemini/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Gemini stream failed.");
  }

  return response.body;
}

export async function geminiGenerateVideosStart(payload: any) {
  const baseUrl = typeof window === "undefined"
    ? ((process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")).replace(/\/$/, ""))
    : "";
  const response = await fetch(`${baseUrl}/api/gemini/videos/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Video generation failed.");
  }

  return response.json();
}

export async function geminiGenerateVideosStatus(payload: any) {
  const baseUrl = typeof window === "undefined"
    ? ((process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")).replace(/\/$/, ""))
    : "";
  const response = await fetch(`${baseUrl}/api/gemini/videos/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Video status failed.");
  }

  return response.json();
}

export async function geminiFetchVideo(payload: { uri: string }) {
  const baseUrl = typeof window === "undefined"
    ? ((process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")).replace(/\/$/, ""))
    : "";
  const response = await fetch(`${baseUrl}/api/gemini/videos/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Video fetch failed.");
  }

  return response.blob();
}
