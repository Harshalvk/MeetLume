import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await prisma.user.update({
      where: {
        id: userSession.id,
      },
      data: {
        calendarConnected: false,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Calendar disconnected successfully",
    });
  } catch (error) {
    console.error("Disconnect error: ", error);
    return NextResponse.json(
      { error: "Failed to diconnect calendar" },
      { status: 500 }
    );
  }
}
