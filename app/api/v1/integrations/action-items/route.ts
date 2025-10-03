import GetUserSession from "@/app/actions/user/getUserSession";
import { IActionItem } from "@/hooks/useActionItems";
import { JiraAPI } from "@/lib/integrations/jira/jira";
import { refreshTokenIfNeeded } from "@/lib/integrations/refreshTokenIfNeeded";
import { TrelloAPI } from "@/lib/integrations/trello/trello";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userSession = await GetUserSession();

  const {
    platform,
    actionItem,
    meetingId,
  }: {
    platform: string;
    actionItem: IActionItem;
    meetingId: string;
  } = await req.json();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let integration = await prisma.userIntegration.findUnique({
    where: {
      userId_platform: {
        userId: userSession.id,
        platform,
      },
    },
  });

  if (!integration) {
    return NextResponse.json(
      { error: "Integration not found" },
      { status: 400 }
    );
  }

  if (platform === "jira" || platform === "asana") {
    try {
      integration = await refreshTokenIfNeeded(integration);
    } catch (error) {
      console.error(`Token refresh failed for ${platform}: `, error);
      return NextResponse.json(
        { error: `Please reconnect your ${platform} integration` },
        { status: 402 }
      );
    }
  }

  try {
    if (platform === "trello") {
      if (!integration.boardId) {
        return NextResponse.json(
          { error: "Board not configured" },
          { status: 400 }
        );
      }

      const trello = new TrelloAPI();

      const lists = await trello.getBoardLists(
        integration.accessToken,
        integration.boardId
      );

      const todoList =
        lists.find(
          (list) =>
            list.name.toLowerCase().includes("to do") ||
            list.name.toLowerCase().includes("todo")
        ) || lists[0];

      if (!todoList) {
        return NextResponse.json(
          { error: "No suitable list found" },
          { status: 400 }
        );
      }

      await trello.createCard(integration.accessToken, todoList.id, {
        title: actionItem.text,
        description: `Action item from meeting ${meetingId || "Unknown"}`,
      });
    } else if (platform === "jira") {
      if (!integration.projectId || !integration.workspaceId) {
        return NextResponse.json(
          { error: "Jira project not configured" },
          { status: 400 }
        );
      }

      const jira = new JiraAPI();

      const title = actionItem.text || "Untitled action item";
      const description = `Action item from meeting ${meetingId || "Unknown"}`;

      await jira.createIssue(
        integration.accessToken,
        integration.workspaceId,
        integration.projectId,
        {
          title,
          description,
        }
      );
    } else if (platform === "asana") {
      if (!integration.projectId) {
        return NextResponse.json(
          { error: "Slack channel not configured" },
          { status: 400 }
        );
      }

      const slackResponse = await fetch(
        "https://slack.com/api/chat.postMessage",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${integration.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: integration.boardId,
            text: `📝 *Action Item from Meeting ${meetingId || "Unknown"}*\n${actionItem}`,
          }),
        }
      );

      const slackResult = await slackResponse.json();

      if (!slackResponse.ok) {
        throw new Error(`Slack API error: ${slackResult.error}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error creating action item in ${platform}: `, error);
    return NextResponse.json(
      { error: `Failed to create action item in ${platform}` },
      { status: 500 }
    );
  }
}
