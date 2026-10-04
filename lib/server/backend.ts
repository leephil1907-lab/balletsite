import { backendHeaders, serverConfig } from "./config";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AgentResponse = {
  content: string;
  model?: string;
  usage?: Record<string, number>;
};

export async function callAgent(messages: ChatMessage[], systemPrompt?: string) {
  const payload = {
    messages,
    ...(systemPrompt ? { system_prompt: systemPrompt } : {}),
  };

  const response = await fetch(serverConfig.agentUrl(), {
    method: "POST",
    headers: backendHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Agent backend returned ${response.status}`);
  }

  return data as AgentResponse;
}

export async function synthesizeSpeech(input: Record<string, unknown>) {
  const response = await fetch(serverConfig.ttsUrl(), {
    method: "POST",
    headers: backendHeaders(),
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `TTS backend returned ${response.status}`);
  }

  return response;
}
