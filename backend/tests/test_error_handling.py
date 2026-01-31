"""
Test cases for error handling and validation features.
"""
import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from sqlmodel import Session

# Add the backend directory to the path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from utils.error_handler import (
    TaskNotFoundError,
    UnauthorizedTaskAccessError,
    ValidationError,
    DatabaseConnectionError,
    APIServiceError,
    ToolExecutionError,
    validate_task_id,
    validate_title_length
)




class TestErrorHandlerUtils:
    """Test the error handler utility functions."""

    def test_validate_task_id_valid(self):
        """Test that valid task IDs pass validation."""
        # Should not raise an exception
        validate_task_id(1)
        validate_task_id(100)

    def test_validate_task_id_invalid(self):
        """Test that invalid task IDs raise ValidationError."""
        with pytest.raises(ValidationError):
            validate_task_id(0)

        with pytest.raises(ValidationError):
            validate_task_id(-1)

        with pytest.raises(ValidationError):
            validate_task_id("invalid")

    def test_validate_title_length_valid(self):
        """Test that valid titles pass validation."""
        # Should not raise an exception
        validate_title_length("Valid title")
        validate_title_length("A" * 200)  # Maximum length

    def test_validate_title_length_invalid(self):
        """Test that invalid titles raise ValidationError."""
        with pytest.raises(ValidationError):
            validate_title_length("")

        with pytest.raises(ValidationError):
            validate_title_length("A" * 201)  # Too long

        with pytest.raises(ValidationError):
            validate_title_length(None)

    def test_custom_exceptions(self):
        """Test that custom exceptions work correctly."""
        # Test TaskNotFoundError
        with pytest.raises(TaskNotFoundError) as exc_info:
            raise TaskNotFoundError(task_id=123)
        assert exc_info.value.task_id == 123
        assert exc_info.value.error_code == "TASK_NOT_FOUND"

        # Test UnauthorizedTaskAccessError
        with pytest.raises(UnauthorizedTaskAccessError) as exc_info:
            raise UnauthorizedTaskAccessError(task_id=123, user_id=456)
        assert exc_info.value.task_id == 123
        assert exc_info.value.user_id == 456
        assert exc_info.value.error_code == "UNAUTHORIZED_TASK_ACCESS"

        # Test ValidationError
        with pytest.raises(ValidationError) as exc_info:
            raise ValidationError(field="test_field", message="test message")
        assert exc_info.value.field == "test_field"
        assert exc_info.value.error_code == "VALIDATION_ERROR"

        # Test DatabaseConnectionError
        with pytest.raises(DatabaseConnectionError):
            raise DatabaseConnectionError()

        # Test APIServiceError
        with pytest.raises(APIServiceError) as exc_info:
            raise APIServiceError(service_name="TestService", message="Test error")
        assert exc_info.value.service_name == "TestService"

        # Test ToolExecutionError
        with pytest.raises(ToolExecutionError) as exc_info:
            raise ToolExecutionError(tool_name="test_tool", message="test error")
        assert exc_info.value.tool_name == "test_tool"


class TestMCPToolsErrorHandling:
    """Test MCP tools error handling."""

    def test_format_error_response(self):
        """Test that error responses are formatted correctly."""
        from backend.utils.error_handler import format_error_response

        # Test basic error response
        response = format_error_response("Test error", "TEST_CODE")
        assert response["error"] == "Test error"
        assert response["code"] == "TEST_CODE"

        # Test error response with details
        response = format_error_response("Test error", "TEST_CODE", {"field": "value"})
        assert response["details"]["field"] == "value"


if __name__ == "__main__":
    pytest.main([__file__])