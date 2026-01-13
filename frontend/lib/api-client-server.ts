import { Task, CreateTaskInput, UpdateTaskInput } from './types';

const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://full-stack-todo-app-hackathon-phase-ii.onrender.com';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ServerApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string  // Optional token for authentication
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token is provided
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // For server-side, we might need to handle this differently
      throw new Error('Unauthorized: Session may have expired');
    }

    if (response.status === 403) {
      throw new Error('Forbidden: You do not have permission to access this resource');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // For DELETE requests, we don't expect a response body
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    // Transform response to match frontend expectations if needed
    if (endpoint.includes('/tasks')) {
      if (Array.isArray(data)) {
        // Handle array of tasks
        return data.map(this.transformTaskResponse) as unknown as T;
      } else if (data && typeof data === 'object' && data.hasOwnProperty('id')) {
        // Handle single task
        return this.transformTaskResponse(data) as unknown as T;
      }
    }

    return data;
  }

  private transformTaskResponse(task: any): Task {
    // Map backend field names to frontend field names
    return {
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      created_at: task.created_at,
    };
  }

  async getTasks(userId: string | number, status?: string, token?: string): Promise<Task[]> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    let url = `/api/users/${numericUserId}/tasks`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.request<Task[]>(url, {}, token);
  }

  async createTask(userId: string | number, data: CreateTaskInput, token?: string): Promise<Task> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.request<Task>(`/api/users/${numericUserId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getTask(userId: string | number, taskId: number, token?: string): Promise<Task> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.request<Task>(`/api/users/${numericUserId}/tasks/${taskId}`, {
      method: 'GET',
    }, token);
  }

  async updateTask(userId: string | number, taskId: number, data: UpdateTaskInput, token?: string): Promise<Task> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.request<Task>(`/api/users/${numericUserId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteTask(userId: string | number, taskId: number, token?: string): Promise<void> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    await this.request(`/api/users/${numericUserId}/tasks/${taskId}`, {
      method: 'DELETE',
    }, token);
  }

  async toggleComplete(userId: string | number, taskId: number, token?: string): Promise<Task> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.request<Task>(`/api/users/${numericUserId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    }, token);
  }
}

export const serverApiClient = new ServerApiClient();

// Export individual functions for convenience
export const getTasks = (userId: string | number, status?: string, token?: string) => serverApiClient.getTasks(userId, status, token);
export const createTask = (userId: string | number, data: CreateTaskInput, token?: string) => serverApiClient.createTask(userId, data, token);
export const getTask = (userId: string | number, taskId: number, token?: string) => serverApiClient.getTask(userId, taskId, token);
export const updateTask = (userId: string | number, taskId: number, data: UpdateTaskInput, token?: string) => serverApiClient.updateTask(userId, taskId, data, token);
export const deleteTask = (userId: string | number, taskId: number, token?: string) => serverApiClient.deleteTask(userId, taskId, token);
export const toggleComplete = (userId: string | number, taskId: number, token?: string) => serverApiClient.toggleComplete(userId, taskId, token);