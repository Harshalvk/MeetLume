"use client";

import ConditionalLayout from "@/components/ConditionalLayout";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const actualPath =
    pathname.split("/")[1].charAt(0).toUpperCase() + pathname.slice(2);

  return (
    <ConditionalLayout>
      {pathname.startsWith("/meeting") ? (
        <div className="h-screen w-full flex flex-col overflow-clip">
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      ) : (
        <div className="h-screen w-full flex flex-col overflow-clip">
          <div className="px-1 py-2 border-b border-muted-foreground/10 bg-sidebar flex gap-1 items-center">
            <SidebarTrigger />
            <div className="h-full border-r border-border mr-2" />
            <div>
              <p className="text-xl font-semibold">{actualPath}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      )}
    </ConditionalLayout>
  );
};

export default Layout;
