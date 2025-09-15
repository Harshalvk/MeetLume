import { prisma } from "./prisma";
import { PLAN_LIMITS } from "./types";

export async function canUserChat(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return { allowed: false, reason: "User not found" };
  }

  if (user.currentPlan === "free" || user.subscriptionStatus === "expired") {
    return {
      allowed: false,
      reason: "Upgrade your plan to chat with our AI bot",
    };
  }

  const limits = PLAN_LIMITS[user.currentPlan];

  if (!limits) {
    return { allowed: false, reason: "Invalid subscription plan" };
  }

  if (
    limits.chatMessages !== -1 &&
    user.chatMessagesToday > limits.chatMessages
  ) {
    return {
      allowed: false,
      reason: `You've reached your daily limit of ${limits.chatMessages} messages.`,
    };
  }

  return { allowed: true };
}

export async function incrementMeetingUsage(userId: string) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      meetingsThisMonth: {
        increment: 1,
      },
    },
  });
}

export async function incrementChatUsage(userId: string) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      chatMessagesToday: {
        increment: 1,
      },
    },
  });
}

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}
