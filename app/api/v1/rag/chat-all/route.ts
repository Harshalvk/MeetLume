import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { chatWithAllMeetings } from "@/lib/rag/rag";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      question,
      userId: slackUserId,
    }: { question: string; userId: string } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    let targetUserId = slackUserId;

    if (!slackUserId) {
      const userSession = await GetUserSession();

      if (!userSession) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      targetUserId = userSession.id;
    } else {
      const user = await prisma.user.findUnique({
        where: {
          id: slackUserId,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      targetUserId = user.id;
    }

    const response = await chatWithAllMeetings(targetUserId, question);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chatting with meeting: ", error);
    return NextResponse.json(
      {
        error: "Failed to process question",
        answer:
          "I encountered an error while searching your meetings. Please try again later.",
      },
      { status: 500 }
    );
  }
}
