import GetUserSession from "@/app/actions/user/getUserSession";
import { IActionItem } from "@/hooks/useActionItems";
import { prisma } from "@/lib/prisma";
import { InputJsonObject } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  // _ for unused req object
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ itemId: string; meetingId: string }>;
  }
) {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userSession.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { itemId, meetingId } = await params;
    const itemIdNumber = parseInt(itemId);

    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        userId: userSession.id,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const actionItems = (meeting.actionItems as unknown as IActionItem[]) || [];
    const updatedActionItems = actionItems.filter(
      (item) => item.id !== itemIdNumber
    );

    await prisma.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        actionItems: updatedActionItems as unknown as InputJsonObject,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting action item: ", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
