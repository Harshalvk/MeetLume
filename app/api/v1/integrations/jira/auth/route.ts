import GetUserSession from "@/app/actions/user/getUserSession";
import { NextResponse } from "next/server";

export async function GET() {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.JIRA_CLIENT_ID;

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/jira/callback`;

  const scope =
    "read:jira-work write:jira-work manage:jira-project manage:jira-configuration read:jira-user offline_access";

  const state = userSession.id;

  const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}&response_type=code&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
