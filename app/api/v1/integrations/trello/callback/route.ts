import GetUserSession from "@/app/actions/user/getUserSession";
import { NextResponse } from "next/server";

export async function GET() {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.redirect(
      new URL(
        "/api/v1/integrations?error=auth_failed",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }

  return NextResponse.redirect(
    new URL(
      "/api/v1/integrations/trello/callback",
      process.env.NEXT_PUBLIC_APP_URL
    )
  );
}
