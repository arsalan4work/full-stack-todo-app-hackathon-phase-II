'use client';

import React from 'react';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const handleToggleComplete = () => {
    onToggleComplete(task.id);
  };

  const handleDelete = () => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (confirmed) {
      onDelete(task.id);
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };

  return (
    <div className={`border rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
      task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium truncate ${
            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-1 text-sm truncate ${
              task.completed ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {task.description}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(task.created_at).toLocaleDateString()}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;