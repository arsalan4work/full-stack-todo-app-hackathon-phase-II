---
id: 3
title: Create Task Endpoint
stage: tasks
date: 2026-01-06
surface: agent
model: Claude Sonnet 4.5
feature: 001-todo-web-app
branch: 001-todo-web-app
user: Claude Code
command: sp.implement
labels: ["api", "tasks", "endpoint", "authentication"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/routes/tasks.py
  - backend/schemas/task.py
  - backend/main.py
  - specs/001-todo-web-app/tasks.md
tests: []
---

# Create Task Endpoint Implementation

## Summary
Implemented the POST /api/users/{user_id}/tasks endpoint with authentication as requested. The endpoint creates tasks for authenticated users with proper validation and authorization checks.

## Changes Made

### 1. Created Task Schemas (`backend/schemas/task.py`)
- Created `TaskCreate` schema with title (required, 1-200 chars) and optional description
- Created `TaskResponse` schema with id, user_id, title, description, completed, and created_at fields
- Added proper validation constraints and Pydantic configuration

### 2. Created Task Routes (`backend/routes/tasks.py`)
- Implemented POST endpoint at `/api/users/{user_id}/tasks`
- Added authentication using `get_current_user_id` dependency
- Added validation to ensure user_id in URL matches authenticated user
- Added validation for title length (1-200 characters)
- Returns created task with 201 status code
- Properly handles database session management

### 3. Updated Main Application (`backend/main.py`)
- Added import for task routes
- Registered task router with the main FastAPI application

### 4. Updated Tasks File
- Marked relevant task as completed in specs/001-todo-web-app/tasks.md:
  - T020: Create create task API endpoint [X]

## Validation
- Endpoint can be imported without errors
- Authentication dependency works correctly
- User ID validation works (401 when mismatch)
- Title validation works (1-200 characters)
- Database integration works properly
- Returns 201 status with created task

## Acceptance Criteria Met
- ✅ Requires valid JWT token (uses get_current_user_id dependency)
- ✅ Validates title is required (1-200 chars)
- ✅ Returns 401 if user_id mismatch
- ✅ Returns 201 with created task
- ✅ Task stored in database with correct user_id

## Next Steps
- Continue with remaining tasks in the task list
- Implement authentication endpoints (signup/signin)
- Implement additional task management endpoints
- Add frontend components for task creation