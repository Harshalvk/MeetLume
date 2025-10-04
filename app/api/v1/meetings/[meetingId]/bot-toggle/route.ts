import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { meetingId } = await params;
    const { botScheduled } = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userSession.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const meeting = await prisma.meeting.update({
      where: {
        id: meetingId,
        userId: user.id,
      },
      data: {
        botScheduled,
      },
    });

    return NextResponse.json({
      success: true,
      botScheduled: meeting.botScheduled,
      message: `Bot ${botScheduled ? "enabled" : "disabled"} for meeting`,
    });
  } catch (error) {
    console.error("Bot toggle error: ", error);
    return NextResponse.json(
      {
        error: "Failed to update bot status",
      },
      { status: 500 }
    );
  }
}
