import GetUserSession from "@/app/actions/user/getUserSession";
import { IActionItem } from "@/hooks/useActionItems";
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

    const { text }: { text: string } = await req.json();
    const { meetingId } = await params;
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        userId: userSession.id,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const existingItems =
      (meeting.actionItems as unknown as IActionItem[]) || [];
    const nextId =
      existingItems.length > 0
        ? Math.max(...existingItems.map((item) => item.id || 0)) + 1
        : null;

    const newActionItem = {
      id: nextId,
      text,
    };

    const updateActionItem = [...existingItems, newActionItem];

    await prisma.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        actionItems: updateActionItem,
      },
    });

    return NextResponse.json(newActionItem);
  } catch (error) {
    console.error("Error adding action item", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
