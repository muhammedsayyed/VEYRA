import { request } from "./client";

export async function chat(messages: { role: string; content: string }[], userContext?: any) {
  // Backend owns keys, frontend never exposes them
  return request<{ message: string; provider: string }>(`/ai/chat`, {
    method: "POST",
    body: JSON.stringify({ messages, userContext }),
  });
}
