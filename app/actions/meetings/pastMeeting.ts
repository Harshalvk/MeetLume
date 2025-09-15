"use server";

import { prisma } from "@/lib/prisma";
import GetUserSession from "../user/getUserSession";

export async function PastMeetingsAction() {
  try {
    const userSession = await GetUserSession();

    if (!userSession || !userSession.id) {
      return {
        success: false,
        meetings: [],
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
        meetings: [],
        error: "User not found",
      };
    }

    const pastMeetings = await prisma.meeting.findMany({
      where: {
        userId: user.id,
        meetingEnded: true,
      },
      orderBy: {
        endTime: "desc",
      },
      take: 10,
    });

    return { success: true, meetings: pastMeetings, error: null };
  } catch (error) {
    console.error("PastMeetingAction error: ", error);
    return {
      success: false,
      meetings: [],
      error: "Failed to execute PastMeetings server action",
    };
  }
}
