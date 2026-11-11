import { NextRequest, NextResponse } from "next/server";

/**
 * Split text into chunks smaller than 160 characters on word boundaries.
 */
function splitTextIntoChunks(text: string, maxLen = 150): string[] {
  // First split by sentence delimiters
  const rawSentences = text
    .replace(/([۔.!?\n]+)/g, "$1|")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    if (sentence.length <= maxLen) {
      chunks.push(sentence);
      continue;
    }

    // Split long sentence by spaces / words
    const words = sentence.split(/\s+/);
    let current = "";

    for (const word of words) {
      if ((current + " " + word).trim().length <= maxLen) {
        current = (current + " " + word).trim();
      } else {
        if (current) chunks.push(current);
        current = word;
      }
    }
    if (current) chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text") || "";
    const lang = searchParams.get("lang") || "ur";

    if (!text.trim()) {
      return NextResponse.json({ error: "Missing text query parameter" }, { status: 400 });
    }

    const chunks = splitTextIntoChunks(text.trim(), 140);
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
        lang
      )}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        throw new Error(`Google TTS responded with status ${res.status}`);
      }

      const ab = await res.arrayBuffer();
      buffers.push(Buffer.from(ab));
    }

    const combined = Buffer.concat(buffers);

    return new NextResponse(combined, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": combined.length.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    console.error("Voice TTS error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate voice" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text || "";
    const lang = body.lang || "ur";

    if (!text.trim()) {
      return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
    }

    const chunks = splitTextIntoChunks(text.trim(), 140);
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
        lang
      )}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        throw new Error(`Google TTS responded with status ${res.status}`);
      }

      const ab = await res.arrayBuffer();
      buffers.push(Buffer.from(ab));
    }

    const combined = Buffer.concat(buffers);

    return new NextResponse(combined, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": combined.length.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    console.error("Voice TTS error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate voice" }, { status: 500 });
  }
}
