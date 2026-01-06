# API Contract: Todo Full-Stack Web Application

## Base URL
`/api`

## Authentication
All endpoints (except signup/signin) require JWT token in Authorization header:
```
Authorization: Bearer {jwt_token}
```

## User Management Endpoints

### POST /auth/signup
**Description**: Create a new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "created_at": "2026-01-05T10:00:00Z"
}
```

**Validation**:
- Email must be valid email format
- Password must be at least 8 characters
- Email must be unique

### POST /auth/signin
**Description**: Sign in existing user

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "jwt_token_string",
  "token_type": "bearer",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com"
  }
}
```

**Validation**:
- Email and password must match existing user
- Returns JWT access token for subsequent requests

## Task Management Endpoints

### GET /users/{user_id}/tasks
**Description**: List all tasks for a specific user

**Path Parameters**:
- `user_id`: The ID of the user whose tasks to retrieve

**Query Parameters**:
- `status` (optional): Filter by completion status ("completed", "pending", "all")

**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "uuid-string",
      "title": "Task title",
      "description": "Task description",
      "is_completed": false,
      "created_at": "2026-01-05T10:00:00Z",
      "updated_at": "2026-01-05T10:00:00Z"
    }
  ]
}
```

**Authorization**: User must be authenticated and match the requested user_id

### POST /users/{user_id}/tasks
**Description**: Create a new task for the specified user

**Path Parameters**:
- `user_id`: The ID of the user to create the task for

**Request**:
```json
{
  "title": "New task title",
  "description": "Optional task description"
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid-string",
  "title": "New task title",
  "description": "Optional task description",
  "is_completed": false,
  "user_id": "uuid-string",
  "created_at": "2026-01-05T10:00:00Z",
  "updated_at": "2026-01-05T10:00:00Z"
}
```

**Validation**:
- Title is required and must not be empty
- Title must be between 1 and 255 characters
- Description, if provided, must be less than 1000 characters
- user_id must match the authenticated user's ID

### GET /users/{user_id}/tasks/{task_id}
**Description**: Get details of a specific task

**Path Parameters**:
- `user_id`: The ID of the user who owns the task
- `task_id`: The ID of the task to retrieve

**Response (200 OK)**:
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "is_completed": false,
  "user_id": "uuid-string",
  "created_at": "2026-01-05T10:00:00Z",
  "updated_at": "2026-01-05T10:00:00Z"
}
```

**Authorization**: User must be authenticated and match the requested user_id

### PUT /users/{user_id}/tasks/{task_id}
**Description**: Update an existing task

**Path Parameters**:
- `user_id`: The ID of the user who owns the task
- `task_id`: The ID of the task to update

**Request**:
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "is_completed": true
}
```

**Response (200 OK)**:
```json
{
  "id": "uuid-string",
  "title": "Updated task title",
  "description": "Updated task description",
  "is_completed": true,
  "user_id": "uuid-string",
  "created_at": "2026-01-05T10:00:00Z",
  "updated_at": "2026-01-05T10:00:00Z"
}
```

**Validation**:
- At least one field must be provided for update
- Title must be between 1 and 255 characters if provided
- Description must be less than 1000 characters if provided
- user_id must match the authenticated user's ID

### DELETE /users/{user_id}/tasks/{task_id}
**Description**: Delete a specific task

**Path Parameters**:
- `user_id`: The ID of the user who owns the task
- `task_id`: The ID of the task to delete

**Response (204 No Content)**:

**Authorization**: User must be authenticated and match the requested user_id

## Error Responses

All error responses follow the same structure:

**400 Bad Request** (Validation errors):
```json
{
  "detail": "Error message describing the validation issue"
}
```

**401 Unauthorized** (Authentication required):
```json
{
  "detail": "Authentication credentials were not provided or are invalid"
}
```

**403 Forbidden** (Insufficient permissions):
```json
{
  "detail": "You do not have permission to access this resource"
}
```

**404 Not Found** (Resource does not exist):
```json
{
  "detail": "The requested resource was not found"
}
```

**500 Internal Server Error** (Unexpected server errors):
```json
{
  "detail": "An unexpected error occurred"
}
```