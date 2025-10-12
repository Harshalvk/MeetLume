import { Bot, User } from "lucide-react";
import React from "react";

interface Message {
  id: number;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessage = ({ messages, isLoading }: ChatMessageProps) => {
  return (
    <div className="space-y-4 h-full overflow-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isBot ? "justify-start" : "justify-start flex-row-reverse"}`}
        >
          {message.isBot ? (
            <div className="bg-card p-2 h-fit rounded-lg mr-2">
              <Bot className="w-5 h-5 bg-card" />
            </div>
          ) : (
            <div className="bg-primary p-2 h-fit rounded-lg ml-2">
              <User className="w-5 h-5 dark:text-black" />
            </div>
          )}

          <div
            className={`max-w-[70%] rounded-lg p-4 ${message.isBot ? "bg-card border-border text-foreground" : "bg-primary text-primary-foreground"}`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground flex gap-2 items-center">
              <Bot className="h-5 w-5" />
              Searching through all your meetings...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
