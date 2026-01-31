"""
Configuration for pytest tests.
"""
import pytest
import sys
import os
from fastapi.testclient import TestClient

# Add the backend directory to the path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest.fixture(scope="module")
def test_client():
    """Create a test client for the API."""
    client = TestClient(app)
    yield client


def pytest_configure(config):
    """Configure pytest."""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )