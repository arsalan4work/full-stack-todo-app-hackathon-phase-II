'use client';

import React, { useState, useRef } from 'react';
import { useFormState } from 'react-dom';
import { createTaskAction } from '@/actions/task-actions';

interface CreateTaskFormProps {
  userId: string;
}

const initialState = {
  message: '',
  error: '',
  success: false,
};

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ userId }) => {
  const [state, formAction] = useFormState(createTaskAction, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    // Add userId to the form data
    formData.append('userId', userId);

    // Call the server action
    await formAction(formData);

    // Reset form after successful submission
    if (state.success && formRef.current) {
      formRef.current.reset();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Task</h2>

      <form
        ref={formRef}
        action={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            minLength={1}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task title..."
            aria-invalid={!!state.error}
            aria-describedby={state.error ? "title-error" : undefined}
          />
          <div className="h-1 mt-1">
            {state.error && (
              <p className="text-sm text-red-600" id="title-error">
                {state.error}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task description (optional)..."
          ></textarea>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>

          {state.success && !state.error && state.message && (
            <div className="text-sm text-green-600">{state.message}</div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTaskForm;