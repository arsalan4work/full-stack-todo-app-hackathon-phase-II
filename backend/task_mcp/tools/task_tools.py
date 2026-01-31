"""Task management tools for MCP server."""
from typing import List, Optional, Literal
from sqlmodel import Session, select
from models.task import Task
from models.user import User
from db import get_engine
from utils.error_handler import TaskNotFoundError, UnauthorizedTaskAccessError, validate_task_id, validate_title_length


def add_task(user_id: str, title: str, description: Optional[str] = None) -> dict:
    """
    Add a new task to the database.

    Args:
        user_id: The ID of the user creating the task
        title: The title of the task
        description: Optional description of the task

    Returns:
        Dictionary with task_id, status, and title
    """
    try:
        # Validate inputs
        validate_title_length(title)

        if description and len(description) > 1000:
            return {"error": "Description cannot exceed 1000 characters"}

        # Convert user_id to integer (assuming user_id is stored as int in the database)
        try:
            user_int_id = int(user_id)
        except ValueError:
            return {"error": "Invalid user ID format"}

        # Check if user exists
        engine = get_engine()
        with Session(engine) as session:
            user = session.get(User, user_int_id)
            if not user:
                return {"error": "User not found"}

            # Create new task
            task = Task(
                user_id=user_int_id,
                title=title.strip(),
                description=description.strip() if description else None,
                completed=False
            )

            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "task_id": task.id,
                "status": "created",
                "title": task.title
            }
    except Exception as e:
        return {"error": f"Failed to add task: {str(e)}"}


def list_tasks(user_id: str, status: Literal["all", "pending", "completed"] = "all") -> List[dict]:
    """
    List tasks for a specific user.

    Args:
        user_id: The ID of the user whose tasks to list
        status: Filter by status ("all", "pending", "completed")

    Returns:
        List of task dictionaries
    """
    try:
        # Validate user_id
        try:
            user_int_id = int(user_id)
        except ValueError:
            return [{"error": "Invalid user ID format"}]

        # Build query based on status filter
        engine = get_engine()
        with Session(engine) as session:
            query = select(Task).where(Task.user_id == user_int_id)

            if status == "pending":
                query = query.where(Task.completed == False)
            elif status == "completed":
                query = query.where(Task.completed == True)

            tasks = session.exec(query).all()

            result = []
            for task in tasks:
                result.append({
                    "id": task.id,
                    "title": task.title,
                    "completed": task.completed,
                    "description": task.description or ""
                })

            return result
    except Exception as e:
        return [{"error": f"Failed to list tasks: {str(e)}"}]


def complete_task(user_id: str, task_id: int) -> dict:
    """
    Mark a task as completed.

    Args:
        user_id: The ID of the user requesting the change
        task_id: The ID of the task to complete

    Returns:
        Dictionary with task_id, status, and title
    """
    try:
        # Validate inputs
        validate_task_id(task_id)

        try:
            user_int_id = int(user_id)
        except ValueError:
            return {"error": "Invalid user ID format"}

        # Check if user owns the task
        engine = get_engine()
        with Session(engine) as session:
            task = session.get(Task, task_id)

            if not task:
                return {"error": f"Task with ID {task_id} not found", "code": "TASK_NOT_FOUND"}

            if task.user_id != user_int_id:
                return {"error": f"User {user_int_id} does not have access to task {task_id}", "code": "UNAUTHORIZED_TASK_ACCESS"}

            # Update task to completed
            task.completed = True
            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "task_id": task.id,
                "status": "completed",
                "title": task.title
            }
    except Exception as e:
        return {"error": f"Failed to complete task: {str(e)}"}


def delete_task(user_id: str, task_id: int) -> dict:
    """
    Delete a task from the database.

    Args:
        user_id: The ID of the user requesting deletion
        task_id: The ID of the task to delete

    Returns:
        Dictionary with task_id, status, and title
    """
    try:
        # Validate inputs
        validate_task_id(task_id)

        try:
            user_int_id = int(user_id)
        except ValueError:
            return {"error": "Invalid user ID format"}

        # Check if user owns the task
        engine = get_engine()
        with Session(engine) as session:
            task = session.get(Task, task_id)

            if not task:
                return {"error": f"Task with ID {task_id} not found", "code": "TASK_NOT_FOUND"}

            if task.user_id != user_int_id:
                return {"error": f"User {user_int_id} does not have access to task {task_id}", "code": "UNAUTHORIZED_TASK_ACCESS"}

            # Delete the task
            session.delete(task)
            session.commit()

            return {
                "task_id": task.id,
                "status": "deleted",
                "title": task.title
            }
    except Exception as e:
        return {"error": f"Failed to delete task: {str(e)}"}


def update_task(user_id: str, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> dict:
    """
    Update a task's fields.

    Args:
        user_id: The ID of the user requesting update
        task_id: The ID of the task to update
        title: New title (optional)
        description: New description (optional)

    Returns:
        Dictionary with task_id, status, and title
    """
    try:
        # Validate inputs
        validate_task_id(task_id)

        if title is not None:
            validate_title_length(title)

        if description is not None and len(description) > 1000:
            return {"error": "Description cannot exceed 1000 characters"}

        try:
            user_int_id = int(user_id)
        except ValueError:
            return {"error": "Invalid user ID format"}

        # Check if user owns the task
        engine = get_engine()
        with Session(engine) as session:
            task = session.get(Task, task_id)

            if not task:
                return {"error": f"Task with ID {task_id} not found", "code": "TASK_NOT_FOUND"}

            if task.user_id != user_int_id:
                return {"error": f"User {user_int_id} does not have access to task {task_id}", "code": "UNAUTHORIZED_TASK_ACCESS"}

            # Update task fields if provided
            if title is not None:
                task.title = title.strip()

            if description is not None:
                task.description = description.strip() if description else None

            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "task_id": task.id,
                "status": "updated",
                "title": task.title
            }
    except Exception as e:
        return {"error": f"Failed to update task: {str(e)}"}