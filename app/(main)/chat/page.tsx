"use client";

import useChatAll from "@/hooks/useChatAll";
import React from "react";
import ChatSuggestions from "./_components/ChatSuggestions";
import ChatMessage from "./_components/ChatMessage";
import ChatInput from "./_components/ChatInput";

const ChatWithAllMeetingsPage = () => {
  const {
    chatInput,
    messages,
    showSuggestions,
    isLoading,
    chatSuggestions,
    handleSendMessage,
    handleSuggestionClick,
    handleInputChange,
  } = useChatAll();

  return (
    <div className="h-full bg-background flex flex-col items-center">
      <div className="flex-1 flex flex-col max-w-4xl w-full">
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && showSuggestions ? (
            <ChatSuggestions
              suggestions={chatSuggestions}
              onSuggestionsClick={handleSuggestionClick}
            />
          ) : (
            <ChatMessage messages={messages} isLoading={isLoading} />
          )}
        </div>
        <div className="sticky bottom-0 w-full">
          <ChatInput
            chatInput={chatInput}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWithAllMeetingsPage;
