"use client";

import { useSession } from "@/lib/auth-client";
import { IPlanLimits, PLAN_LIMITS } from "@/lib/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import IncrementChatUsageAction from "@/app/actions/user/incrementChatUsage";
import IncrementMeetingUsageAction from "@/app/actions/user/incrementMeetingUsage";

interface IUsageData {
  currentPlan: string;
  subscriptionStatus: string;
  meetingsThisMonth: number;
  chatMessagesToday: number;
  billingPeriodStart: string | null;
}

interface IUsageContextType {
  usage: IUsageData | null;
  loading: boolean;
  canChat: boolean;
  canScheduleMeeting: boolean;
  limits: IPlanLimits;
  incrementChatUsage: () => Promise<void>;
  incrementMeetingUsage: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const UsageContext = createContext<IUsageContextType | undefined>(undefined);

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<IUsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const limits = usage
    ? PLAN_LIMITS[usage.currentPlan] || PLAN_LIMITS.free || PLAN_LIMITS.free
    : PLAN_LIMITS.free;

  const canChat = usage
    ? usage.currentPlan !== "free" &&
      usage.subscriptionStatus === "active" &&
      (limits.chatMessages === -1 ||
        usage.chatMessagesToday < limits.chatMessages)
    : false;

  const canScheduleMeeting = usage
    ? usage.currentPlan !== "free" &&
      usage.subscriptionStatus === "active" &&
      (limits.meetings === -1 || usage.meetingsThisMonth < limits.meetings)
    : false;

  const fetchUsage = useCallback(async () => {
    if (!session?.user.id) return;

    try {
      const response = await fetch("/api/v1/user/usage");
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.log("Failed to fetch usage", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user.id]);

  const incrementChatUsage = async () => {
    if (!canChat) return;

    try {
      const usageResult = await IncrementChatUsageAction();
      if (usageResult.success) {
        setUsage((prev) =>
          prev
            ? { ...prev, chatMessagesToday: prev.chatMessagesToday + 1 }
            : null
        );
      } else {
        if (usageResult.upgradeRequired) {
          console.log(usageResult.error);
        }
      }
    } catch (error) {
      console.error("Failed to increment chat usage", error);
    }
  };

  const incrementMeetingUsage = async () => {
    if (!canScheduleMeeting) return;

    try {
      const usageResult = await IncrementMeetingUsageAction();
      if (usageResult.success) {
        setUsage((prev) =>
          prev
            ? { ...prev, meetingsThisMonth: prev.meetingsThisMonth + 1 }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to increment meeting usage", error);
    }
  };

  const refreshUsage = async () => {
    await fetchUsage();
  };

  useEffect(() => {
    if (session?.user.id) {
      fetchUsage();
    } else if (!session?.user.id) {
      setLoading(false);
    }
  }, [fetchUsage, loading, session?.user.id]);

  return (
    <UsageContext.Provider
      value={{
        usage,
        loading,
        canChat,
        canScheduleMeeting,
        limits,
        incrementChatUsage,
        incrementMeetingUsage,
        refreshUsage,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error("useUsage must be defined");
  }

  return context;
}
