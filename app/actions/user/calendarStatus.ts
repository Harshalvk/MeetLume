"use server";

import { prisma } from "@/lib/prisma";
import GetUserSession from "./getUserSession";

export async function CalendarStatusAction() {
  try {
    const userSession = await GetUserSession();

    if (!userSession || !userSession.id) {
      return {
        success: false,
        connected: false,
        error: "User session not found",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userSession.id,
      },
      select: {
        calendarConnected: true,
        googleAccessToken: true,
      },
    });

    if (!user) {
      return {
        success: false,
        connected: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      connected: user.calendarConnected && !!user.googleAccessToken,
      error: null,
    };
  } catch (error) {
    console.error("CalendarStatusAction error:", error);
    return {
      success: false,
      connected: false,
      error: "Something went wrong. Action CalenderStatus not worked",
    };
  }
}
