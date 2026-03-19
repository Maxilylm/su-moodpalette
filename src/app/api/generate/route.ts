import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { mood } = await request.json();

    if (!mood || typeof mood !== "string") {
      return Response.json(
        { error: "Please provide a mood description" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a world-class color palette designer. Given a mood, vibe, or scene description, generate a harmonious 6-color palette. Return ONLY valid JSON with no extra text. The JSON must match this exact structure:
{
  "palette_name": "A creative evocative name for the palette",
  "description": "A short poetic description of the palette mood",
  "colors": [
    {
      "name": "Creative color name (like 'Midnight Velvet' not 'Dark Blue')",
      "hex": "#RRGGBB",
      "usage": "One of: background, surface, primary, secondary, accent, text"
    }
  ]
}

Rules:
- Exactly 6 colors
- All hex codes must be valid 6-digit hex colors
- Colors must work harmoniously together
- One color should be suitable as a dark background
- One color should work for readable text
- Creative, evocative names only — never generic color names
- Usage must be one of: background, surface, primary, secondary, accent, text`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a 6-color palette for this mood: "${mood}"`,
          },
        ],
        temperature: 0.9,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", errText);
      return Response.json(
        { error: "Failed to generate palette. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "Empty response from AI" },
        { status: 502 }
      );
    }

    const palette = JSON.parse(content);

    // Validate
    if (
      !palette.palette_name ||
      !palette.colors ||
      !Array.isArray(palette.colors) ||
      palette.colors.length !== 6
    ) {
      return Response.json(
        { error: "Invalid palette format from AI. Please try again." },
        { status: 502 }
      );
    }

    // Validate hex codes
    for (const color of palette.colors) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(color.hex)) {
        color.hex =
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0");
      }
    }

    return Response.json(palette);
  } catch (error) {
    console.error("Generate palette error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
