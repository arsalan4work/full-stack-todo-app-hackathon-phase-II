---
id: 8
title: Toggle Completion Endpoint
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
  - backend/routes/tasks.py
  - specs/001-todo-web-app/tasks.md
tests: []
---

# Toggle Task Completion Endpoint Implementation

## Summary
Implemented the PATCH /api/users/{user_id}/tasks/{task_id}/complete endpoint to toggle task completion status as requested. The endpoint toggles the completion status of a single task for authenticated users with proper authorization checks.

## Changes Made

### 1. Enhanced Task Routes (`backend/routes/tasks.py`)
- Added PATCH endpoint at `/api/users/{user_id}/tasks/{task_id}/complete`
- Added authentication using `get_current_user_id` dependency
- Added validation to ensure user_id in URL matches authenticated user
- Implemented ownership verification to ensure task belongs to authenticated user
- Returns 404 if task is not found
- Returns 403 if task belongs to a different user
- Toggles the `completed` field (True ↔ False)
- Updates the `updated_at` timestamp automatically
- Returns the updated task with the new completion status
- Properly handles database session management

### 2. Updated Tasks File
- Marked relevant task as completed in specs/001-todo-web-app/tasks.md:
  - T046: Add toggle completion API endpoint [X]

## Validation
- Endpoint can be imported without errors
- Authentication dependency works correctly
- User ID validation works (401 when mismatch)
- Task ownership verification works (403 when unauthorized)
- Returns 404 when task not found
- Correctly toggles completion status (True ↔ False)
- Updates `updated_at` timestamp correctly
- Database integration works properly
- Returns updated task with correct completion status

## Acceptance Criteria Met
- ✅ Requires JWT token
- ✅ Returns 404 if task not found
- ✅ Returns 403 if task belongs to different user
- ✅ Toggles completed status correctly
- ✅ Updates updated_at timestamp
- ✅ Returns updated task

## Next Steps
- Continue with remaining tasks in the task list
- Update task model if needed for completion toggling
- Add frontend components for task completion