"use server";

import { prisma } from "@/lib/prisma";
import GetUser from "./getUserSession";
import { incrementMeetingUsage } from "@/lib/usage";

export default async function IncrementMeetingUsageAction() {
  try {
    const userSession = await GetUser();

    const user = await prisma.user.findUnique({
      where: {
        id: userSession.id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return { success: false, data: null, error: "chats data not found" };
    }

    await incrementMeetingUsage(user.id);

    return { success: true };
  } catch (error) {
    console.error("IncrementChat error:", error);
    return {
      success: false,
      data: null,
      error: "Falied to increment meeting usage",
    };
  }
}
