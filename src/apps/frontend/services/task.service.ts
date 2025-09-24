import APIService from 'frontend/services/api.service';
import { AccessToken, ApiResponse } from 'frontend/types';
import {
  Task,
  PaginatedTasksResponse,
  PaginationParams,
} from 'frontend/types/task';
import { JsonObject } from 'frontend/types/common-types';

export default class TaskService extends APIService {
  getAllTasks = async (
    userAccessToken: AccessToken,
    paginationParams?: PaginationParams,
  ): Promise<ApiResponse<PaginatedTasksResponse>> => {
    const params = new URLSearchParams();

    if (paginationParams?.page) {
      params.append('page', paginationParams.page.toString());
    }
    if (paginationParams?.size) {
      params.append('size', paginationParams.size.toString());
    }

    const queryString = params.toString();
    const url = `/accounts/${userAccessToken.accountId}/tasks${queryString ? `?${queryString}` : ''}`;

    const response = await this.apiClient.get<JsonObject>(url, {
      headers: {
        Authorization: `Bearer ${userAccessToken.token}`,
      },
    });

    const responseData = response.data?.items;

    const tasks = Array.isArray(responseData)
      ? responseData.map((taskData) => new Task(taskData as JsonObject))
      : [];

    const paginatedResponse: PaginatedTasksResponse = {
      items: tasks,
      pagination_params: response.data
        .pagination_params as PaginatedTasksResponse['pagination_params'],
      total_count: response.data.total_count as number,
      total_pages: response.data.total_pages as number,
    };

    return new ApiResponse(paginatedResponse);
  };

  getTask = async (
    userAccessToken: AccessToken,
    taskId: string,
  ): Promise<ApiResponse<Task>> => {
    const response = await this.apiClient.get<JsonObject>(
      `/accounts/${userAccessToken.accountId}/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );

    return new ApiResponse(new Task(response.data));
  };

  createTask = async (
    userAccessToken: AccessToken,
    title: string,
    description: string,
  ): Promise<ApiResponse<Task>> => {
    const response = await this.apiClient.post<JsonObject>(
      `/accounts/${userAccessToken.accountId}/tasks`,
      {
        title,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );

    return new ApiResponse(new Task(response.data));
  };

  updateTask = async (
    userAccessToken: AccessToken,
    taskId: string,
    title: string,
    description: string,
  ): Promise<ApiResponse<Task>> => {
    const response = await this.apiClient.patch<JsonObject>(
      `/accounts/${userAccessToken.accountId}/tasks/${taskId}`,
      {
        title,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );

    return new ApiResponse(new Task(response.data));
  };

  deleteTask = async (
    userAccessToken: AccessToken,
    taskId: string,
  ): Promise<ApiResponse<void>> =>
    this.apiClient.delete(
      `/accounts/${userAccessToken.accountId}/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );
}
