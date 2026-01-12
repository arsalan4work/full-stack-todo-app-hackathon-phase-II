---
id: 3
title: frontend-api-client
stage: implementation
date: '2026-01-07'
model: Claude Sonnet 4.5
feature: 001-todo-web-app
branch: 001-todo-web-app
user: Claude Code
command: /sp.implement
labels:
  - api
  - client
  - typescript
  - auth
  - frontend
  - jwt
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/types.ts
  - frontend/lib/api-client.ts
tests: []
---

# Frontend API Client Implementation

## Summary
Implemented API client with JWT token handling for all task operations in the frontend application.

## Changes Made

### 1. Created TypeScript Types (`frontend/lib/types.ts`)
- Defined `Task` interface with properties: id, userId, title, description, completed, createdAt, updatedAt
- Defined `CreateTaskInput` interface with required title and optional description
- Defined `UpdateTaskInput` interface with optional properties for partial updates

### 2. Created API Client (`frontend/lib/api-client.ts`)
- Base API URL from environment variable with fallback
- Centralized request handler with JWT token inclusion
- Error handling for 401 (redirect to signin), 403 (forbidden), and other HTTP errors
- All required API functions implemented with proper typing:
  - `getTasks(userId: string, status?: string)`
  - `createTask(userId: string, data: CreateTaskInput)`
  - `getTask(userId: string, taskId: number)`
  - `updateTask(userId: string, taskId: number, data: UpdateTaskInput)`
  - `deleteTask(userId: string, taskId: number)`
  - `toggleComplete(userId: string, taskId: number)`

## Technical Details

### Request Handler
- Centralized request method with automatic JWT token inclusion
- Proper Content-Type headers
- Error handling with specific responses for different status codes
- JSON parsing with appropriate fallbacks

### Authentication Handling
- Token retrieval from localStorage
- Authorization header with Bearer scheme
- Automatic redirect on 401 Unauthorized
- Error messages for 403 Forbidden

### API Functions
- All functions return properly typed promises
- URL construction with proper path parameters
- Correct HTTP methods for each operation
- Body serialization for POST/PUT/PATCH requests

## Acceptance Criteria Verification
- ✅ All API functions implemented
- ✅ JWT token automatically included in headers
- ✅ Error handling for 401, 403, 404, 500
- ✅ TypeScript types for all inputs/outputs
- ✅ Returns typed responses

## Files Created
- `frontend/lib/types.ts`
- `frontend/lib/api-client.ts`

## Next Steps
- Integrate API client with task management components
- Implement server-side API endpoints in backend
- Add loading and error states to UI components
- Implement proper session management for token handling