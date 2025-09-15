import GetUserSession from "@/app/actions/user/getUserSession";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userSession = await GetUserSession();

    if (!userSession || !userSession.id) {
      return NextResponse.redirect("/login");
    }

    const state = Buffer.from(
      JSON.stringify({ userId: userSession.id })
    ).toString("base64");

    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
    googleAuthUrl.searchParams.set(
      "client_id",
      process.env.GOOGLE_REDIRECT_URI!
    );
    googleAuthUrl.searchParams.set(
      "scope",
      "https://www.googleapis.com/auth/calendar.readonly"
    );
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");
    googleAuthUrl.searchParams.set("state", state);

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error("Direct OAuth error: ", error);
    return NextResponse.json(
      { error: "Failed to setup OAuth" },
      { status: 500 }
    );
  }
}
