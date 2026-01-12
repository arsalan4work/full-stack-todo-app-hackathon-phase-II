'use client';

import React, { useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import { updateTaskAction } from '@/actions/task-actions';
import { Task } from '@/lib/types';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const initialState = {
  message: '',
  error: '',
  success: false,
};

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, userId }) => {
  const [state, formAction] = useFormState(updateTaskAction, initialState);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on successful update
  useEffect(() => {
    if (state.success && state.message) {
      setTimeout(() => {
        onClose();
      }, 1000); // Close after 1 second to show success message
    }
  }, [state.success, state.message, onClose]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (formData: FormData) => {
    // Add task ID and user ID to form data
    formData.append('taskId', task.id.toString());
    formData.append('userId', userId);

    // Call the server action
    await formAction(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Task</h2>

        <form action={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={task.title}
              required
              minLength={1}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={task.description || ''}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>

          {state.error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {state.error}
            </div>
          )}

          {state.success && state.message && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              {state.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;