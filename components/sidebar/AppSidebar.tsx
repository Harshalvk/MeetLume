"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "../Logo";
import { SidebarUser } from "./SidebarUser";
import {
  BotMessageSquare,
  CircleStop,
  Coins,
  House,
  LucideIcon,
  Settings,
  ToyBrick,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { useUsage } from "@/app/contexts/UsageContext";
import Link from "next/link";
import { Button } from "../ui/button";

const items: { title: string; url: string; icon: LucideIcon }[] = [
  {
    title: "Home",
    url: "/home",
    icon: House,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: ToyBrick,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Chat wit AI",
    url: "/chat",
    icon: BotMessageSquare,
  },
  {
    title: "Pricing",
    url: "/pricing",
    icon: Coins,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathName = usePathname();
  const { usage, limits } = useUsage();
  const { open: sidebarOpen } = useSidebar();

  const meetingProgress =
    usage && limits.meetings !== -1
      ? Math.min((usage.meetingsThisMonth / limits.meetings) * 100, 100)
      : 0;

  const chatProgress =
    usage && limits.chatMessages !== -1
      ? Math.min((usage.chatMessagesToday / limits.chatMessages) * 100, 100)
      : 0;

  const getUpgradeInfo = () => {
    if (!usage) return null;

    switch (usage.currentPlan) {
      case "free":
        return {
          title: "Upgrade to Starter",
          description: "Get 10 meetings per month and 30 daily chat messages",
          showButton: true,
        };
      case "starter":
        return {
          title: "Upgrade to Pro",
          description: "Get 30 meetings per month and 100 daily chat messages",
          showButton: true,
        };
      case "pro":
        return {
          title: "Upgrade to Premium",
          description: "Get unlimited meetings and chat messages",
          showButton: true,
        };
      case "premium":
        return {
          title: "You're on Premium",
          description: "Enjoying unlimited access to add features",
          showButton: true,
        };
      default:
        return {
          title: "Upgrade Your Plan",
          description: "Get access to more features",
          showButton: true,
        };
    }
  };

  const upgradeInfo = getUpgradeInfo();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-full flex items-center gap-2">
            <SidebarMenuButton>
              <CircleStop />
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathName === item.url}
                    className="w-full justify-start gap-3 rounded-lg text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary/5 data-[active=true]:text-foreground"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {usage && sidebarOpen && (
          <div className="rounded-lg bg-sidebar-accent/50 p-3 mb-3 outline">
            <p className="text-xs font-medium text-sidebar-accent-foreground mb-3">
              Current Plan: {usage.currentPlan.toUpperCase()}
            </p>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-sidebar-accent-foreground/70">
                  Meetings
                </span>
                <span className="text-xs text-sidebar-accent-foreground/70">
                  {usage.meetingsThisMonth}/
                  {limits.meetings === -1 ? "∞" : limits.meetings}
                </span>
              </div>
              {limits.meetings !== -1 && (
                <div className="w-full bg-sidebar-accent/30 rounded-full h-2">
                  <div
                    className="dark:bg-white bg-black h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${meetingProgress}%` }}
                  >
                    {" "}
                  </div>
                </div>
              )}
              {limits.meetings === -1 && (
                <div className="text-xs text-sidebar-accent-foreground/50 italic">
                  Unlimited
                </div>
              )}
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-sidebar-accent-foreground/70">
                  Chat Messages
                </span>
                <span className="text-xs text-sidebar-accent-foreground/70">
                  {usage.chatMessagesToday}/
                  {limits.chatMessages === -1 ? "∞" : limits.chatMessages}
                </span>
              </div>
              {limits.chatMessages !== -1 && (
                <div className="w-full bg-sidebar-accent/30 rounded-full h-2">
                  <div
                    className="dark:bg-white bg-black h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${chatProgress}%` }}
                  >
                    {" "}
                  </div>
                </div>
              )}
              {limits.chatMessages === -1 && (
                <div className="text-xs text-sidebar-accent-foreground/50 italic">
                  Unlimited
                </div>
              )}
            </div>
          </div>
        )}
        {upgradeInfo && sidebarOpen && (
          <div className="rounded-lg bg-sidebar-accent p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-sidebar-accent-foreground">
                  {upgradeInfo.title}
                </p>
                <p className="text-xs text-sidebar-accent-foreground/70">
                  {upgradeInfo.description}
                </p>
              </div>
              {upgradeInfo.showButton && (
                <Link href="/pricing">
                  <Button className="w-full rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer">
                    {upgradeInfo.title}
                  </Button>
                </Link>
              )}

              {!upgradeInfo.showButton && (
                <div className="text-center py-2">
                  <span className="text-xs text-sidebar-accent-foreground/60">
                    🎉 Thank you for your support!
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <SidebarUser
          user={{
            avatar: session?.user.image ?? "",
            email: session?.user.email ?? "",
            name: session?.user.name ?? "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
