import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

export async function GET() {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "Unautorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userSession.id,
      },
    });

    if (!user?.slackTeamId) {
      return NextResponse.json(
        { error: "Slack not connected" },
        { status: 400 }
      );
    }

    const installation = await prisma.slackInstallation.findUnique({
      where: {
        teamId: user.slackTeamId,
      },
    });

    if (!installation) {
      return NextResponse.json(
        { error: "Slack installation not found" },
        { status: 400 }
      );
    }

    const slack = new WebClient(installation.botToken);

    const channels = await slack.conversations.list({
      types: "public_channel",
      limit: 50,
    });

    return NextResponse.json({
      channels:
        channels.channels?.map((channel) => ({
          id: channel.id,
          name: channel.name,
        })) || [],
    });
  } catch (error) {
    console.error("Slack setup error:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      channelId,
      channelName,
    }: {
      channelId: string;
      channelName: string;
    } = await req.json();

    await prisma.user.updateMany({
      where: {
        id: userSession.id,
      },
      data: {
        peferredChannelId: channelId,
        preferredChannelName: channelName,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack setup save error: ", error);
    return NextResponse.json(
      { error: "Failed to save setup" },
      { status: 500 }
    );
  }
}
