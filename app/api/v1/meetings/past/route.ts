import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userSession.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json({ meetings: pastMeetings });
  } catch (error) {
    console.error("Failed to fetch past meetings: ", error);
    return NextResponse.json(
      { error: "Failed to fetch past meetings", meetings: [] },
      { status: 500 }
    );
  }
}
