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
          platform: "jira",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error Disconnecting jira: ", error);
    return NextResponse.json(
      { error: "Failed to disconnect jira" },
      { status: 500 }
    );
  }
}
