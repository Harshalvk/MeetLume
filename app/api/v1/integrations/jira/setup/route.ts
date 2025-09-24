import GetUserSession from "@/app/actions/user/getUserSession";
import { JiraAPI } from "@/lib/integrations/jira/jira";
import { refreshJiraToken } from "@/lib/integrations/jira/refreshJiraToken";
import { JiraProject } from "@/lib/integrations/types";
import { prisma } from "@/lib/prisma";
import { UserIntegration } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

async function getValidToken(integration: UserIntegration) {
  if (integration.expiresAt && new Date() > integration.expiresAt) {
    const updated = await refreshJiraToken(integration);
    return updated.accessToken;
  }

  return integration.accessToken;
}

export async function GET() {
  const userSession = await GetUserSession();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.userIntegration.findUnique({
    where: {
      userId_platform: {
        userId: userSession.id,
        platform: "jira",
      },
    },
  });

  if (!integration || !integration.workspaceId) {
    return NextResponse.json({ error: "Not Connected" }, { status: 400 });
  }

  try {
    const validToken = await getValidToken(integration);
    const jira = new JiraAPI();

    const projects = await jira.getProjects(
      validToken,
      integration.workspaceId
    );

    return NextResponse.json({
      projects: projects.value || [],
    });
  } catch (error) {
    console.error("Error fetching jira projects: ", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const userSession = await GetUserSession();

  const { projectId, projectName, projectKey, createNew } = await req.json();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.userIntegration.findUnique({
    where: {
      userId_platform: {
        userId: userSession.id,
        platform: "jira",
      },
    },
  });

  if (!integration || !integration.workspaceId) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    const validToken = await getValidToken(integration);

    const jira = new JiraAPI();

    let finalProjectId: string = projectId;
    let finalProjectName: string = projectName;
    let finalProjectKey: string = projectKey;

    if (createNew && projectName) {
      try {
        const suggestedKey = projectName
          .toUpperCaes()
          .replace(/[^A-Z0-9]/g, "")
          .substring(0, 10);
        const key = projectKey || suggestedKey;
        const newProject = await jira.createProject(
          validToken,
          integration.workspaceId,
          projectName,
          key
        );
        finalProjectId = newProject.id;
        finalProjectName = projectName;
        finalProjectKey = newProject.key;
      } catch (error) {
        console.error("Failed to create project: ", error);
        return NextResponse.json(
          {
            error:
              "Faield to create jira project. You may not have admin permissions",
          },
          { status: 403 }
        );
      }
    } else if (projectId) {
      const projects = await jira.getProjects(
        validToken,
        integration.workspaceId
      );
      const selectedProject: JiraProject = projects.values.find(
        (p: JiraProject) => p.id === projectId
      );

      if (!selectedProject) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      finalProjectKey = selectedProject.key;
      finalProjectName = selectedProject.name;
    } else {
      return NextResponse.json(
        {
          error:
            "Either projectId or createNew with projectName must be provided",
        },
        { status: 400 }
      );
    }

    await prisma.userIntegration.update({
      where: {
        id: integration.id,
      },
      data: {
        projectId: finalProjectId,
        projectName: finalProjectName,
      },
    });

    return NextResponse.json({
      success: true,
      projectId: finalProjectKey,
      projectName: finalProjectName,
    });
  } catch (error) {
    console.error("Error setting up jira project: ", error);
    return NextResponse.json(
      { error: "Failed to setup project" },
      { status: 500 }
    );
  }
}
