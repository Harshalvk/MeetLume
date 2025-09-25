import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-full flex flex-col overflow-clip">
      <div className="px-1 py-2 border-b border-muted-foreground/10 bg-sidebar">
        <SidebarTrigger />
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default Layout;
