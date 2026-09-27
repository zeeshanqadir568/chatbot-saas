# Nova Chat Widget

An embeddable chat widget you can drop onto any website: a compact bubble that opens a chat
popup, with an expand button for a full-size panel. Built as the front end for an AI support or
sales assistant, with branding you can change in one config file.

| Landing | Compact chat | Expanded panel |
| --- | --- | --- |
| ![Landing](screenshots/landing.png) | ![Compact conversation](screenshots/compact-conversation.png) | ![Expanded panel](screenshots/expanded-panel.png) |

## Features

- Compact popup and expandable large-panel mode
- Quick-reply suggestions so visitors don't have to type
- Structured replies (bullets, bold) rendered in the chat
- Voice input (speech-to-text) and file attachments with a local preview
- Synthesised send/receive sounds with a mute toggle
- Branding config: agent name, company name, accent colour, avatar, greeting, position

> **Demo backend:** `src/app/api/chat/route.ts` answers with keyword-matched sample replies.
> It is not connected to a language model or knowledge base yet. Swap that route for your own
> LLM or RAG endpoint to make it answer real questions.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click the bubble in the bottom-right corner.

## Customise

Edit `src/components/chat-widget/config.ts`:

```ts
export const defaultConfig: ChatWidgetConfig = {
  agentName: "Nova",
  companyName: "Novachat",
  accentColor: "#7c5cff",
  avatarInitial: "N",
  greeting: "Hi, I'm Nova. Ask me about pricing, features, or how to get started.",
  suggestions: ["What can you do?", "Show me pricing", "Talk to a human"],
  position: "bottom-right",
  showBranding: true,
};
```

## Stack

Next.js 16 (App Router), React, TypeScript, Tailwind CSS.

## Layout

- `src/components/chat-widget/`: the widget (`ChatWidget.tsx`, config, types, speech input and sound hooks)
- `src/app/api/chat/route.ts`: demo chat endpoint
- `src/app/page.tsx`: demo landing page
- `screenshots/`: images used in this README
