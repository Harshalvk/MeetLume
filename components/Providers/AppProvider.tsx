"use client";

import React, { useState } from "react";
import ThemeProvider from "./ThemeProvider";
import { UsageProvider } from "@/app/contexts/UsageContext";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "../ui/sidebar";
import { ChatSidebarProvider } from "@/app/contexts/ChatSidebar";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <SidebarProvider defaultOpen={false}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute={"class"}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <UsageProvider>
              <ChatSidebarProvider>{children}</ChatSidebarProvider>
            </UsageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SidebarProvider>
    </>
  );
};

export default AppProvider;
