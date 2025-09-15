"use server";

import { prisma } from "@/lib/prisma";
import GetUserSession from "../user/getUserSession";

export async function UpcomingMeetingsAction() {
  try {
    const userSession = await GetUserSession();

    if (!userSession || !userSession.id) {
      return {
        success: false,
        events: [],
        connected: false,
        source: null,
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
        events: [],
        connected: false,
        source: null,
        error: "User not found",
      };
    }

    const now = new Date();

    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        userId: user.id,
        startTime: { gte: now },
        isFromCalendar: true,
      },
      orderBy: {
        startTime: "asc",
      },
      take: 10,
    });

    const events = upcomingMeetings.map((meeting) => ({
      id: meeting.calendarEventId || meeting.id,
      summary: meeting.title,
      start: {
        dateTime: meeting.startTime.toISOString(),
      },
      end: {
        dateTime: meeting.endTime.toISOString(),
      },
      attendees: meeting.attendees
        ? JSON.parse(meeting.attendees as string)
        : [],
      hangoutLink: meeting.meetingUrl,
      conferenceData: meeting.meetingUrl
        ? { entryPoints: [{ url: meeting.meetingUrl }] }
        : null,
      botScheduled: meeting.botScheduled,
      meetingId: meeting.id,
    }));

    return {
      success: true,
      events,
      connected: user.calendarConnected,
      source: "database",
      error: null,
    };
  } catch (error) {
    console.log("Error fetching meetings: ", error);
    return {
      success: false,
      events: [],
      connected: false,
      source: null,
      error:
        "Failed to fetch meetings. UpcomingMeetings server action did'nt work",
    };
  }
}
