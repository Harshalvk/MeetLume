import GetUserSession from "@/app/actions/user/getUserSession";
import { TrelloAPI } from "@/lib/integrations/trello/trello";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.userIntegration.findUnique({
    where: {
      userId_platform: {
        userId: userSession.id,
        platform: "trello",
      },
    },
  });

  if (!integration) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    const trello = new TrelloAPI();

    const boards = await trello.getBoards(integration.accessToken);

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("Error fetching trello boards: ", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const userSession = await GetUserSession();

  const { boardId, boardName, createNew } = await req.json();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.userIntegration.findUnique({
    where: {
      userId_platform: {
        userId: userSession.id,
        platform: "trello",
      },
    },
  });

  if (!integration) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    const trello = new TrelloAPI();

    let finalBoardId = boardId;
    let finalBoardName = boardName;

    if (createNew && boardName) {
      const newBoard = await trello.createBoard(
        integration.accessToken,
        boardName
      );

      finalBoardId = newBoard.id;
      finalBoardName = newBoard.name;
    }

    await prisma.userIntegration.update({
      where: {
        id: integration.id,
      },
      data: {
        boardId: finalBoardId,
        boardName: finalBoardName,
      },
    });

    return NextResponse.json({
      success: true,
      boardId: finalBoardId,
      boardName: finalBoardName,
    });
  } catch (error) {
    console.error("Error setting up trello board: ", error);
    return NextResponse.json(
      { error: "Failed to setup board" },
      { status: 500 }
    );
  }
}
