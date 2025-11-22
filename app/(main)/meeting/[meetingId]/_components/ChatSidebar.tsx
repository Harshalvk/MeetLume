"use client";

import { useChatSidebar } from "@/app/contexts/ChatSidebar";
import { useUsage } from "@/app/contexts/UsageContext";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
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

  const { chatSidebarOpen } = useChatSidebar();

  const chatSuggestions = [
    "What were the key deadlines discussed in this meeting?",
    "Draft a follow-up email for the team based on this meeting",
    "What feedback or suggestions were given to me during the discussion?",
    "Summarize the main action items and next steps from this meeting",
  ];

  return (
    <div className={cn(chatSidebarOpen ? "w-0" : "w-1/3", "overflow-hidden")}>
      <div
        className={cn(
          chatSidebarOpen ? "translate-x-full" : "-translate-x-0",
          "w-full h-full hidden border-l border-border lg:flex flex-col relative transition-all duration-300"
        )}
      >
        <div className="p-4 border-b border-border absolute top-0 bg-card w-full z-10">
          <h3 className="font-semibold text-foreground">Meeting Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Ask me anything about this meeting
          </p>
        </div>

        <div className="px-2 mt-20 h-[calc(80vh-60px)] overflow-y-auto pb-24">
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
                  className={`w-4/5 rounded-xl py-2 border transition-colors text-center text-sm  ${canChat ? "bg-muted-foreground/4 text-foreground border-primary/20 hover:bg-muted-foreground/8" : "bg-muted/50 text-muted-foreground border-muted cursor-not-allowed"}`}
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
          <InputGroup>
            <InputGroupTextarea
              placeholder={
                canChat ? "Ask, Search or Chat..." : "Daily limit reached"
              }
              value={chatInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />
            <InputGroupAddon align="block-end">
              <InputGroupButton
                variant="default"
                onClick={onSendMessage}
                className="rounded-full ml-auto"
                size="icon-xs"
                disabled={!chatInput.trim() || !canChat}
              >
                <ArrowUp />
                <span className="sr-only">Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
