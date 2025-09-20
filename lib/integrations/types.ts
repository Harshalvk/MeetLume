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
