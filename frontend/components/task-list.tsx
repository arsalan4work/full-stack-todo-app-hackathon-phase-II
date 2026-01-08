'use client';

import React, { useState } from 'react';
import { deleteTaskAction, toggleCompleteAction } from '@/actions/task-actions';
import TaskCard from './task-card';
import EditTaskModal from './edit-task-modal';
import { Task } from '@/lib/types';

interface TaskListProps {
  userId: string;
  initialTasks?: Task[];
  initialFilter?: string;
}

// This would typically be a server component that fetches tasks
// For now, we'll implement it as a client component with mock data
// In a real implementation, this would fetch from the API server-side
const TaskList: React.FC<TaskListProps> = ({ userId, initialTasks = [], initialFilter = 'all' }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true; // 'all' filter
  });

  const handleToggleComplete = async (id: number) => {
    setIsLoading(true);

    // Optimistic update: immediately toggle the UI
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));

    try {
      // Call the server action to toggle the task completion
      const result = await toggleCompleteAction(userId, id);

      if (!result.success) {
        console.error('Error toggling task completion:', result.error);
        // Revert the optimistic update on error
        setTasks(prev => prev.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ));
        // Optionally show an error message to the user
        alert(result.error || 'Failed to toggle task completion');
      }
      // Note: The server action will revalidate the path, so the UI will update automatically if needed
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Revert the optimistic update on error
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
      // Optionally show an error message to the user
      alert('An error occurred while toggling the task completion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      // Call the server action to delete the task
      const result = await deleteTaskAction(userId, id);

      if (!result.success) {
        console.error('Error deleting task:', result.error);
        // Optionally show an error message to the user
        alert(result.error || 'Failed to delete task');
      }
      // Note: The server action will revalidate the path, so the UI will update automatically
    } catch (error) {
      console.error('Error deleting task:', error);
      // Optionally show an error message to the user
      alert('An error occurred while deleting the task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No tasks found</div>
          <p className="text-gray-400 mt-2">
            {filter === 'completed'
              ? "You haven't completed any tasks yet."
              : filter === 'pending'
              ? "You have no pending tasks. Great job!"
              : "You don't have any tasks yet. Create your first task!"}
          </p>
        </div>
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={handleCloseModal}
          userId={userId}
        />
      )}
    </div>
  );
};

export default TaskList;