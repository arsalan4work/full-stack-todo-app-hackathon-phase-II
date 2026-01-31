---
name: todo-error-handling-skill
description: Implement robust error handling specifically for the Todo console application, preventing crashes and providing excellent user experience.
---

## Core Error Handling Principles

### 1. Never Crash - Always Recover
The application must NEVER crash. Every potential error must be caught and handled gracefully.
```python
# ✅ Correct - Handles all error cases
def get_task_by_id(task_id: int) -> Task | None:
    """Get task by ID with error handling."""
    try:
        if task_id < 1:
            raise ValueError("Task ID must be positive")
        
        task = self._find_task(task_id)
        if task is None:
            raise TaskNotFoundError(f"Task #{task_id} not found")
        
        return task
    except ValueError as e:
        print(f"❌ Error: {e}")
        return None
    except TaskNotFoundError as e:
        print(f"❌ Error: {e}")
        return None

# ❌ Wrong - Can crash
def get_task_by_id(task_id: int) -> Task:
    return self._tasks[task_id]  # Can raise KeyError, IndexError
```

### 2. Fail Fast - Validate Early
Validate all inputs at the entry point before processing.
```python
# ✅ Correct - Validates immediately
def add_task(self, title: str, description: str | None = None) -> Task | None:
    """Add task with early validation."""
    # Validate FIRST
    if not title or not title.strip():
        print("❌ Error: Title cannot be empty")
        return None
    
    if len(title) > 100:
        print(f"❌ Error: Title too long ({len(title)} chars). Maximum is 100 characters.")
        return None
    
    if description and len(description) > 500:
        print(f"❌ Error: Description too long ({len(description)} chars). Maximum is 500 characters.")
        return None
    
    # Then process
    task = Task(id=self._get_next_id(), title=title.strip(), description=description)
    self._tasks.append(task)
    return task

# ❌ Wrong - Validates too late
def add_task(self, title: str, description: str | None = None) -> Task:
    task = Task(id=self._get_next_id(), title=title, description=description)
    self._tasks.append(task)
    # Validation happens after task is already created
    if len(title) > 100:
        raise ValueError("Title too long")
    return task
```

### 3. Clear Error Messages
Error messages must be specific, actionable, and user-friendly.
```python
# ✅ Correct - Clear and helpful
"❌ Error: Title cannot be empty. Please enter a title for your task."
"❌ Error: Title too long (150 chars). Maximum is 100 characters."
"❌ Error: Task #5 not found. You have 3 tasks (IDs: 1, 2, 3)."
"❌ Error: Invalid choice '7'. Please enter a number from 1-6."

# ❌ Wrong - Vague or technical
"Error: Invalid input"
"ValueError: string index out of range"
"Error: Task not found"
"Bad request"
```

## Common Error Scenarios for Todo App

### 1. Empty Task List Operations

**Scenario**: User tries to view, update, delete, or toggle when no tasks exist.
```python
def view_tasks(self) -> None:
    """Display all tasks with empty list handling."""
    if not self._tasks:
        print("\n📝 No tasks yet! Add your first task to get started.\n")
        return
    
    print("\n" + "=" * 60)
    print("YOUR TASKS".center(60))
    print("=" * 60)
    
    for task in self._tasks:
        status = "✓" if task.is_complete else "○"
        print(f"[{status}] #{task.id}: {task.title}")
        if task.description:
            desc = task.description[:50] + "..." if len(task.description) > 50 else task.description
            print(f"    {desc}")
    
    print("=" * 60)
    print(f"Total: {len(self._tasks)} task(s)\n")

def delete_task(self, task_id: int) -> bool:
    """Delete task with empty list check."""
    if not self._tasks:
        print("❌ Error: No tasks to delete. The list is empty.")
        return False
    
    # Continue with deletion logic...
```

### 2. Invalid Task ID

**Scenario**: User provides non-existent, negative, or non-numeric ID.
```python
def _validate_task_id(self, task_id_input: str) -> int | None:
    """Validate and convert task ID input.
    
    Args:
        task_id_input: User input for task ID
        
    Returns:
        Valid task ID as integer, or None if invalid
    """
    # Check if empty
    if not task_id_input or not task_id_input.strip():
        print("❌ Error: Task ID cannot be empty.")
        return None
    
    # Check if numeric
    try:
        task_id = int(task_id_input.strip())
    except ValueError:
        print(f"❌ Error: '{task_id_input}' is not a valid number. Please enter a task ID.")
        return None
    
    # Check if positive
    if task_id < 1:
        print(f"❌ Error: Task ID must be positive. You entered: {task_id}")
        return None
    
    # Check if exists
    if not any(task.id == task_id for task in self._tasks):
        existing_ids = ", ".join(str(t.id) for t in self._tasks)
        print(f"❌ Error: Task #{task_id} not found.")
        print(f"   Available task IDs: {existing_ids}")
        return None
    
    return task_id

# Usage in delete function
def delete_task(self) -> None:
    """Delete task with comprehensive validation."""
    if not self._tasks:
        print("❌ Error: No tasks to delete.\n")
        return
    
    task_id_input = input("Enter task ID to delete: ")
    task_id = self._validate_task_id(task_id_input)
    
    if task_id is None:
        return  # Error already displayed by validator
    
    # Continue with deletion...
```

### 3. Invalid Menu Choice

**Scenario**: User enters non-numeric or out-of-range menu option.
```python
def get_menu_choice(self) -> int | None:
    """Get and validate menu choice.
    
    Returns:
        Valid menu choice (1-6), or None if invalid
    """
    try:
        choice_input = input("\nEnter your choice (1-6): ").strip()
        
        if not choice_input:
            print("❌ Error: Please enter a choice.\n")
            return None
        
        choice = int(choice_input)
        
        if choice < 1 or choice > 6:
            print(f"❌ Error: Invalid choice '{choice}'. Please enter a number from 1 to 6.\n")
            return None
        
        return choice
        
    except ValueError:
        print(f"❌ Error: '{choice_input}' is not a valid number. Please enter 1-6.\n")
        return None
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!\n")
        return 6  # Exit
    except Exception as e:
        print(f"❌ Unexpected error: {e}\n")
        return None
```

### 4. Invalid Title Input

**Scenario**: Empty, whitespace-only, or too-long title.
```python
def _validate_title(self, title: str) -> tuple[bool, str]:
    """Validate task title.
    
    Args:
        title: The title to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check empty
    if not title or not title.strip():
        return False, "Title cannot be empty"
    
    # Check length
    title_stripped = title.strip()
    if len(title_stripped) > 100:
        return False, f"Title too long ({len(title_stripped)} chars). Maximum is 100 characters"
    
    # Check if only special characters
    if not any(c.isalnum() for c in title_stripped):
        return False, "Title must contain at least one letter or number"
    
    return True, ""

def add_task(self) -> None:
    """Add new task with validation."""
    print("\n--- Add New Task ---")
    
    title = input("Enter task title: ")
    is_valid, error_msg = self._validate_title(title)
    
    if not is_valid:
        print(f"❌ Error: {error_msg}\n")
        return
    
    description = input("Enter description (optional, press Enter to skip): ").strip()
    
    # Validate description if provided
    if description and len(description) > 500:
        print(f"❌ Error: Description too long ({len(description)} chars). Maximum is 500 characters.\n")
        return
    
    # Add task
    task = self.task_service.add_task(title.strip(), description or None)
    if task:
        print(f"✅ Success: Task #{task.id} '{task.title}' added!\n")
```

### 5. Invalid Description Input

**Scenario**: Description exceeds maximum length.
```python
def _validate_description(self, description: str | None) -> tuple[bool, str]:
    """Validate task description.
    
    Args:
        description: The description to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if description is None or not description.strip():
        return True, ""  # Optional field, empty is valid
    
    desc_stripped = description.strip()
    if len(desc_stripped) > 500:
        return False, f"Description too long ({len(desc_stripped)} chars). Maximum is 500 characters"
    
    return True, ""
```

### 6. Update Task Edge Cases

**Scenario**: User wants to keep existing values or provides invalid input.
```python
def update_task(self) -> None:
    """Update task with existing value preservation."""
    if not self.task_service.get_all_tasks():
        print("❌ Error: No tasks to update.\n")
        return
    
    # Get task ID
    task_id_input = input("Enter task ID to update: ")
    task_id = self._validate_task_id(task_id_input)
    
    if task_id is None:
        return
    
    # Get existing task
    task = self.task_service.get_task_by_id(task_id)
    if task is None:
        return
    
    print(f"\nCurrent task details:")
    print(f"  Title: {task.title}")
    print(f"  Description: {task.description or '(none)'}")
    print("\nPress Enter to keep current value, or type new value:")
    
    # Update title
    new_title = input(f"New title [{task.title}]: ").strip()
    
    if new_title:  # User provided new title
        is_valid, error_msg = self._validate_title(new_title)
        if not is_valid:
            print(f"❌ Error: {error_msg}\n")
            return
        title_to_use = new_title
    else:  # Keep existing
        title_to_use = task.title
    
    # Update description
    new_desc = input(f"New description [{task.description or 'none'}]: ").strip()
    
    if new_desc:  # User provided new description
        is_valid, error_msg = self._validate_description(new_desc)
        if not is_valid:
            print(f"❌ Error: {error_msg}\n")
            return
        desc_to_use = new_desc
    else:  # Keep existing
        desc_to_use = task.description
    
    # Perform update
    success = self.task_service.update_task(task_id, title_to_use, desc_to_use)
    if success:
        print(f"✅ Success: Task #{task_id} updated!\n")
    else:
        print(f"❌ Error: Failed to update task #{task_id}.\n")
```

### 7. Delete Confirmation

**Scenario**: Prevent accidental deletions.
```python
def delete_task(self) -> None:
    """Delete task with confirmation."""
    if not self.task_service.get_all_tasks():
        print("❌ Error: No tasks to delete.\n")
        return
    
    # Get task ID
    task_id_input = input("Enter task ID to delete: ")
    task_id = self._validate_task_id(task_id_input)
    
    if task_id is None:
        return
    
    # Get task for confirmation display
    task = self.task_service.get_task_by_id(task_id)
    if task is None:
        return
    
    # Show confirmation
    print(f"\n⚠️  You are about to delete:")
    print(f"   Task #{task.id}: {task.title}")
    if task.description:
        print(f"   Description: {task.description}")
    
    confirm = input("\nAre you sure? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("❌ Deletion cancelled.\n")
        return
    
    # Perform deletion
    success = self.task_service.delete_task(task_id)
    if success:
        print(f"✅ Success: Task #{task_id} deleted.\n")
    else:
        print(f"❌ Error: Failed to delete task #{task_id}.\n")
```

### 8. Keyboard Interrupt (Ctrl+C)

**Scenario**: User presses Ctrl+C to exit.
```python
def run(self) -> None:
    """Main application loop with interrupt handling."""
    print("=" * 60)
    print("TODO CONSOLE MANAGER".center(60))
    print("=" * 60)
    
    try:
        while True:
            self.display_menu()
            choice = self.get_menu_choice()
            
            if choice is None:
                continue
            
            if choice == 6:
                print("\n👋 Thank you for using Todo Console Manager!\n")
                break
            
            self._handle_choice(choice)
            
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted. Goodbye!\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error occurred: {e}")
        print("Please report this issue.\n")
        sys.exit(1)
```

## Custom Exception Classes

Define custom exceptions for specific error cases.
```python
"""Custom exceptions for the Todo application."""

class TodoAppError(Exception):
    """Base exception for Todo app errors."""
    pass

class TaskNotFoundError(TodoAppError):
    """Raised when a task ID doesn't exist."""
    pass

class InvalidTaskDataError(TodoAppError):
    """Raised when task data fails validation."""
    pass

class EmptyTaskListError(TodoAppError):
    """Raised when operation requires tasks but list is empty."""
    pass

# Usage example
def get_task_by_id(self, task_id: int) -> Task:
    """Get task by ID.
    
    Args:
        task_id: The task ID to find
        
    Returns:
        Task instance
        
    Raises:
        TaskNotFoundError: If task doesn't exist
    """
    task = next((t for t in self._tasks if t.id == task_id), None)
    if task is None:
        raise TaskNotFoundError(f"Task #{task_id} not found")
    return task
```

## Error Handling Patterns

### Pattern 1: Try-Except-Return Pattern
```python
def operation_with_validation(self, data: str) -> bool:
    """Perform operation with error handling.
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # Validation
        if not self._is_valid(data):
            raise ValueError("Invalid data")
        
        # Operation
        self._perform_operation(data)
        return True
        
    except ValueError as e:
        print(f"❌ Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
```

### Pattern 2: Validate-Then-Execute Pattern
```python
def add_task(self, title: str, description: str | None = None) -> Task | None:
    """Add task with upfront validation.
    
    Returns:
        Created task, or None if validation fails
    """
    # Validate ALL inputs first
    is_valid, error_msg = self._validate_inputs(title, description)
    if not is_valid:
        print(f"❌ Error: {error_msg}")
        return None
    
    # Execute only if valid
    task = self._create_task(title, description)
    return task
```

### Pattern 3: Defensive Programming Pattern
```python
def get_task_by_id(self, task_id: int) -> Task | None:
    """Get task with defensive checks.
    
    Returns:
        Task if found, None otherwise
    """
    # Check preconditions
    if not isinstance(task_id, int):
        print(f"❌ Error: Task ID must be an integer, got {type(task_id)}")
        return None
    
    if task_id < 1:
        print(f"❌ Error: Task ID must be positive, got {task_id}")
        return None
    
    if not self._tasks:
        print("❌ Error: No tasks available")
        return None
    
    # Perform operation
    task = next((t for t in self._tasks if t.id == task_id), None)
    if task is None:
        print(f"❌ Error: Task #{task_id} not found")
    
    return task
```

## Error Message Guidelines

### Use Emoji Icons for Visual Clarity
```python
"✅ Success: ..."  # Success messages
"❌ Error: ..."    # Error messages
"⚠️  Warning: ..." # Warning messages
"📝 Info: ..."     # Informational messages
"👋 ..."           # Greeting/farewell
```

### Provide Context and Solutions
```python
# ✅ Good - Explains what and why
"❌ Error: Task #5 not found. You have 3 tasks (IDs: 1, 2, 3)."
"❌ Error: Title cannot be empty. Please enter a title for your task."
"❌ Error: Invalid choice '7'. Please enter a number from 1 to 6."

# ❌ Bad - No context
"Task not found"
"Invalid input"
"Error"
```

### Be Specific About Limits
```python
# ✅ Good - Shows actual vs limit
"❌ Error: Title too long (150 chars). Maximum is 100 characters."
"❌ Error: Description too long (750 chars). Maximum is 500 characters."

# ❌ Bad - Vague
"Title too long"
"Description exceeds limit"
```

## Testing Error Handling

### Test Cases to Cover
```python
# 1. Empty inputs
- Empty title: ""
- Whitespace-only title: "   "
- Empty description: ""

# 2. Invalid IDs
- Non-numeric: "abc"
- Negative: "-1"
- Zero: "0"
- Non-existent: "999"
- Float: "1.5"

# 3. Length violations
- Title exactly 101 chars
- Description exactly 501 chars
- Very long inputs (1000+ chars)

# 4. Special characters
- Unicode characters: "Задача №1"
- Emojis: "🎉 Party task"
- Newlines in input

# 5. Edge cases
- Operating on empty list
- Deleting last task
- Updating non-existent task
- Invalid menu choices (0, -1, 7, 100)

# 6. Keyboard interrupts
- Ctrl+C during input
- Ctrl+C during operation
- Multiple Ctrl+C presses

# 7. Boundary values
- Title exactly 100 chars (should succeed)
- Title 101 chars (should fail)
- Description exactly 500 chars (should succeed)
- Description 501 chars (should fail)
```

## Error Handling Checklist

For every user input or operation, ensure:

- [ ] Empty input is handled
- [ ] Whitespace-only input is handled
- [ ] Invalid type conversion is handled (e.g., string to int)
- [ ] Out-of-range values are handled
- [ ] Non-existent IDs are handled
- [ ] Empty list operations are handled
- [ ] Maximum length violations are handled
- [ ] Special characters are handled properly
- [ ] Keyboard interrupts (Ctrl+C) are caught
- [ ] Error messages are clear and helpful
- [ ] Success messages confirm the action
- [ ] No operation can crash the application
- [ ] User can always recover from errors
- [ ] User knows what went wrong and how to fix it

## Summary

Error handling priorities for the Todo app:

1. **Never crash** - Catch and handle all exceptions
2. **Validate early** - Check inputs before processing
3. **Be specific** - Clear, actionable error messages
4. **Show context** - What went wrong and why
5. **Provide guidance** - Help user fix the issue
6. **Use visual cues** - Emoji icons for quick recognition
7. **Handle edge cases** - Empty lists, invalid IDs, etc.
8. **Graceful interrupts** - Handle Ctrl+C properly
9. **Consistent patterns** - Same approach across all operations
10. **User-friendly** - Technical details hidden, simple language shown

Remember: Good error handling makes the difference between a frustrating app and a delightful user experience.