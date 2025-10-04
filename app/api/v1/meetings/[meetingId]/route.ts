import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ meetingId: string }>;
  }
) {
  try {
    const userSession = await GetUserSession();

    const { meetingId } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const responseData = {
      ...meeting,
      isOwner: userSession.id === meeting.user?.id,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meetingId } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
      include: {
        user: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.user?.id !== userSession.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this meeting" },
        { status: 403 }
      );
    }

    await prisma.meeting.delete({
      where: {
        id: meetingId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete meeting", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
