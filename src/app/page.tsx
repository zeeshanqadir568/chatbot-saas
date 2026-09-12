import { ChatWidget } from "@/components/chat-widget/ChatWidget";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#0a0a0b] text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-6 py-24">
        <span className="mb-4 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
          Widget demo
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          A chat widget you can put on any site.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-400">
          Click the bubble in the corner. Try the expand icon in the header for
          the full-size panel, and the speaker icon to toggle the send/receive
          sound.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-zinc-400">
          <li>• Compact popup + expandable large-panel mode</li>
          <li>• Synthesized send/receive notification sounds</li>
          <li>• Structured (bulleted, bold) agent responses</li>
          <li>• Branding config: accent color, name, avatar, greeting</li>
        </ul>
      </main>
      <ChatWidget />
    </div>
  );
}
