import GetUserSession from "@/app/actions/user/getUserSession";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userSession = await GetUserSession();

  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!userSession.id || !code || state !== userSession.id) {
    return NextResponse.redirect(
      new URL(
        "/integrations?error=auth_failed",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }

  try {
    const tokenResponse = await fetch(
      "https://auth.atlassian.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: process.env.JIRA_CLIENT_ID!,
          client_secret: process.env.JIRA_CLIENT_SECRET!,
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/jira/callback`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.json();
      console.error("Token exchange failed: ", errorText);
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    const resourceResponse = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
      }
    );

    if (!resourceResponse.ok) {
      throw new Error("Failed to get accessible resources");
    }

    const resources = await resourceResponse.json();
    const cloudId = resources[0]?.id;

    if (!cloudId) {
      throw new Error("No accesible jira resources found");
    }

    await prisma.userIntegration.upsert({
      where: {
        userId_platform: {
          userId: userSession.id,
          platform: "jira",
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        workspaceId: cloudId,
        updatedAt: new Date(),
      },
      create: {
        userId: userSession.id,
        platform: "jira",
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        workspaceId: cloudId,
      },
    });

    return NextResponse.redirect(
      new URL(
        "/integrations?success=jira_connected&setup=jira",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  } catch (error) {
    console.error("Error saving the jira integration: ", error);
    return NextResponse.redirect(
      new URL(
        "/integrations?error=save_failed",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
