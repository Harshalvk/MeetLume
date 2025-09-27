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
    const tokenResponse = await fetch("https://app.asana.com/-/oauth_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.ASANA_CLIENT_ID!,
        client_secret: process.env.ASANA_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/asana/callback`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    await prisma.userIntegration.upsert({
      where: {
        userId_platform: {
          userId: userSession.id,
          platform: "asana",
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        updatedAt: new Date(),
      },
      create: {
        userId: userSession.id,
        platform: "asana",
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      },
    });

    return NextResponse.redirect(
      new URL(
        "/integrations?success=asana_connected&setup=asana",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  } catch (error) {
    console.error("Error saving asana integration: ", error);
    return NextResponse.redirect(
      new URL(
        "/integrations?error=save_failed",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
