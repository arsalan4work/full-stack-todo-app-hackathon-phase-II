---
name: python-development-standards-skill
description: Guide Claude Code to write high-quality, type-safe Python 3.13+ code following modern best practices.
---


## Core Principles

### 1. Type Hints (MANDATORY)
Every function must have complete type hints for all parameters and return values.

**Correct Example:**
```python
def add_task(title: str, description: str | None = None) -> dict[str, Any]:
    """Add a new task."""
    pass
```

**Wrong Example:**
```python
def add_task(title, description=None):  # Missing type hints
    pass
```

### 2. Docstrings (MANDATORY)
Use Google-style docstrings for all public functions and classes.

**Required Sections:**
- Brief description (one line)
- Args: Parameter descriptions
- Returns: Return value description
- Raises: Exceptions that may be raised

**Example:**
```python
def validate_title(title: str) -> bool:
    """Validate task title meets requirements.
    
    Args:
        title: The task title to validate
        
    Returns:
        True if valid, False otherwise
        
    Raises:
        ValueError: If title is empty or exceeds 100 characters
    """
    if not title or len(title) > 100:
        raise ValueError("Title must be 1-100 characters")
    return True
```

### 3. Modern Python Features (Python 3.10+)

**Use Dataclasses for Data Models:**
```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Task:
    id: int
    title: str
    description: str | None = None
    is_complete: bool = False
    created_at: datetime = field(default_factory=datetime.now)
```

**Use Enums for Constants:**
```python
from enum import Enum

class TaskStatus(Enum):
    INCOMPLETE = "incomplete"
    COMPLETE = "complete"

class MenuOption(Enum):
    ADD = 1
    VIEW = 2
    UPDATE = 3
    DELETE = 4
    TOGGLE = 5
    EXIT = 6
```

**Use Union Types with | (Python 3.10+):**
```python
# ✅ Modern syntax
def get_task(task_id: int) -> Task | None:
    pass

# ❌ Old syntax - Don't use
from typing import Optional, Union
def get_task(task_id: int) -> Optional[Task]:
    pass
```

**Use match-case for Menu Logic:**
```python
match choice:
    case 1:
        add_task()
    case 2:
        view_tasks()
    case 3:
        update_task()
    case 4:
        delete_task()
    case 5:
        toggle_complete()
    case 6:
        exit()
    case _:
        print("Invalid option")
```

**Use f-strings for Formatting:**
```python
# ✅ Correct
message = f"Task #{task_id} marked as {status}"

# ❌ Wrong - Don't use
message = "Task #%s marked as %s" % (task_id, status)
message = "Task #{} marked as {}".format(task_id, status)
```

### 4. Code Organization Standards

**File Structure:**
- One class per file (unless tightly coupled)
- Maximum function length: 30 lines
- Maximum file length: 300 lines
- Group related functions into classes

**Naming Conventions:**
- Classes: `PascalCase` (e.g., `TaskService`, `CLIInterface`)
- Functions/Variables: `snake_case` (e.g., `add_task`, `task_list`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_TITLE_LENGTH`, `DEFAULT_STATUS`)
- Private methods: `_leading_underscore` (e.g., `_validate_input`)

**Import Organization:**
```python
"""Module docstring describing the file purpose."""

# Standard library imports
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import Any

# Third-party imports (if any)
# import requests

# Local application imports
from models.task import Task
from services.task_service import TaskService
```

### 5. Error Handling

**Always Be Specific:**
```python
# ✅ Correct - Catch specific exceptions
try:
    task_id = int(user_input)
except ValueError:
    raise ValueError(f"Invalid ID format: '{user_input}'. Must be a number.")

# ❌ Wrong - Bare except
try:
    task_id = int(user_input)
except:
    print("Error")
```

**Provide Context in Error Messages:**
```python
# ✅ Good error message
if len(title) > 100:
    raise ValueError(f"Title too long ({len(title)} chars). Maximum is 100 characters.")

# ❌ Poor error message
if len(title) > 100:
    raise ValueError("Title invalid")
```

**Use Custom Exceptions When Appropriate:**
```python
class TaskNotFoundError(Exception):
    """Raised when task ID does not exist."""
    pass

class InvalidTaskDataError(Exception):
    """Raised when task data fails validation."""
    pass
```

### 6. Input Validation

**Validate Early (Fail Fast):**
```python
def add_task(title: str, description: str | None = None) -> Task:
    """Add new task with validation.
    
    Args:
        title: Task title (1-100 characters)
        description: Optional task description (max 500 characters)
        
    Returns:
        Created Task instance
        
    Raises:
        ValueError: If validation fails
    """
    # Validate immediately
    if not title or not title.strip():
        raise ValueError("Title cannot be empty")
    
    if len(title) > 100:
        raise ValueError(f"Title too long: {len(title)} chars (max 100)")
    
    if description and len(description) > 500:
        raise ValueError(f"Description too long: {len(description)} chars (max 500)")
    
    # Proceed with logic
    task = Task(id=self._next_id(), title=title.strip(), description=description)
    return task
```

## Critical Anti-Patterns to AVOID

### ❌ Mutable Default Arguments
```python
# WRONG - List is shared across calls
def add_items(items=[]):
    items.append("new")
    return items

# CORRECT
def add_items(items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append("new")
    return items
```

### ❌ Global Variables
```python
# WRONG - Global state
tasks = []

def add_task(title):
    tasks.append(title)

# CORRECT - Pass as parameter or use class
class TaskService:
    def __init__(self):
        self._tasks: list[Task] = []
    
    def add_task(self, title: str) -> Task:
        task = Task(id=len(self._tasks) + 1, title=title)
        self._tasks.append(task)
        return task
```

### ❌ Ignoring Type Hints
```python
# WRONG - Type hint says str but returns int
def get_id() -> str:
    return 123  # Type checker will catch this

# CORRECT
def get_id() -> int:
    return 123
```

### ❌ Magic Numbers/Strings
```python
# WRONG - Hardcoded values
if len(title) > 100:
    pass

# CORRECT - Use constants
MAX_TITLE_LENGTH = 100

if len(title) > MAX_TITLE_LENGTH:
    pass
```

## Code Generation Checklist

When Claude Code generates Python code, ensure:

- [ ] All imports are at the top, properly organized
- [ ] Every function has type hints (parameters + return)
- [ ] Every public function has a Google-style docstring
- [ ] Using dataclasses for data structures (not plain dicts)
- [ ] Using Enums for constants and status values
- [ ] Using modern syntax: `|` for unions, match-case, f-strings
- [ ] Error handling is specific (no bare except)
- [ ] Error messages provide helpful context
- [ ] Input validation happens early (fail fast)
- [ ] No mutable default arguments
- [ ] No global variables
- [ ] Constants defined at module level in UPPER_CASE
- [ ] Following naming conventions (PascalCase, snake_case)
- [ ] Functions are focused and under 30 lines
- [ ] Files are under 300 lines

## Type Checking

Always validate code with mypy:
```bash
uv run mypy src/
```

Code must pass type checking with no errors.

## Common Patterns for This Project

### Data Model
```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Task:
    id: int
    title: str
    description: str | None = None
    is_complete: bool = False
    created_at: datetime = field(default_factory=datetime.now)
```

### Service Class
```python
class TaskService:
    """Manages in-memory task storage and operations."""
    
    def __init__(self):
        self._tasks: list[Task] = []
        self._next_id: int = 1
    
    def add_task(self, title: str, description: str | None = None) -> Task:
        """Add a new task."""
        pass
    
    def get_all_tasks(self) -> list[Task]:
        """Retrieve all tasks."""
        pass
```

### CLI Interface
```python
class CLIInterface:
    """Handles command-line user interaction."""
    
    def display_menu(self) -> None:
        """Show main menu options."""
        pass
    
    def get_user_choice(self) -> int:
        """Get and validate user menu choice."""
        pass
```

## Summary

Follow these standards religiously:
1. **Type hints everywhere** - No exceptions
2. **Docstrings for public APIs** - Google style
3. **Modern Python** - Dataclasses, Enums, |, match-case, f-strings
4. **Specific error handling** - Context in messages
5. **Validate early** - Fail fast principle
6. **No anti-patterns** - No mutable defaults, globals, bare excepts
7. **Type check** - Code must pass mypy