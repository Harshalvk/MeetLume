"use client";

import { createContext, useContext, useState } from "react";

interface IChatSidebarType {
  chatSidebarOpen: boolean;
  setChatSidebarOpen: (value: boolean) => void;
  toggleSidebar: () => void;
}

export const ChatSidebarContext = createContext<IChatSidebarType | undefined>(
  undefined
);

export function ChatSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

  const toggleSidebar = () => setChatSidebarOpen((prev) => !prev);

  return (
    <ChatSidebarContext.Provider
      value={{ chatSidebarOpen, setChatSidebarOpen, toggleSidebar }}
    >
      {children}
    </ChatSidebarContext.Provider>
  );
}

export function useChatSidebar() {
  const context = useContext(ChatSidebarContext);

  if (!context) {
    throw new Error("useChatSidebar must be used within ChatSidebarProvider");
  }

  return context;
}
