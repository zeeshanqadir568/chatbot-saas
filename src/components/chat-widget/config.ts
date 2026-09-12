import type { ChatWidgetConfig } from "./types";

export const defaultConfig: ChatWidgetConfig = {
  agentName: "Nova",
  companyName: "Novachat",
  accentColor: "#7c5cff",
  avatarInitial: "N",
  greeting:
    "Hi, I'm Nova. Ask me about pricing, features, or how to get started.",
  suggestions: ["What can you do?", "Show me pricing", "Talk to a human"],
  position: "bottom-right",
  showBranding: true,
};
