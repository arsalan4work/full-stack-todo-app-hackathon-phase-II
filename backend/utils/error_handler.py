"""
Custom exception classes and error handling utilities for the Todo application.
"""

from typing import Dict, Any
from fastapi import HTTPException, status


class TaskNotFoundError(Exception):
    """Raised when a task is not found in the database."""

    def __init__(self, task_id: int, message: str = None):
        self.task_id = task_id
        self.error_code = "TASK_NOT_FOUND"
        if message is None:
            message = f"Task with ID {task_id} not found"
        super().__init__(message)


class UnauthorizedTaskAccessError(Exception):
    """Raised when a user attempts to access a task they don't own."""

    def __init__(self, task_id: int, user_id: int, message: str = None):
        self.task_id = task_id
        self.user_id = user_id
        self.error_code = "UNAUTHORIZED_TASK_ACCESS"
        if message is None:
            message = f"User {user_id} does not have access to task {task_id}"
        super().__init__(message)


class ValidationError(Exception):
    """Raised when validation fails for input data."""

    def __init__(self, field: str, message: str, error_code: str = "VALIDATION_ERROR"):
        self.field = field
        self.error_code = error_code
        super().__init__(f"Validation failed for {field}: {message}")


class DatabaseConnectionError(Exception):
    """Raised when there are issues connecting to the database."""

    def __init__(self, message: str = "Database connection failed"):
        self.error_code = "DATABASE_CONNECTION_ERROR"
        super().__init__(message)


class APIServiceError(Exception):
    """Raised when external API services fail."""

    def __init__(self, service_name: str, message: str):
        self.service_name = service_name
        self.error_code = "API_SERVICE_ERROR"
        super().__init__(f"{service_name} API error: {message}")


class ToolExecutionError(Exception):
    """Raised when tool execution fails."""

    def __init__(self, tool_name: str, message: str, error_code: str = "TOOL_EXECUTION_ERROR"):
        self.tool_name = tool_name
        self.error_code = error_code
        super().__init__(f"Tool {tool_name} execution failed: {message}")


def format_error_response(error_message: str, error_code: str, details: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Format a structured error response.

    Args:
        error_message: Human-readable error message
        error_code: Machine-readable error code
        details: Additional error details

    Returns:
        Dictionary with structured error information
    """
    response = {
        "error": error_message,
        "code": error_code
    }

    if details:
        response["details"] = details

    return response


def handle_exception_as_http_error(exception: Exception, default_status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR) -> HTTPException:
    """
    Convert application exceptions to appropriate HTTP exceptions.

    Args:
        exception: The caught exception
        default_status_code: Default status code if no specific mapping exists

    Returns:
        HTTPException with appropriate status code and message
    """
    if isinstance(exception, TaskNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(str(exception), exception.error_code)
        )
    elif isinstance(exception, UnauthorizedTaskAccessError):
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=format_error_response(str(exception), exception.error_code)
        )
    elif isinstance(exception, ValidationError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=format_error_response(str(exception), exception.error_code)
        )
    elif isinstance(exception, DatabaseConnectionError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=format_error_response(str(exception), exception.error_code)
        )
    else:
        # For unknown exceptions, return a generic 500 error
        return HTTPException(
            status_code=default_status_code,
            detail=format_error_response(
                "An unexpected error occurred",
                "INTERNAL_ERROR",
                {"original_error": str(type(exception).__name__)}
            )
        )


def validate_task_id(task_id: int) -> None:
    """Validate that task_id is a positive integer."""
    if not isinstance(task_id, int) or task_id <= 0:
        raise ValidationError(
            field="task_id",
            message=f"Task ID must be a positive integer, got {task_id}",
            error_code="INVALID_TASK_ID"
        )


def validate_title_length(title: str) -> None:
    """Validate that title length is between 1 and 200 characters."""
    if not isinstance(title, str):
        raise ValidationError(
            field="title",
            message="Title must be a string",
            error_code="INVALID_TITLE_TYPE"
        )

    if len(title) < 1:
        raise ValidationError(
            field="title",
            message="Title cannot be empty",
            error_code="EMPTY_TITLE"
        )

    if len(title) > 200:
        raise ValidationError(
            field="title",
            message=f"Title is too long ({len(title)} characters), maximum is 200",
            error_code="TITLE_TOO_LONG"
        )