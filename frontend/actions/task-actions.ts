'use server';

import { revalidatePath } from 'next/cache';
import { createTask, updateTask, deleteTask, toggleComplete } from '@/lib/api-client-server';
import { CreateTaskInput, UpdateTaskInput } from '@/lib/types';

async function getAuthToken(): Promise<string | null> {
  // In a real implementation, this would get the JWT token from the session
  // For now, we'll return null and assume the token is handled elsewhere
  // Better Auth should provide a server-side method to get the session token
  return null;
}

export async function createTaskAction(userId: string, formData: FormData) {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Validate title
    if (!title || title.trim().length === 0) {
      return {
        success: false,
        error: 'Title is required',
      };
    }

    if (title.length > 200) {
      return {
        success: false,
        error: 'Title must be 200 characters or less',
      };
    }

    // Prepare task data
    const taskData: CreateTaskInput = {
      title: title.trim(),
      description: description?.trim() || undefined,
    };

    // Call API to create task
    const newTask = await createTask(userId, taskData, token);

    // Revalidate the path to update the UI
    revalidatePath('/dashboard');

    return {
      success: true,
      task: newTask,
      message: 'Task created successfully!',
    };
  } catch (error) {
    console.error('Error creating task:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

export async function updateTaskAction(userId: string, formData: FormData) {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Extract form data
    const taskId = Number(formData.get('taskId'));
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Validate task ID
    if (!taskId || isNaN(taskId)) {
      return {
        success: false,
        error: 'Invalid task ID',
      };
    }

    // Validate title
    if (!title || title.trim().length === 0) {
      return {
        success: false,
        error: 'Title is required',
      };
    }

    if (title.length > 200) {
      return {
        success: false,
        error: 'Title must be 200 characters or less',
      };
    }

    // Prepare task data
    const taskData: UpdateTaskInput = {
      title: title.trim(),
      description: description?.trim(),
    };

    // Call API to update task
    const updatedTask = await updateTask(userId, taskId, taskData, token);

    // Revalidate the path to update the UI
    revalidatePath('/dashboard');

    return {
      success: true,
      task: updatedTask,
      message: 'Task updated successfully!',
    };
  } catch (error) {
    console.error('Error updating task:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    };
  }
}

export async function deleteTaskAction(userId: string, taskId: number) {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Validate task ID
    if (!taskId || isNaN(taskId)) {
      return {
        success: false,
        error: 'Invalid task ID',
      };
    }

    // Call API to delete task
    await deleteTask(userId, taskId, token);

    // Revalidate the path to update the UI
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Task deleted successfully!',
    };
  } catch (error) {
    console.error('Error deleting task:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task',
    };
  }
}

export async function toggleCompleteAction(userId: string, taskId: number) {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Validate task ID
    if (!taskId || isNaN(taskId)) {
      return {
        success: false,
        error: 'Invalid task ID',
      };
    }

    // Call API to toggle task completion
    const updatedTask = await toggleComplete(userId, taskId, token);

    // Revalidate the path to update the UI
    revalidatePath('/dashboard');

    return {
      success: true,
      task: updatedTask,
      message: 'Task completion status updated!',
    };
  } catch (error) {
    console.error('Error toggling task completion:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle task completion',
    };
  }
}