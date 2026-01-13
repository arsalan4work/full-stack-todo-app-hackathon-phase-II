import { Task, CreateTaskInput, UpdateTaskInput } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://full-stack-todo-app-hackathon-phase-ii.onrender.com/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // We'll need to get the JWT token from wherever it's stored
    // For now, we'll assume it's available in localStorage or a cookie
    const token = this.getToken();
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Redirect to signin page
      window.location.href = '/signin';
      throw new Error('Unauthorized: Please sign in again');
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

  private getToken(): string | null {
    // Get the token from our custom auth system
    if (typeof window !== 'undefined') {
      // Get token from localStorage where our auth system stores it
      return localStorage.getItem('auth-token');
    }
    return null;
  }

  async getTasks(userId: string | number, status?: string): Promise<Task[]> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    let url = `/users/${numericUserId}/tasks`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.request<Task[]>(url);
  }

  async createTask(userId: string | number, data: CreateTaskInput): Promise<Task> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.request<Task>(`/users/${numericUserId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTask(userId: string | number, taskId: number): Promise<Task> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.request<Task>(`/users/${numericUserId}/tasks/${taskId}`, {
      method: 'GET',
    });
  }

  async updateTask(userId: string | number, taskId: number, data: UpdateTaskInput): Promise<Task> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.request<Task>(`/users/${numericUserId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(userId: string | number, taskId: number): Promise<void> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    await this.request(`/users/${numericUserId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async toggleComplete(userId: string | number, taskId: number): Promise<Task> {
    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.request<Task>(`/users/${numericUserId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();

// Export individual functions for convenience
export const getTasks = (userId: string | number, status?: string) => apiClient.getTasks(userId, status);
export const createTask = (userId: string | number, data: CreateTaskInput) => apiClient.createTask(userId, data);
export const getTask = (userId: string | number, taskId: number) => apiClient.getTask(userId, taskId);
export const updateTask = (userId: string | number, taskId: number, data: UpdateTaskInput) => apiClient.updateTask(userId, taskId, data);
export const deleteTask = (userId: string | number, taskId: number) => apiClient.deleteTask(userId, taskId);
export const toggleComplete = (userId: string | number, taskId: number) => apiClient.toggleComplete(userId, taskId);