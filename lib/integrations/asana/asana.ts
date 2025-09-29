import { IActionItemData } from "../types";

export class AsanaAPI {
  private baseUrl = "https://app.asana.com/api/1.0";

  async getWorkspaces(token: string) {
    const response = await fetch(`${this.baseUrl}/workspaces`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.json();
      console.error("Failed to fetch asana workspaces: ", errorText);
      throw new Error("Failed to fetch asana workspaces");
    }

    return response.json();
  }

  async getProjects(token: string, workspaceId: string) {
    const response = await fetch(
      `${this.baseUrl}/projects?workspace=${workspaceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    return response.json();
  }

  async createProject(token: string, workspaceId: string, name: string) {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          name,
          workspace: workspaceId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create project in asana workspace");
    }

    return response.json();
  }

  async createTask(token: string, projectId: string, data: IActionItemData) {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          name: data.title,
          notes: data.description || "Action item from the meeting",
          projects: [projectId],
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    return response.json();
  }
}
