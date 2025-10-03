import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { processTranscript } from "@/lib/rag/rag";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    meetingId,
    transcript,
    meetingTitle,
  }: { meetingId: string; transcript: string; meetingTitle: string } =
    await req.json();

  if (!meetingId || !transcript) {
    return NextResponse.json(
      { error: "Missing meetingId or transcript" },
      { status: 400 }
    );
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
      select: {
        ragProcessed: true,
        userId: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.userId !== userSession.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (meeting.ragProcessed) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    await processTranscript(
      meetingId,
      userSession.id,
      transcript,
      meetingTitle
    );

    await prisma.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        ragProcessed: true,
        ragProcessedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing transcript: ", error);
    return NextResponse.json(
      { error: "Failed to process transcript" },
      { status: 500 }
    );
  }
}
