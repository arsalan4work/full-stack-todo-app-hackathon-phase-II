from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Annotated, List, Optional
from datetime import datetime

from ..db import get_engine
from ..models import Task
from ..auth.dependencies import get_current_user_id
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse


router = APIRouter(prefix="/api", tags=["tasks"])


@router.post("/users/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: int,
    task_create: TaskCreate,
    authenticated_user_id: str = Depends(get_current_user_id)
) -> TaskResponse:
    """
    Create a new task for the authenticated user.
    Verifies that the user_id in the URL matches the authenticated user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(user_id) != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID in URL does not match authenticated user"
        )

    # Validate title length (1-200 characters)
    if not task_create.title or len(task_create.title.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title is required and cannot be empty"
        )

    if len(task_create.title) > 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title must be 200 characters or less"
        )

    # Create task instance
    task = Task(
        user_id=user_id,
        title=task_create.title.strip(),
        description=task_create.description,
        completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Add to database
    engine = get_engine()
    with Session(engine) as session:
        session.add(task)
        session.commit()
        session.refresh(task)

        # Return the created task
        return TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at
        )


@router.get("/users/{user_id}/tasks", response_model=List[TaskResponse])
async def list_tasks(
    user_id: int,
    status_filter: Optional[str] = None,
    authenticated_user_id: str = Depends(get_current_user_id)
) -> List[TaskResponse]:
    """
    List tasks for the authenticated user with optional filtering.
    Verifies that the user_id in the URL matches the authenticated user.
    Filters: 'pending' (completed=false), 'completed' (completed=true), 'all' (no filter)
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(user_id) != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID in URL does not match authenticated user"
        )

    # Build query with user_id filter (always applied)
    query = select(Task).where(Task.user_id == user_id)

    # Apply status filter if provided
    if status_filter:
        status_filter_lower = status_filter.lower()
        if status_filter_lower == "pending":
            query = query.where(Task.completed == False)
        elif status_filter_lower == "completed":
            query = query.where(Task.completed == True)
        elif status_filter_lower != "all":
            # If it's not 'all', 'pending', or 'completed', raise an error
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status filter must be 'all', 'pending', or 'completed'"
            )

    # Execute query
    engine = get_engine()
    with Session(engine) as session:
        tasks = session.exec(query).all()

        # Convert to response models
        task_responses = [
            TaskResponse(
                id=task.id,
                user_id=task.user_id,
                title=task.title,
                description=task.description,
                completed=task.completed,
                created_at=task.created_at
            )
            for task in tasks
        ]

        return task_responses


@router.get("/users/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: int,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user_id)
) -> TaskResponse:
    """
    Get a single task by ID with ownership verification.
    Verifies that the user_id in the URL matches the authenticated user
    and that the task belongs to the authenticated user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(user_id) != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID in URL does not match authenticated user"
        )

    # Fetch the task from the database
    engine = get_engine()
    with Session(engine) as session:
        task = session.get(Task, task_id)

        # Check if task exists
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Verify that the task belongs to the authenticated user
        if task.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Task does not belong to the authenticated user"
            )

        # Return the task
        return TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at
        )


@router.put("/users/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: int,
    task_id: int,
    task_update: TaskUpdate,
    authenticated_user_id: str = Depends(get_current_user_id)
) -> TaskResponse:
    """
    Update a task by ID with ownership verification.
    Verifies that the user_id in the URL matches the authenticated user
    and that the task belongs to the authenticated user.
    Updates only provided fields.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(user_id) != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID in URL does not match authenticated user"
        )

    # Fetch the task from the database
    engine = get_engine()
    with Session(engine) as session:
        task = session.get(Task, task_id)

        # Check if task exists
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Verify that the task belongs to the authenticated user
        if task.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Task does not belong to the authenticated user"
            )

        # Validate title if provided
        if task_update.title is not None:
            if len(task_update.title.strip()) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Title cannot be empty"
                )
            if len(task_update.title) > 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Title must be 200 characters or less"
                )

        # Update task fields only if provided in the request
        if task_update.title is not None:
            task.title = task_update.title.strip()
        if task_update.description is not None:
            task.description = task_update.description

        # Update the updated_at timestamp
        task.updated_at = datetime.utcnow()

        # Commit changes to database
        session.add(task)
        session.commit()
        session.refresh(task)

        # Return the updated task
        return TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at
        )


@router.delete("/users/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: int,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user_id)
) -> None:
    """
    Delete a task by ID with ownership verification.
    Verifies that the user_id in the URL matches the authenticated user
    and that the task belongs to the authenticated user.
    Returns 204 No Content on success.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(user_id) != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID in URL does not match authenticated user"
        )

    # Fetch the task from the database
    engine = get_engine()
    with Session(engine) as session:
        task = session.get(Task, task_id)

        # Check if task exists
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Verify that the task belongs to the authenticated user
        if task.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Task does not belong to the authenticated user"
            )

        # Delete the task from the database
        session.delete(task)
        session.commit()

        # Return 204 No Content
        return None


@router.patch("/users/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(
    user_id: int,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user_id)
) -> TaskResponse:
    """
    Toggle a task's completion status by ID with ownership verification.
    Verifies that the user_id in the URL matches the authenticated user
    and that the task belongs to the authenticated user.
    Toggles the completed field: True -> False, False -> True
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(user_id) != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID in URL does not match authenticated user"
        )

    # Fetch the task from the database
    engine = get_engine()
    with Session(engine) as session:
        task = session.get(Task, task_id)

        # Check if task exists
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Verify that the task belongs to the authenticated user
        if task.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Task does not belong to the authenticated user"
            )

        # Toggle the completion status
        task.completed = not task.completed

        # Update the updated_at timestamp
        task.updated_at = datetime.utcnow()

        # Commit changes to database
        session.add(task)
        session.commit()
        session.refresh(task)

        # Return the updated task
        return TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at
        )