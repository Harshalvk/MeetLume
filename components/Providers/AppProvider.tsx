import React from "react";
import ThemeProvider from "./ThemeProvider";
import { UsageProvider } from "@/app/contexts/UsageContext";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider
        attribute={"class"}
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UsageProvider>{children}</UsageProvider>
      </ThemeProvider>
    </>
  );
};

export default AppProvider;
