import { IActionItemData } from "../types";

interface ITrelloGetBoardResponse {
  id: string;
  name: string;
  closed: boolean;
  pos: number;
  softLimit: string;
  idBoard: string;
  subscribed: boolean;
  limits: Record<
    string,
    Record<
      string,
      {
        status: string;
        disableAt: number;
        warnAt: number;
      }
    >
  >;
}

export class TrelloAPI {
  private apiKey = process.env.TRELLO_API_KEY!;
  private baseUrl = "https://api.trello.com/1";

  async getBoards(token: string) {
    const response = await fetch(
      `${this.baseUrl}/members/me/boards?key=${this.apiKey}&token=${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch boards");
    }

    return response.json();
  }

  async createBoard(token: string, name: string) {
    const response = await fetch(
      `${this.baseUrl}/boards/?name={name}&key=${this.apiKey}&token=${token}&name=${encodeURIComponent(name)}&defaultLists=true`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error("Failed to create boards");
    }

    return response.json();
  }

  async getBoardLists(token: string, boardId: string) {
    const response = await fetch(
      `${this.baseUrl}/boards/${boardId}/lists?key=${this.apiKey}&token=${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch lists");
    }

    return response.json() as Promise<ITrelloGetBoardResponse[]>;
  }

  async createCard(token: string, listId: string, data: IActionItemData) {
    const response = await fetch(
      `${this.baseUrl}/cards?key=${this.apiKey}&token=${token}&idList=${listId}&name=${encodeURIComponent(data.title)}&desc=${encodeURIComponent(data.description || "")}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create card");
    }

    return response.json();
  }
}
