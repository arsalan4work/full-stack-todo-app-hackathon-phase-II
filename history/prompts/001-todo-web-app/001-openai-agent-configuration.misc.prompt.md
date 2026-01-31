---
id: 001
title: OpenAI Agent Configuration
stage: misc
date_iso: 2026-01-19
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-todo-web-app
branch: 001-todo-web-app
user: claude
command: "OpenAI Agent Configuration\n\n@openai-agents-python-expert: Setup OpenAI Agents SDK with MCP tool integration.\n\n**Context:**\nWe're using OpenAI's Agents SDK to create an AI assistant that can call MCP tools to manage tasks.\n\n**Tasks:**\n\n1. Create `backend/agents/todo_agent.py`:\n   - Initialize OpenAI client with API key from env\n   - Create agent with model \"gpt-4o\" (or \"gpt-4o-mini\")\n   - Configure agent with system instructions:\n```\n     You are a helpful task management assistant. You help users manage their todo list \n     through natural language. When users ask to add, view, complete, delete, or update \n     tasks, use the appropriate tool. Always confirm actions with friendly responses.\n```\n   - Register MCP tools with agent (import from backend.mcp.tools)\n   - Create run_agent() function that:\n     * Takes: user_id, conversation_history (list of messages), new_message\n     * Builds complete message array\n     * Runs agent with messages\n     * Returns agent response and tool calls made\n\n2. Create `backend/agents/message_builder.py`:\n   - Function: build_messages(conversation_history, new_message)\n   - Converts database messages to OpenAI format:\n```python\n     [\n       {\"role\": \"user\", \"content\": \"Add buy groceries\"},\n       {\"role\": \"assistant\", \"content\": \"I've added...\"}\n     ]\n```\n   - Appends new_message to array\n\n3. Add agent configuration in `backend/config.py`:\n   - OPENAI_MODEL = \"gpt-4o-mini\"\n   - AGENT_TEMPERATURE = 0.7\n   - MAX_TOKENS = 1000\n\n**Acceptance Criteria:**\n- Agent initialized with OpenAI API key\n- System instructions clearly define assistant behavior\n- All 5 MCP tools registered with agent\n- run_agent() returns both response text and tool_calls array\n- Messages properly formatted for OpenAI API\n- Agent can chain multiple tools in one response\n\n**Skills:** python-development-standards-skill\n\n**Environment Variables:**\nEnsure OPENAI_API_KEY is set in .env\n\n**Output:**\nCreate PHR documenting:\n- Agent configuration\n- System instructions\n- Registered tools\n- run_agent() function signature"
labels:
  - openai
  - agent
  - mcp
  - todo
  - python
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - backend/config.py
  - backend/agents/__init__.py
  - backend/agents/todo_agent.py
  - backend/agents/message_builder.py
tests_yaml: |
  - backend/test_agent_setup.py
  - backend/test_todo_agent.py
---

# OpenAI Agent Configuration

## Prompt Text

```
OpenAI Agent Configuration

@openai-agents-python-expert: Setup OpenAI Agents SDK with MCP tool integration.

**Context:**
We're using OpenAI's Agents SDK to create an AI assistant that can call MCP tools to manage tasks.

**Tasks:**

1. Create `backend/agents/todo_agent.py`:
   - Initialize OpenAI client with API key from env
   - Create agent with model "gpt-4o" (or "gpt-4o-mini")
   - Configure agent with system instructions:
```
     You are a helpful task management assistant. You help users manage their todo list
     through natural language. When users ask to add, view, complete, delete, or update
     tasks, use the appropriate tool. Always confirm actions with friendly responses.
```
   - Register MCP tools with agent (import from backend.mcp.tools)
   - Create run_agent() function that:
     * Takes: user_id, conversation_history (list of messages), new_message
     * Builds complete message array
     * Runs agent with messages
     * Returns agent response and tool calls made

2. Create `backend/agents/message_builder.py`:
   - Function: build_messages(conversation_history, new_message)
   - Converts database messages to OpenAI format:
```python
     [
       {"role": "user", "content": "Add buy groceries"},
       {"role": "assistant", "content": "I've added..."}
     ]
```
   - Appends new_message to array

3. Add agent configuration in `backend/config.py`:
   - OPENAI_MODEL = "gpt-4o-mini"
   - AGENT_TEMPERATURE = 0.7
   - MAX_TOKENS = 1000

**Acceptance Criteria:**
- Agent initialized with OpenAI API key
- System instructions clearly define assistant behavior
- All 5 MCP tools registered with agent
- run_agent() returns both response text and tool_calls array
- Messages properly formatted for OpenAI API
- Agent can chain multiple tools in one response

**Skills:** python-development-standards-skill

**Environment Variables:**
Ensure OPENAI_API_KEY is set in .env

**Output:**
Create PHR documenting:
- Agent configuration
- System instructions
- Registered tools
- run_agent() function signature
```

## Response Text

Successfully implemented the OpenAI Agent Configuration for the todo application. Created the following components:

1. **backend/config.py**: Added OpenAI configuration settings:
   - OPENAI_API_KEY from environment variables
   - OPENAI_MODEL = "gpt-4o-mini"
   - AGENT_TEMPERATURE = 0.7
   - MAX_TOKENS = 1000

2. **backend/agents/todo_agent.py**: Implemented the TodoAgent class with:
   - OpenAI client initialization using API key from environment
   - Five MCP tools registered (add_task, list_tasks, complete_task, delete_task, update_task)
   - System instructions defining the assistant behavior
   - run_agent() function that accepts user_id, conversation_history, and new_message
   - Returns both response text and tool calls made

3. **backend/agents/message_builder.py**: Implemented build_messages() function that:
   - Converts conversation history to OpenAI message format
   - Properly structures messages with role and content
   - Appends new message to the conversation array

4. **Additional files created**:
   - backend/agents/__init__.py for package structure
   - backend/test_agent_setup.py for basic functionality verification
   - backend/test_todo_agent.py for comprehensive testing

The implementation satisfies all acceptance criteria:
- Agent is initialized with OpenAI API key from environment
- System instructions clearly define the assistant's behavior
- All 5 MCP tools are registered with the agent
- run_agent() function returns both response text and tool_calls array
- Messages are properly formatted for the OpenAI API
- The agent is capable of chaining multiple tools in one response

## Outcome

The OpenAI Todo Agent is successfully configured and tested. It integrates with the existing MCP tools to provide natural language task management capabilities. The agent can be invoked with user context and conversation history to process natural language requests for adding, viewing, completing, deleting, or updating tasks.

## Evaluation

All implementation requirements have been met:
- ✅ OpenAI agent configured with proper system instructions
- ✅ All 5 MCP tools integrated and registered
- ✅ run_agent() function with correct signature and return values
- ✅ Message builder for proper conversation formatting
- ✅ Configuration settings in config.py
- ✅ Comprehensive tests created and passing