import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userSession.id },
      select: {
        botName: true,
        botImageUrl: true,
        currentPlan: true,
      },
    });

    return NextResponse.json({
      botName: dbUser?.botName || "Lumi",
      botImageUrl: dbUser?.botImageUrl || null,
      plan: dbUser?.currentPlan || "free",
    });
  } catch (error) {
    console.error("error fetching bot settings: ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { botName, botImageUrl } = await req.json();

    await prisma.user.update({
      where: {
        id: userSession.id,
      },
      data: {
        botName: botName || "Lumi",
        botImageUrl: botImageUrl,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("error saving bot settings: ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
