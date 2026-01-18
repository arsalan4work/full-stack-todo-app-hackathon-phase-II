"""MCP server for task management tools."""
import asyncio
from mcp.server import Server
from mcp import Tool
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from .tools.task_tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task
)


# Initialize MCP server
server = Server("task-manager")


# Define parameter models for each tool
class AddTaskParams(BaseModel):
    user_id: str = Field(..., description="The ID of the user creating the task")
    title: str = Field(..., description="The title of the task")
    description: Optional[str] = Field(None, description="Optional description of the task")


class ListTasksParams(BaseModel):
    user_id: str = Field(..., description="The ID of the user whose tasks to list")
    status: str = Field("all", description="Filter by status (all, pending, completed)")


class CompleteTaskParams(BaseModel):
    user_id: str = Field(..., description="The ID of the user requesting the change")
    task_id: int = Field(..., description="The ID of the task to complete")


class DeleteTaskParams(BaseModel):
    user_id: str = Field(..., description="The ID of the user requesting deletion")
    task_id: int = Field(..., description="The ID of the task to delete")


class UpdateTaskParams(BaseModel):
    user_id: str = Field(..., description="The ID of the user requesting update")
    task_id: int = Field(..., description="The ID of the task to update")
    title: Optional[str] = Field(None, description="New title (optional)")
    description: Optional[str] = Field(None, description="New description (optional)")


# Define result models for each tool
class TaskResult(BaseModel):
    task_id: int
    status: str
    title: str


class ListResult(BaseModel):
    id: int
    title: str
    completed: bool
    description: str


# Register tools using the server instance
server.list_tools = lambda: [
    Tool(
        name="add_task",
        description="Add a new task to the database",
        input_schema={
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "The ID of the user creating the task"},
                "title": {"type": "string", "description": "The title of the task"},
                "description": {"type": "string", "description": "Optional description of the task"}
            },
            "required": ["user_id", "title"]
        }
    ),
    Tool(
        name="list_tasks",
        description="List tasks for a specific user",
        input_schema={
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "The ID of the user whose tasks to list"},
                "status": {"type": "string", "description": "Filter by status (all, pending, completed)", "default": "all"}
            },
            "required": ["user_id"]
        }
    ),
    Tool(
        name="complete_task",
        description="Mark a task as completed",
        input_schema={
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "The ID of the user requesting the change"},
                "task_id": {"type": "integer", "description": "The ID of the task to complete"}
            },
            "required": ["user_id", "task_id"]
        }
    ),
    Tool(
        name="delete_task",
        description="Delete a task from the database",
        input_schema={
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "The ID of the user requesting deletion"},
                "task_id": {"type": "integer", "description": "The ID of the task to delete"}
            },
            "required": ["user_id", "task_id"]
        }
    ),
    Tool(
        name="update_task",
        description="Update a task's fields",
        input_schema={
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "The ID of the user requesting update"},
                "task_id": {"type": "integer", "description": "The ID of the task to update"},
                "title": {"type": "string", "description": "New title (optional)"},
                "description": {"type": "string", "description": "New description (optional)"}
            },
            "required": ["user_id", "task_id"]
        }
    )
]


# Define tool call handler
async def handle_tool_calls(name: str, arguments: dict):
    """Handle tool calls by dispatching to the appropriate function."""
    if name == "add_task":
        result = add_task(
            user_id=arguments["user_id"],
            title=arguments["title"],
            description=arguments.get("description")
        )
    elif name == "list_tasks":
        result = list_tasks(
            user_id=arguments["user_id"],
            status=arguments.get("status", "all")
        )
    elif name == "complete_task":
        result = complete_task(
            user_id=arguments["user_id"],
            task_id=arguments["task_id"]
        )
    elif name == "delete_task":
        result = delete_task(
            user_id=arguments["user_id"],
            task_id=arguments["task_id"]
        )
    elif name == "update_task":
        result = update_task(
            user_id=arguments["user_id"],
            task_id=arguments["task_id"],
            title=arguments.get("title"),
            description=arguments.get("description")
        )
    else:
        result = {"error": f"Unknown tool: {name}"}

    return result

# Register the tool call handler with the server
server.call_tool = handle_tool_calls


async def serve():
    """Start the MCP server."""
    async with server:
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    asyncio.run(serve())