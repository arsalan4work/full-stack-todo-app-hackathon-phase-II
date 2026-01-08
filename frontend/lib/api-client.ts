import { Task, CreateTaskInput, UpdateTaskInput } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

    return response.json();
  }

  private getToken(): string | null {
    // Attempt to get the token from Better Auth session
    // For now, we'll try to get it from localStorage as a fallback
    if (typeof window !== 'undefined') {
      // Try to get token from Better Auth's storage
      const session = localStorage.getItem('better-auth.session');
      if (session) {
        try {
          const sessionObj = JSON.parse(session);
          return sessionObj.token || sessionObj.accessToken || null;
        } catch (e) {
          console.warn('Could not parse session from localStorage');
          return null;
        }
      }

      // Fallback to legacy auth-token
      return localStorage.getItem('auth-token');
    }
    return null;
  }

  async getTasks(userId: string, status?: string): Promise<Task[]> {
    let url = `/users/${userId}/tasks`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.request<Task[]>(url);
  }

  async createTask(userId: string, data: CreateTaskInput): Promise<Task> {
    return this.request<Task>(`/users/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTask(userId: string, taskId: number): Promise<Task> {
    return this.request<Task>(`/users/${userId}/tasks/${taskId}`, {
      method: 'GET',
    });
  }

  async updateTask(userId: string, taskId: number, data: UpdateTaskInput): Promise<Task> {
    return this.request<Task>(`/users/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(userId: string, taskId: number): Promise<void> {
    await this.request(`/users/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async toggleComplete(userId: string, taskId: number): Promise<Task> {
    return this.request<Task>(`/users/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();

// Export individual functions for convenience
export const getTasks = (userId: string, status?: string) => apiClient.getTasks(userId, status);
export const createTask = (userId: string, data: CreateTaskInput) => apiClient.createTask(userId, data);
export const getTask = (userId: string, taskId: number) => apiClient.getTask(userId, taskId);
export const updateTask = (userId: string, taskId: number, data: UpdateTaskInput) => apiClient.updateTask(userId, taskId, data);
export const deleteTask = (userId: string, taskId: number) => apiClient.deleteTask(userId, taskId);
export const toggleComplete = (userId: string, taskId: number) => apiClient.toggleComplete(userId, taskId);