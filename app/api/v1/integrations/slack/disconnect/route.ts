import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.updateMany({
      where: {
        id: userSession.id,
      },
      data: {
        slackConnected: false,
        slackTeamId: null,
        slackUserId: null,
        peferredChannelId: null,
        preferredChannelName: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack disconnect error: ", error);
    return NextResponse.json(
      { error: "Failed to disconnect slack" },
      { status: 500 }
    );
  }
}
