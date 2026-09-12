"use client";

import { useCallback, useRef } from "react";

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function useNotificationSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as WindowWithWebkitAudio).webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (freqStart: number, freqEnd: number, duration: number, volume: number) => {
      if (!enabled) return;
      const ctx = getContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(freqEnd, 1),
          ctx.currentTime + duration
        );
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Audio is best-effort; ignore autoplay/unsupported-browser failures.
      }
    },
    [enabled, getContext]
  );

  const playSend = useCallback(() => play(680, 900, 0.09, 0.05), [play]);
  const playReceive = useCallback(() => play(520, 340, 0.12, 0.06), [play]);

  return { playSend, playReceive };
}
