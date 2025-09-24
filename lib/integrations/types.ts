export interface IIntegrationConfig {
  platform: "trello" | "jira" | "asana";
  connected: boolean;
  boardName?: string;
  projectName?: string;
}

export interface IActionItemData {
  title: string;
  description: string;
  dueDate?: string;
  assignee?: string;
}

export interface JiraProjectsResponse {
  isLast: boolean;
  maxResults: number;
  nextPage?: string;
  self: string;
  startAt: number;
  total: number;
  values: JiraProject[];
}

export interface JiraProject {
  avatarUrls: AvatarUrls;
  id: string;
  insight: ProjectInsight;
  key: string;
  name: string;
  projectCategory: ProjectCategory;
  self: string;
  simplified: boolean;
  style: string;
}

export interface AvatarUrls {
  "16x16": string;
  "24x24": string;
  "32x32": string;
  "48x48": string;
}

export interface ProjectInsight {
  lastIssueUpdateTime: string; // ISO timestamp
  totalIssueCount: number;
}

export interface ProjectCategory {
  description: string;
  id: string;
  name: string;
  self: string;
}
