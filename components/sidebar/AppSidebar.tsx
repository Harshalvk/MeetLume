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
import UserCurrentPlan from "./UserCurrentPlan";
import { Skeleton } from "../ui/skeleton";
import UpgradeToPremium from "./UpgradeToPremium";

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
  const { open: sidebarOpen, isMobile } = useSidebar();

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
          <SidebarMenuItem className="w-full flex items-center justify-start">
            <SidebarMenuButton>
              <div>
                <CircleStop className="size-5" />
              </div>
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
        {sidebarOpen || isMobile ? (
          usage ? (
            <UserCurrentPlan
              usage={usage}
              limits={limits}
              chatProgress={chatProgress}
              meetingProgress={meetingProgress}
            />
          ) : (
            <Skeleton className="w-full h-36 rounded-lg" />
          )
        ) : null}

        {sidebarOpen || isMobile ? (
          upgradeInfo ? (
            <UpgradeToPremium upgradeInfo={upgradeInfo} />
          ) : (
            <Skeleton className="w-full h-36 rounded-lg" />
          )
        ) : null}

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
