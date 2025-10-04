"use client";

import React, { useState } from "react";
import ThemeProvider from "./ThemeProvider";
import { UsageProvider } from "@/app/contexts/UsageContext";
import ConditionalLayout from "../ConditionalLayout";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute={"class"}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <UsageProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </UsageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
};

export default AppProvider;
