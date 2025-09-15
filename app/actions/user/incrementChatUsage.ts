"use server";

import { prisma } from "@/lib/prisma";
import GetUser from "./getUserSession";
import { canUserChat, incrementChatUsage } from "@/lib/usage";

export default async function IncrementChatUsageAction() {
  try {
    const user = await GetUser();

    const userChats = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        currentPlan: true,
        subscriptionStatus: true,
        chatMessagesToday: true,
      },
    });

    if (!userChats) {
      return { success: false, data: null, error: "chats data not found" };
    }

    const chatCheck = await canUserChat(user.id);

    if (!chatCheck.allowed) {
      return {
        success: false,
        data: null,
        error: chatCheck.reason,
        upgradeRequired: true,
      };
    }

    await incrementChatUsage(user.id);

    return { success: true };
  } catch (error) {
    console.error("IncrementChat error:", error);
    return {
      success: false,
      data: null,
      error: "Falied to increment chat usage",
    };
  }
}
