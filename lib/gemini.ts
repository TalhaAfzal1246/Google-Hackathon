import { SECRETS } from "./secrets";

/**
 * Universal Gemini API JSON caller using Google's v1beta REST Interactions API.
 * Uses strict timeout and provides structured deterministic fallback.
 */
export async function geminiJSON<T>(
  systemInstruction: string,
  userPrompt: string,
  fallback: T
): Promise<{ data: T; usedAI: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for mobile/wifi networks

  const apiKey = process.env.GEMINI_API_KEY || SECRETS.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || SECRETS.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Gemini API error status ${res.status}:`, errText);
      return { data: fallback, usedAI: false };
    }

    const payload = await res.json();
    const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return { data: fallback, usedAI: false };
    }

    const parsed = JSON.parse(rawText) as T;
    return { data: parsed, usedAI: true };
  } catch (err) {
    console.warn("Gemini call exception, using structured fallback:", err);
    return { data: fallback, usedAI: false };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Universal Gemini free-form text generation helper with markdown support.
 */
export async function geminiText(
  systemInstruction: string,
  userPrompt: string,
  fallbackText: string
): Promise<{ text: string; usedAI: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const apiKey = process.env.GEMINI_API_KEY || SECRETS.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || SECRETS.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    });

    if (!res.ok) {
      return { text: fallbackText, usedAI: false };
    }

    const payload = await res.json();
    const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    return { text: rawText || fallbackText, usedAI: !!rawText };
  } catch (err) {
    console.warn("Gemini text generation failed, using fallback:", err);
    return { text: fallbackText, usedAI: false };
  } finally {
    clearTimeout(timeoutId);
  }
}
