"use client";

import { useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
  MessageCircle,
  Paperclip,
  Mic,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { defaultConfig } from "./config";
import { useNotificationSound } from "./useNotificationSound";
import { useSpeechInput } from "./useSpeechInput";
import { MarkdownLite } from "./MarkdownLite";
import { now } from "./now";
import type { ChatMessage, ChatWidgetConfig } from "./types";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shade(hex: string, amount: number) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function ChatWidget(config: Partial<ChatWidgetConfig> = {}) {
  const cfg: ChatWidgetConfig = { ...defaultConfig, ...config };
  const accent = cfg.accentColor;

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greeting",
      role: "agent",
      content: cfg.greeting,
      timestamp: now(),
    },
  ]);

  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const { playSend, playReceive } = useNotificationSound(soundOn);
  const { isRecording, supported: micSupported, toggle: toggleMic } =
    useSpeechInput((transcript) => setInput(transcript));
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, expanded]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed && !attachedFile) return;
    if (isTyping) return;

    const content = attachedFile
      ? [trimmed, `📎 ${attachedFile.name}`].filter(Boolean).join("\n")
      : trimmed;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedFile(null);
    playSend();
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: data.reply ?? "Sorry, something went wrong.",
        timestamp: data.timestamp ?? now(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      playReceive();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: "Couldn't reach the server. Please try again.",
          timestamp: now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  const showSuggestions = messages.length === 1 && !isTyping;
  const sideClass = cfg.position === "bottom-left" ? "left-6" : "right-6";
  const panelSideClass = cfg.position === "bottom-left" ? "left-0 sm:rounded-r-3xl" : "right-0 sm:rounded-l-3xl";

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={`Open chat with ${cfg.agentName}`}
          className={cx(
            "fixed bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 active:scale-95",
            sideClass
          )}
          style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent, -40)})` }}
        >
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-20"
            style={{ background: accent }}
          />
          <MessageCircle className="relative h-6 w-6 text-white" />
        </button>
      )}

      {open && (
        <div
          className={cx(
            "fixed z-50 flex flex-col overflow-hidden border border-white/10 bg-[#131316]/97 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 ease-out",
            expanded
              ? cx("inset-y-0 w-full sm:w-[440px]", panelSideClass)
              : cx("bottom-24 h-[min(640px,80vh)] w-[min(380px,92vw)] rounded-3xl", sideClass)
          )}
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent, -40)})` }}
              >
                {cfg.avatarInitial}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">{cfg.agentName}</p>
                <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundOn((s) => !s)}
                aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
              >
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setExpanded((e) => !e)}
                aria-label={expanded ? "Collapse chat" : "Expand chat"}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cx("flex flex-col gap-1 animate-[fadeInUp_0.25s_ease-out]", msg.role === "user" ? "items-end" : "items-start")}
              >
                <div className="flex max-w-[85%] items-start gap-2">
                  {msg.role === "agent" && (
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent, -40)})` }}
                    >
                      {cfg.avatarInitial}
                    </div>
                  )}
                  <div
                    className={cx(
                      "px-3.5 py-2.5 text-[13.5px] text-zinc-100",
                      msg.role === "user"
                        ? "rounded-2xl rounded-tr-sm text-white"
                        : "rounded-2xl rounded-tl-sm bg-white/[0.06]"
                    )}
                    style={msg.role === "user" ? { background: `linear-gradient(135deg, ${accent}, ${shade(accent, -30)})` } : undefined}
                  >
                    <MarkdownLite text={msg.content} />
                  </div>
                </div>
                <span className={cx("text-[10px] text-zinc-600", msg.role === "agent" && "pl-8")}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent, -40)})` }}
                >
                  {cfg.avatarInitial}
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white/[0.06] px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && cfg.suggestions && (
              <div className="flex flex-wrap gap-2 pl-8">
                {cfg.suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            {attachedFile && (
              <div className="mb-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300">
                <Paperclip className="h-3 w-3 shrink-0 text-zinc-500" />
                <span className="flex-1 truncate">{attachedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  aria-label="Remove attachment"
                  className="text-zinc-500 hover:text-zinc-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setAttachedFile(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach a file"
                className="rounded-full p-1.5 text-zinc-500 transition-colors hover:text-zinc-300"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Message..."}
                className="flex-1 bg-transparent text-[13.5px] text-zinc-100 placeholder-zinc-500 outline-none"
              />
              {micSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                  className={cx(
                    "rounded-full p-1.5 transition-colors",
                    isRecording ? "animate-pulse text-red-400" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={(!input.trim() && !attachedFile) || isTyping}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
                style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent, -40)})` }}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            {cfg.showBranding && (
              <p className="mt-2 text-center text-[10px] text-zinc-600">
                Powered by {cfg.companyName} · Developed by zeeshanqadir568
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
