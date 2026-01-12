export interface Task {
  id: number;
  user_id: number;  // Changed from userId to user_id to match backend
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;  // Changed from createdAt to match backend
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}