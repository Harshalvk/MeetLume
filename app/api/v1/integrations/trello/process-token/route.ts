import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userSession = await GetUserSession();
  const { token } = await req.json();

  if (!userSession || !token) {
    return NextResponse.json(
      { error: "Missing user id to token" },
      { status: 400 }
    );
  }

  try {
    await prisma.userIntegration.upsert({
      where: {
        userId_platform: {
          userId: userSession.id,
          platform: "trello",
        },
      },
      update: {
        accessToken: token,
        updatedAt: new Date(),
      },
      create: {
        userId: userSession.id,
        platform: "trello",
        accessToken: token,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving trello integration: ", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
