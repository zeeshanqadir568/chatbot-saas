export type ChatRole = "user" | "agent";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface ChatWidgetConfig {
  agentName: string;
  companyName?: string;
  accentColor: string;
  avatarInitial?: string;
  greeting: string;
  suggestions?: string[];
  position?: "bottom-right" | "bottom-left";
  showBranding?: boolean;
}
