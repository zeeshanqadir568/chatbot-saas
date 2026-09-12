import { NextRequest, NextResponse } from "next/server";

const RESPONSES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["pricing", "price", "cost", "plan"],
    reply:
      "Here's how pricing would typically work:\n\n- **Starter** — free, your branding, up to 100 conversations/mo\n- **Growth** — $49/mo, unlimited conversations, custom colors & avatar\n- **Agency** — $199/mo, white-label for reselling to your own clients\n\nWant me to connect you with a sales rep instead?",
  },
  {
    keywords: ["feature", "do", "can you", "capab", "help"],
    reply:
      "A few things I can do out of the box:\n\n- Answer questions from your own knowledge base\n- Qualify leads and hand off to a human when needed\n- Show quick-reply suggestions so visitors don't have to type\n- Expand into a full-size panel for longer conversations\n\nTry one of the quick replies below, or ask me anything else.",
  },
  {
    keywords: ["human", "agent", "sales", "talk to", "rep"],
    reply:
      "Sure — I've flagged this conversation for a teammate to pick up. Anything I can try to help with in the meantime?",
  },
];

const FALLBACK =
  "Got it. This demo isn't wired to a real knowledge base yet — in production I'd retrieve an answer from your docs and reply here, formatted just like this.";

function pickReply(message: string): string {
  const lower = message.toLowerCase();
  for (const entry of RESPONSES) {
    if (entry.keywords.some((keyword) => lower.includes(keyword))) {
      return entry.reply;
    }
  }
  return FALLBACK;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message : "";

  const reply = pickReply(message);
  const delay = 500 + Math.random() * 700;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return NextResponse.json({ reply, timestamp: Date.now() });
}
