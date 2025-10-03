import GetUserSession from "@/app/actions/user/getUserSession";
import { chatWithMeeting } from "@/lib/rag/rag";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    meetingId,
    question,
  }: {
    meetingId: string;
    question: string;
  } = await req.json();

  if (!meetingId || !question) {
    return NextResponse.json(
      { error: "Missing meetingId or question" },
      { status: 400 }
    );
  }

  try {
    const response = await chatWithMeeting(userSession.id, meetingId, question);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chat: ", error);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    );
  }
}
