# Data Model: Todo Full-Stack Web Application

## Entity: User

**Fields**:
- `id` (UUID/Integer): Unique identifier for the user
- `email` (String): User's email address (unique, required)
- `password_hash` (String): Hashed password using bcrypt (required)
- `created_at` (DateTime): Timestamp when user account was created
- `updated_at` (DateTime): Timestamp when user account was last updated
- `is_active` (Boolean): Whether the user account is active (default: true)

**Validation Rules**:
- Email must be valid email format
- Email must be unique across all users
- Password must be properly hashed before storage
- Email cannot be changed after account creation

**Relationships**:
- One-to-Many: User has many Tasks (user.tasks)

## Entity: Task

**Fields**:
- `id` (UUID/Integer): Unique identifier for the task
- `title` (String): Task title (required, max 255 characters)
- `description` (String): Optional task description (nullable)
- `is_completed` (Boolean): Whether the task is completed (default: false)
- `user_id` (UUID/Integer): Foreign key to User who owns this task (required)
- `created_at` (DateTime): Timestamp when task was created
- `updated_at` (DateTime): Timestamp when task was last updated

**Validation Rules**:
- Title is required and must not be empty
- Title must be between 1 and 255 characters
- Description, if provided, must be less than 1000 characters
- user_id must reference an existing user
- Only the task owner can modify the task

**Relationships**:
- Many-to-One: Task belongs to one User (task.user)

## State Transitions

### Task State Transitions
- **Pending → Completed**: When user marks task as complete
- **Completed → Pending**: When user unmarks completed task

## Database Constraints

### User Constraints
- UNIQUE constraint on email field
- NOT NULL constraints on required fields
- Proper indexing on frequently queried fields (email)

### Task Constraints
- FOREIGN KEY constraint on user_id referencing users table
- NOT NULL constraints on required fields
- Proper indexing on user_id for efficient user-based queries

## Data Isolation Rules

- Users can only access their own tasks
- API endpoints must validate that user_id in request matches authenticated user
- Database queries must always filter by authenticated user's ID
- No cross-user data access is allowed