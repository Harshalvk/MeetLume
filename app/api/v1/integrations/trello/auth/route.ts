import GetUserSession from "@/app/actions/user/getUserSession";
import { NextResponse } from "next/server";

export async function GET() {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  const apiKey = process.env.TRELLO_API_KEY;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/trello/callback`;

  const authUrl = `https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=${apiKey}&return_url=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(authUrl);
}
