import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.userIntegration.delete({
      where: {
        userId_platform: {
          userId: userSession.id,
          platform: "trello",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting trello: ", error);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}
