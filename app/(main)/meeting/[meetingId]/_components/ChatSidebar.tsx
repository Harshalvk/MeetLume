"use client";

import { useUsage } from "@/app/contexts/UsageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface IMessage {
  id: number;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface IChatSidebarProps {
  messages: IMessage[];
  chatInput: string;
  showSuggestions: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onSuggestionClick: (suggestion: string) => void;
}

const ChatSidebar = ({
  messages,
  chatInput,
  showSuggestions,
  onInputChange,
  onSendMessage,
  onSuggestionClick,
}: IChatSidebarProps) => {
  const { canChat } = useUsage();

  const chatSuggestions = [
    "What were the key deadlines discussed in this meeting?",
    "Draft a follow-up email for the team based on this meeting",
    "What feedback or suggestions were given to me during the discussion?",
    "Summarize the main action items and next steps from this meeting",
  ];

  return (
    <div className="w-1/3 h-full hidden border-l border-border lg:flex flex-col relative">
      <div className="p-4 border-b border-border absolute top-0 bg-card w-full z-10">
        <h3 className="font-semibold text-foreground">Meeting Assistant</h3>
        <p className="text-sm text-muted-foreground">
          Ask me anything about this meeting
        </p>
      </div>

      <div className="px-2 mt-20 h-full overflow-y-auto pb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] mt-3 rounded-lg p-3 ${message.isBot ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {messages.length > 0 && !messages[messages.length - 1].isBot && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg p-3">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}

        {showSuggestions && messages.length === 0 && (
          <div className="flex flex-col items-center space-y-3 mt-8">
            {chatSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                disabled={!canChat}
                className={`w-4/5 rounded-lg p-4 border transition-colors text-center ${canChat ? "bg-primary/10 text-foreground border-primary/20 hover:bg-primary/20" : "bg-muted/50 text-muted-foreground border-muted cursor-not-allowed"}`}
              >
                <p>⚡ {suggestion}</p>
              </button>
            ))}
          </div>
        )}

        {!canChat && (
          <div className="text-center p-4">
            <p className="text-xs text-muted-foreground mb-2">
              Daily chat limit reached
            </p>
            <a href="/pricing" className="text-xs text-primary underline">
              Upgrade to continue chatting
            </a>
          </div>
        )}
      </div>

      <div className="w-full flex absolute bottom-0 right-0 px-3 py-2 mr-2">
        <div className="flex gap-2 bg-card p-4 rounded-lg flex-1">
          <Input
            type="text"
            value={chatInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder={
              canChat ? "Ask about this meeting..." : "Daily limit reached"
            }
          />

          <Button
            type="button"
            onClick={onSendMessage}
            disabled={!chatInput.trim() || !canChat}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
