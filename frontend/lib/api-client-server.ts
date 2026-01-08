import { Task, CreateTaskInput, UpdateTaskInput } from './types';

const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ServerApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // For server-side requests, we may need to handle authentication differently
    // This is a placeholder - in a real implementation, you'd pass the token from context
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // For DELETE requests, we don't expect a response body
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async getTasks(userId: string, status?: string): Promise<Task[]> {
    let url = `/api/users/${userId}/tasks`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.request<Task[]>(url);
  }

  async createTask(userId: string, data: CreateTaskInput): Promise<Task> {
    return this.request<Task>(`/api/users/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTask(userId: string, taskId: number): Promise<Task> {
    return this.request<Task>(`/api/users/${userId}/tasks/${taskId}`, {
      method: 'GET',
    });
  }

  async updateTask(userId: string, taskId: number, data: UpdateTaskInput): Promise<Task> {
    return this.request<Task>(`/api/users/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(userId: string, taskId: number): Promise<void> {
    await this.request(`/api/users/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async toggleComplete(userId: string, taskId: number): Promise<Task> {
    return this.request<Task>(`/api/users/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });
  }
}

export const serverApiClient = new ServerApiClient();

// Export individual functions for convenience
export const getTasks = (userId: string, status?: string) => serverApiClient.getTasks(userId, status);
export const createTask = (userId: string, data: CreateTaskInput) => serverApiClient.createTask(userId, data);
export const getTask = (userId: string, taskId: number) => serverApiClient.getTask(userId, taskId);
export const updateTask = (userId: string, taskId: number, data: UpdateTaskInput) => serverApiClient.updateTask(userId, taskId, data);
export const deleteTask = (userId: string, taskId: number) => serverApiClient.deleteTask(userId, taskId);
export const toggleComplete = (userId: string, taskId: number) => serverApiClient.toggleComplete(userId, taskId);