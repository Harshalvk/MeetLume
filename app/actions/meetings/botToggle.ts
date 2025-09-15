"use server";

import { prisma } from "@/lib/prisma";
import GetUserSession from "../user/getUserSession";

export async function BotToggleAction({
  meetingId,
  botScheduled,
}: {
  meetingId: string;
  botScheduled: boolean;
}) {
  try {
    const userSession = await GetUserSession();

    if (!userSession || !userSession.id) {
      return {
        success: false,
        botScheduled: null,
        message: null,
        error: "User session not found",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userSession.id,
      },
    });

    if (!user) {
      return {
        success: false,
        botScheduled: null,
        message: null,
        error: "User not found",
      };
    }

    const meeting = await prisma.meeting.update({
      where: {
        id: meetingId,
        userId: user.id,
      },
      data: {
        botScheduled: botScheduled,
      },
    });

    return {
      success: true,
      botScheduled: meeting.botScheduled,
      message: `Bot ${botScheduled ? "enable" : "disable"} for meeting`,
      error: null,
    };
  } catch (error) {
    console.error("Bot toggle error: ", error);
    return {
      success: false,
      botScheduled: null,
      message: null,
      error: "Failed to update bot status",
    };
  }
}
