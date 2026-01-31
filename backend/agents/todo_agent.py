"""OpenAI Agent for task management using MCP tools."""
import os
import time
import logging
from typing import Dict, Any, List, Tuple
from openai import OpenAI
from openai import RateLimitError, APIConnectionError, APITimeoutError, AuthenticationError
from config import OPENAI_API_KEY, OPENAI_MODEL, AGENT_TEMPERATURE, MAX_TOKENS
from utils.error_handler import APIServiceError

OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")

class TodoAgent:
    def __init__(self):
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")

        # FIX: Create OpenAI client instance instead of assigning the API key string
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL
        self._assistant = None  # Lazy initialization

        # Import MCP tools
        from task_mcp.tools.task_tools import (
            add_task,
            list_tasks,
            complete_task,
            delete_task,
            update_task
        )

        # Define the tools for the agent using the OpenAI Assistants API format
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task to the database",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user creating the task"},
                            "title": {"type": "string", "description": "The title of the task"},
                            "description": {"type": "string", "description": "Optional description of the task"}
                        },
                        "required": ["user_id", "title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List tasks for a specific user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user whose tasks to list"},
                            "status": {"type": "string", "description": "Filter by status (all, pending, completed)", "default": "all"}
                        },
                        "required": ["user_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user requesting the change"},
                            "task_id": {"type": "integer", "description": "The ID of the task to complete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task from the database",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user requesting deletion"},
                            "task_id": {"type": "integer", "description": "The ID of the task to delete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update a task's fields",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user requesting update"},
                            "task_id": {"type": "integer", "description": "The ID of the task to update"},
                            "title": {"type": "string", "description": "New title (optional)"},
                            "description": {"type": "string", "description": "New description (optional)"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            }
        ]

    def _get_assistant(self):
        """Lazy initialization of the assistant"""
        if self._assistant is None:
            self._assistant = self.client.beta.assistants.create(
                name="Todo Assistant",
                description="An AI assistant that helps users manage their todo list",
                model=self.model,
                instructions=(
                    "You are a helpful task management assistant. You help users manage their todo list "
                    "through natural language. When users ask to add, view, complete, delete, or update "
                    "tasks, use the appropriate tool. Always confirm actions with friendly responses."
                ),
                tools=self.tools
            )
        return self._assistant

    def run_agent(self, user_id: str, conversation_history: List[Dict[str, str]], new_message: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Run the agent with the given user context and message.

        Args:
            user_id: The ID of the user interacting with the agent
            conversation_history: List of previous messages in the conversation
            new_message: The new message from the user

        Returns:
            Tuple of (response_text, tool_calls_made)
        """
        # Try to run the agent with retry logic for transient errors
        max_retries = 3
        retry_count = 0

        while retry_count < max_retries:
            try:
                # Get the assistant (creating it if needed)
                assistant = self._get_assistant()

                # Create a thread for the conversation
                thread = self.client.beta.threads.create()

                # Add the user's message to the thread
                self.client.beta.threads.messages.create(
                    thread_id=thread.id,
                    role="user",
                    content=new_message
                )

                # Run the assistant
                run = self.client.beta.threads.runs.create(
                    thread_id=thread.id,
                    assistant_id=assistant.id
                )

                # Wait for the run to complete
                import time
                while run.status in ["queued", "in_progress"]:
                    time.sleep(0.5)
                    run = self.client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

                # Get the messages from the thread
                messages = self.client.beta.threads.messages.list(thread_id=thread.id)

                # Find the latest assistant message
                assistant_message = None
                for msg in messages.data:
                    if msg.role == "assistant":
                        assistant_message = msg
                        break

                content = ""
                if assistant_message and assistant_message.content:
                    content = assistant_message.content[0].text.value if assistant_message.content[0].type == "text" else ""

                # Extract tool calls that were made
                tool_calls = []
                run_steps = self.client.beta.threads.runs.steps.list(thread_id=thread.id, run_id=run.id)

                for step in run_steps.data:
                    if step.type == "tool_calls":
                        for tool_call in step.step_details.tool_calls:
                            if tool_call.type == "function":
                                tool_calls.append({
                                    "name": tool_call.function.name,
                                    "arguments": eval(tool_call.function.arguments),
                                    "id": tool_call.id
                                })

                return content, tool_calls

            except (RateLimitError, APITimeoutError) as e:
                retry_count += 1
                logging.warning(f"Transient error in agent execution (attempt {retry_count}/{max_retries}): {str(e)}")

                if retry_count >= max_retries:
                    # All retries exhausted, raise an API service error
                    if isinstance(e, RateLimitError):
                        raise APIServiceError("OpenAI", "Rate limit exceeded. Please try again later.")
                    else:
                        raise APIServiceError("OpenAI", "Request timed out. Service temporarily unavailable.")

                # Wait before retry with exponential backoff
                time.sleep(2 ** retry_count)

            except AuthenticationError as e:
                logging.error(f"Authentication error in agent execution: {str(e)}")
                raise APIServiceError("OpenAI", "Authentication failed. Invalid API key.")

            except APIConnectionError as e:
                logging.error(f"Connection error in agent execution: {str(e)}")
                raise APIServiceError("OpenAI", "Failed to connect to OpenAI service. Please check your connection.")

            except Exception as e:
                logging.error(f"Unexpected error in agent execution: {str(e)}", exc_info=True)

                # Handle tool execution failures gracefully
                if "tool" in str(e).lower() or "function" in str(e).lower():
                    # Inform user of tool execution failure in natural language
                    error_content = "I encountered an issue while trying to perform that action. Please try rephrasing your request or contact support if the problem persists."
                    return error_content, []

                # For other unexpected errors, raise as API service error
                raise APIServiceError("OpenAI", f"Service temporarily unavailable: {str(e)}")

    def __del__(self):
        """Cleanup assistant when the object is destroyed"""
        try:
            if self._assistant is not None:
                self.client.beta.assistants.delete(self._assistant.id)
        except:
            pass  # Ignore cleanup errors


# Global instance of the agent (lazy initialization)
_todo_agent_instance = None


def get_agent():
    """Get or create the global agent instance"""
    global _todo_agent_instance
    if _todo_agent_instance is None:
        _todo_agent_instance = TodoAgent()
    return _todo_agent_instance


def run_agent(user_id: str, conversation_history: List[Dict[str, str]], new_message: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Wrapper function to run the agent.

    Args:
        user_id: The ID of the user interacting with the agent
        conversation_history: List of previous messages in the conversation
        new_message: The new message from the user

    Returns:
        Tuple of (response_text, tool_calls_made)
    """
    agent = get_agent()
    return agent.run_agent(user_id, conversation_history, new_message)