"use client";

import { useChatCore } from "./useChatCore";

const chatSuggestions = [
  "List the main decisions taken during yesterday’s product meeting.",
  "Summarize the key tasks assigned in last week’s standup.",
  "Who participated in Monday’s client presentation?",
  "What upcoming deadlines were discussed in recent meetings?",
  "Draft a follow-up email for the marketing meeting.",
  "What comments or suggestions were shared about the new feature?",
];

export default function useChatAll() {
  const chat = useChatCore({
    apiEndpoint: "/api/v1/rag/chat-all",
    getRequestBody: (input) => ({ question: input }),
  });

  return {
    ...chat,
    chatSuggestions,
  };
}
