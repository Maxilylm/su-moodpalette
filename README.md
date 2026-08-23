# MoodPalette

> Describe a mood, vibe, or scene in plain language and get a harmonious 6-color palette back.

**[Live demo](https://moodpalette-mlx.vercel.app)**

Picking colors for a project usually means scrolling through generic palette galleries that have no relationship to the feeling you are going for. MoodPalette takes a written description — "rainy Tokyo alleyway at 2am", "sun-bleached 70s postcard" — and asks Llama 3.3 for six colors with evocative names, hex codes, and a suggested role (background, surface, primary, secondary, accent, text). The API route validates the response so every palette has exactly six colors and well-formed hex values, replacing anything malformed before it reaches the UI.

## Features

- Natural-language mood input with rotating example prompts
- Six named colors, each with a hex code and a suggested UI role
- Live gradient strip built from the full palette
- Click any swatch to copy its hex to the clipboard
- One-click export as CSS custom properties, a Tailwind color config, or raw JSON
- Session history of previous palettes — click any one to bring it back

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Groq API — `llama-3.3-70b-versatile` in JSON mode
- Deployed on Vercel

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local` — the key is read server-side in the `/api/generate` route and never reaches the browser.

---

Part of a series of 91 small web apps. [Browse them all](https://lorenzoylosada.vercel.app).
