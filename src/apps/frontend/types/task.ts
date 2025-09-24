import { JsonObject } from 'frontend/types/common-types';

export class Task {
  id: string;
  accountId: string;
  title: string;
  description: string;

  constructor(json: JsonObject) {
    this.id = json.id as string;
    this.accountId = json.account_id as string;
    this.title = json.title as string;
    this.description = json.description as string;
  }

  toJson(): JsonObject {
    return {
      id: this.id,
      account_id: this.accountId,
      title: this.title,
      description: this.description,
    };
  }
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface PaginatedTasksResponse {
  items: Task[];
  pagination_params: {
    page: number;
    size: number;
    offset: number;
  };
  total_count: number;
  total_pages: number;
}
