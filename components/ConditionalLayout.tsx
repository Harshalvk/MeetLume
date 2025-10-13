"use client";

import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { AppSidebar } from "./sidebar/AppSidebar";

const ConditionalLayout = ({ children }: { children: ReactNode }) => {
  const pathName = usePathname();
  const { data: session } = useSession();

  const showSidebar =
    pathName !== "/" && !(pathName.startsWith("/meeting/") && !session?.user);

  if (!showSidebar) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default ConditionalLayout;
