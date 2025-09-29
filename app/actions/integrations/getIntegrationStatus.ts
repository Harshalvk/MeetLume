"use server";

import { prisma } from "@/lib/prisma";
import GetUserSession from "../user/getUserSession";

export async function GetIntegrationStatusAction() {
  try {
    const userSession = await GetUserSession();

    if (!userSession) {
      return {
        success: false,
        result: null,
        error: "Unauthorized",
      };
    }

    const integrations = await prisma.userIntegration.findMany({
      where: {
        userId: userSession.id,
      },
    });

    const allPlatforms = [
      {
        platform: "trello",
        name: "Trello",
        logo: "/icons/trello.svg",
        connected: false,
      },
      {
        platform: "asana",
        name: "Asana",
        logo: "/icons/asana.svg",
        connected: false,
      },
      {
        platform: "jira",
        name: "Jira",
        logo: "/icons/jira.svg",
        connected: false,
      },
    ];

    const result: {
      connected: boolean;
      boardName?: string | null | undefined;
      projectName?: string | null | undefined;
      platform: string;
      name: string;
      logo: string;
      channelName?: string;
    }[] = allPlatforms.map((platform) => {
      const integration = integrations.find(
        (i) => i.platform === platform.platform
      );

      return {
        ...platform,
        connected: !!integration,
        boardName: integration?.boardName,
        projectName: integration?.projectName,
      };
    });

    const dbUser = await prisma.user.findUnique({
      where: {
        id: userSession.id,
      },
    });

    if (dbUser?.slackConnected) {
      result.push({
        platform: "slack",
        name: "Slack",
        logo: "/icons/slack.svg",
        connected: true,
        channelName: dbUser.preferredChannelName || "Not Set",
      });
    } else {
      result.push({
        platform: "slack",
        name: "Slack",
        logo: "/icons/slack.svg",
        connected: false,
      });
    }

    return {
      success: true,
      result,
      error: null,
    };
  } catch (error) {
    console.error("GetIntegrationStatus server action error: ", error);
    return {
      success: false,
      result: null,
      error: "Failed to execute GetIntegrationStatus server action",
    };
  }
}
