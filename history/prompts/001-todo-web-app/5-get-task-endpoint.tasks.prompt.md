---
id: 5
title: Get Task Endpoint
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

# Get Single Task Endpoint Implementation

## Summary
Implemented the GET /api/users/{user_id}/tasks/{task_id} endpoint with ownership verification as requested. The endpoint retrieves a single task for authenticated users with proper authorization checks.

## Changes Made

### 1. Enhanced Task Routes (`backend/routes/tasks.py`)
- Added GET endpoint at `/api/users/{user_id}/tasks/{task_id}`
- Added authentication using `get_current_user_id` dependency
- Added validation to ensure user_id in URL matches authenticated user
- Implemented ownership verification to ensure task belongs to authenticated user
- Returns 404 if task is not found
- Returns 403 if task belongs to a different user
- Returns complete task details with all fields
- Properly handles database session management

### 2. Updated Tasks File
- Marked relevant task as completed in specs/001-todo-web-app/tasks.md:
  - T030: Implement get task API endpoint [X]

## Validation
- Endpoint can be imported without errors
- Authentication dependency works correctly
- User ID validation works (401 when mismatch)
- Task ownership verification works (403 when unauthorized)
- Returns 404 when task not found
- Returns complete task details when authorized
- Database integration works properly

## Acceptance Criteria Met
- ✅ Requires JWT token
- ✅ Returns 404 if task not found
- ✅ Returns 403 if task belongs to different user
- ✅ Returns task with all fields

## Next Steps
- Continue with remaining tasks in the task list
- Implement update and delete task endpoints
- Add frontend components for task management