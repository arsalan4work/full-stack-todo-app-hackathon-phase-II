---
id: 4
title: List Tasks Endpoint
stage: tasks
date: 2026-01-06
surface: agent
model: Claude Sonnet 4.5
feature: 001-todo-web-app
branch: 001-todo-web-app
user: Claude Code
command: sp.implement
labels: ["api", "tasks", "endpoint", "authentication", "filtering"]
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

# List Tasks Endpoint Implementation

## Summary
Implemented the GET /api/users/{user_id}/tasks endpoint with filtering capabilities as requested. The endpoint lists tasks for authenticated users with optional status filtering.

## Changes Made

### 1. Enhanced Task Routes (`backend/routes/tasks.py`)
- Added GET endpoint at `/api/users/{user_id}/tasks`
- Added optional query parameter `status` with values: "all", "pending", "completed"
- Added authentication using `get_current_user_id` dependency
- Added validation to ensure user_id in URL matches authenticated user
- Implemented filtering logic:
  - "pending" filter returns tasks where completed=false
  - "completed" filter returns tasks where completed=true
  - "all" or no filter returns all tasks for the user
- Returns list of TaskResponse objects
- Returns empty array if no tasks match the criteria
- Properly handles database session management

### 2. Updated Tasks File
- Marked relevant task as completed in specs/001-todo-web-app/tasks.md:
  - T029: Implement list tasks API endpoint [X]

## Validation
- Endpoint can be imported without errors
- Authentication dependency works correctly
- User ID validation works (401 when mismatch)
- Status filtering works correctly (pending/completed/all)
- Returns empty array when no tasks match
- Database integration works properly
- Only returns authenticated user's tasks

## Acceptance Criteria Met
- ✅ Requires JWT token
- ✅ Returns ONLY authenticated user's tasks
- ✅ Status filter works: pending (completed=false), completed (completed=true), all (no filter)
- ✅ Returns empty array if no tasks
- ✅ Returns 401 if user_id mismatch

## Next Steps
- Continue with remaining tasks in the task list
- Implement individual task endpoint (GET /api/users/{user_id}/tasks/{task_id})
- Implement update and delete task endpoints
- Add frontend components for task listing