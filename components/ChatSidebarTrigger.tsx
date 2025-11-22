"use client";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useChatSidebar } from "@/app/contexts/ChatSidebar";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const ChatSidebarTrigger = ({ className }: { className?: string }) => {
  const { chatSidebarOpen, setChatSidebarOpen } = useChatSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          variant="ghost"
          size="icon"
          className={cn("size-7", className)}
          onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
        >
          {chatSidebarOpen ? <PanelRightOpen /> : <PanelRightClose />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Chat with meeting</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ChatSidebarTrigger;
