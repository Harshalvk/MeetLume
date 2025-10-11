import {
  AllMiddlewareArgs,
  Middleware,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { isDuplicateEvent } from "../utils/deduplicate";
import { prisma } from "@/lib/prisma";

export const handleMessage: Middleware<
  SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs
> = async ({ message, say, client }) => {
  try {
    if (
      message.subtype === "bot_message" ||
      !("user" in message) ||
      !("text" in message)
    )
      return;

    if (message.user && message.user.startsWith("B")) return;

    const authTest = await client.auth.test();

    if (message.user === authTest.user_id) return;

    const text = message.text || "";

    if (text.includes(`<@${authTest.user_id}>`)) return;

    const eventId = `message-${message.channel}-${message.user}`;
    const eventTs = message.ts;

    if (isDuplicateEvent(eventId, eventTs)) return;

    const slackUserId = message.user;

    if (!slackUserId) return;

    const cleanText = text.replace(/<@[^>]+>/g, "").trim();

    if (!cleanText) {
      await say(
        "Hi! I’m Lumi. Need insights or summaries from your meetings? Just ask!.\n For example:\n· What were the key decisions in yesterday's meeting?\n· Summarize yesterday's meeting action items\n· Who attended the product planning session?"
      );
    }

    const userInfo = await client.users.info({ user: slackUserId });
    const userEmail = userInfo.user?.profile?.email;

    if (!userEmail) {
      await say(
        "Sorry, I can't access your email. Please make sure your slack email is visible on your profile settings."
      );
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      await say({
        text: "Account not found",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Hi! I cannot find an account with email *${userEmail}.\n\nPleae sign up first, then you can chat with me here!`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Once you have an account, I can help you with meeting summaries, action items, and more!",
              },
            ],
          },
        ],
      });
      return;
    }

    const { team_id: teamId } = await client.auth.test();

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        slackUserId,
        slackTeamId: teamId,
        slackConnected: true,
      },
    });

    await say("Searching through your meetings...");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/rag/chat-all`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: cleanText,
          userId: user.id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`RAG API failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.answer) {
      const answer = data.answer;

      await say({
        text: "Lumi response",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Lumit*\n\n${answer}`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "⚡ Ask me about meetings, decicions, action items or participants",
              },
            ],
          },
        ],
      });
    } else {
      await say("Sorry, I encountred an error searching through your meetings");
    }
  } catch (error) {
    console.error("App mention handler error: ", error);
    await say("Sorry, something went wrong. Please try again!");
  }
};
