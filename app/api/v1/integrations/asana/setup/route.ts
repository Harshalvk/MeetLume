import GetUserSession from "@/app/actions/user/getUserSession";
import { AsanaAPI } from "@/lib/integrations/asana/asana";
import { refreshAsanaToken } from "@/lib/integrations/asana/refreshToken";
import { prisma } from "@/lib/prisma";
import { UserIntegration } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

async function getValidToken(integration: UserIntegration) {
  if (integration.expiresAt && new Date() > integration.expiresAt) {
    const update = await refreshAsanaToken(integration);
    return update.accessToken;
  }

  return integration.accessToken;
}

export async function GET() {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthrozied" }, { status: 401 });
  }

  const integration = await prisma.userIntegration.findUnique({
    where: {
      userId_platform: {
        userId: userSession.id,
        platform: "asana",
      },
    },
  });

  if (!integration) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    const validToken = await getValidToken(integration);

    const asana = new AsanaAPI();
    const workspaces = await asana.getWorkspaces(validToken);
    const workspaceId = workspaces.data[0]?.gid;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 400 }
      );
    }

    const projects = await asana.getProjects(validToken, workspaceId);

    return NextResponse.json({
      projects: projects.data || [],
      workspaceId,
    });
  } catch (error) {
    console.error("Error fetching asana projects: ", error);
    return NextResponse.json(
      { error: "Failed to fetch asana projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const userSession = await GetUserSession();

  const { projectId, projectName, workspaceId, createNew } = await req.json();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.userIntegration.findUnique({
    where: {
      userId_platform: {
        userId: userSession.id,
        platform: "asana",
      },
    },
  });

  if (!integration) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    const validToken = await getValidToken(integration);

    const asana = new AsanaAPI();
    let finalProjectId = projectId;
    let finalProjectName = projectName;

    if (createNew && projectName) {
      const newProject = await asana.createProject(
        validToken,
        workspaceId,
        projectName
      );
      finalProjectId = newProject.data.gid;
      finalProjectName = newProject.data.name;
    }

    await prisma.userIntegration.update({
      where: {
        id: integration.id,
      },
      data: {
        projectId: finalProjectId,
        projectName: finalProjectName,
        workspaceId: workspaceId,
      },
    });

    return NextResponse.json({
      success: true,
      projectId: finalProjectId,
      projectName: finalProjectName,
    });
  } catch (error) {
    console.error("Error setting up asana project: ", error);
    return NextResponse.json(
      { error: "Failed to setup project" },
      { status: 500 }
    );
  }
}
