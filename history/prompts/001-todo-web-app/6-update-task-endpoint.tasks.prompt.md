---
id: 6
title: Update Task Endpoint
stage: tasks
date: 2026-01-06
surface: agent
model: Claude Sonnet 4.5
feature: 001-todo-web-app
branch: 001-todo-web-app
user: Claude Code
command: sp.implement
labels: ["api", "tasks", "endpoint", "authentication", "ownership"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/schemas/task.py
  - backend/routes/tasks.py
  - specs/001-todo-web-app/tasks.md
tests: []
---

# Update Task Endpoint Implementation

## Summary
Implemented the PUT /api/users/{user_id}/tasks/{task_id} endpoint with ownership verification as requested. The endpoint updates a single task for authenticated users with proper authorization checks.

## Changes Made

### 1. Enhanced Task Schemas (`backend/schemas/task.py`)
- Added `TaskUpdate` schema with optional title and description fields
- Added proper validation constraints (title length: 1-200 characters, description max length: 1000)
- Made all fields optional to allow partial updates

### 2. Enhanced Task Routes (`backend/routes/tasks.py`)
- Added PUT endpoint at `/api/users/{user_id}/tasks/{task_id}`
- Added import for TaskUpdate schema
- Added authentication using `get_current_user_id` dependency
- Added validation to ensure user_id in URL matches authenticated user
- Implemented ownership verification to ensure task belongs to authenticated user
- Updates only provided fields (partial updates)
- Updates the `updated_at` timestamp automatically
- Returns 404 if task is not found
- Returns 403 if task belongs to a different user
- Returns 400 if title validation fails
- Returns complete updated task details
- Properly handles database session management

### 3. Updated Tasks File
- Marked relevant task as completed in specs/001-todo-web-app/tasks.md:
  - T031: Implement update task API endpoint [X]

## Validation
- Endpoint can be imported without errors
- TaskUpdate schema works correctly
- Authentication dependency works correctly
- User ID validation works (401 when mismatch)
- Task ownership verification works (403 when unauthorized)
- Returns 404 when task not found
- Returns 400 when title validation fails
- Only updates provided fields (partial updates)
- Updates `updated_at` timestamp correctly
- Database integration works properly

## Acceptance Criteria Met
- ✅ Requires JWT token
- ✅ Returns 404 if task not found
- ✅ Returns 403 if task belongs to different user
- ✅ Updates only provided fields
- ✅ Returns updated task with new updated_at
- ✅ Validates title length if provided

## Next Steps
- Continue with remaining tasks in the task list
- Implement delete task endpoint
- Add frontend components for task management