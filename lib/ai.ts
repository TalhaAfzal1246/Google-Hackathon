import OpenAI from "openai";
import { SECRETS } from "./secrets";

/**
 * Universal Makerend Client (GPT-6.1 Terra)
 * Configured with OpenAI-compatible endpoint at https://makerend.com/v1
 */
function getClient(): OpenAI {
  const apiKey =
    process.env.MAKEREND_API_KEY ||
    SECRETS.MAKEREND_API_KEY ||
    "sk-ZvpA8rLV3hqCdMmiAX14TXMYUg8OE6BzbTjaPVOyCgJGRGYm";
  const baseURL =
    process.env.MAKEREND_BASE_URL ||
    SECRETS.MAKEREND_BASE_URL ||
    "https://makerend.com/v1";

  return new OpenAI({
    apiKey,
    baseURL,
  });
}

const DEFAULT_MODEL = "gpt-6.1-terra";

export async function aiJSON<T>(
  systemInstruction: string,
  userPrompt: string,
  fallback: T
): Promise<{ data: T; usedAI: boolean; model: string }> {
  const client = getClient();
  const model =
    process.env.MAKEREND_MODEL || SECRETS.MAKEREND_MODEL || DEFAULT_MODEL;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { data: fallback, usedAI: false, model };
    }

    const parsed = JSON.parse(content) as T;
    return { data: parsed, usedAI: true, model };
  } catch (err) {
    console.warn("Makerend AI error, returning resilient fallback:", err);
    return { data: fallback, usedAI: false, model };
  }
}

export async function aiText(
  systemInstruction: string,
  userPrompt: string,
  fallbackText: string
): Promise<{ text: string; usedAI: boolean; model: string }> {
  const client = getClient();
  const model =
    process.env.MAKEREND_MODEL || SECRETS.MAKEREND_MODEL || DEFAULT_MODEL;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;
    return {
      text: content || fallbackText,
      usedAI: !!content,
      model,
    };
  } catch (err) {
    console.warn("Makerend text completion error:", err);
    return { text: fallbackText, usedAI: false, model };
  }
}
