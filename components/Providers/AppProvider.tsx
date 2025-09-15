import React from "react";
import ThemeProvider from "./ThemeProvider";
import { UsageProvider } from "@/app/contexts/UsageContext";
import ConditionalLayout from "../ConditionalLayout";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider
        attribute={"class"}
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UsageProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </UsageProvider>
      </ThemeProvider>
    </>
  );
};

export default AppProvider;
