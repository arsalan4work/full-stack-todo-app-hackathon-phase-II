---
id: 7
title: Delete Task Endpoint
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

# Delete Task Endpoint Implementation

## Summary
Implemented the DELETE /api/users/{user_id}/tasks/{task_id} endpoint with ownership verification as requested. The endpoint deletes a single task for authenticated users with proper authorization checks.

## Changes Made

### 1. Enhanced Task Routes (`backend/routes/tasks.py`)
- Added DELETE endpoint at `/api/users/{user_id}/tasks/{task_id}`
- Added authentication using `get_current_user_id` dependency
- Added validation to ensure user_id in URL matches authenticated user
- Implemented ownership verification to ensure task belongs to authenticated user
- Returns 404 if task is not found
- Returns 403 if task belongs to a different user
- Deletes task from database using session.delete()
- Returns 204 No Content on successful deletion
- Properly handles database session management

### 2. Updated Tasks File
- Marked relevant task as completed in specs/001-todo-web-app/tasks.md:
  - T032: Implement delete task API endpoint [X]

## Validation
- Endpoint can be imported without errors
- Authentication dependency works correctly
- User ID validation works (401 when mismatch)
- Task ownership verification works (403 when unauthorized)
- Returns 404 when task not found
- Returns 204 on successful deletion
- Database integration works properly
- Task is properly deleted from database

## Acceptance Criteria Met
- ✅ Requires JWT token
- ✅ Returns 404 if task not found
- ✅ Returns 403 if task belongs to different user
- ✅ Deletes task from database
- ✅ Returns 204 (no content) on success

## Next Steps
- Continue with remaining tasks in the task list
- Implement toggle completion endpoint
- Add frontend components for task management