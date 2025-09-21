import GetUserSession from "@/app/actions/user/getUserSession";
import { NextResponse } from "next/server";

export async function GET() {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  const clientId = process.env.ASANA_CLIENT_ID;

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/asana/callback`;

  const scope =
    "projects:read projects:write tasks:read tasks:write users:read workspaces:read";

  const state = userSession.id;

  const authUrl = `https://app.asana.com/-/oauth_authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(authUrl);
}
