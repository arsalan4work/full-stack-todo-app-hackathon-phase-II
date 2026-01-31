# Agent Behavior and MCP Tools Tests

This directory contains test suites for verifying agent behavior and MCP (Model Context Protocol) tools.

## Test Files

### `test_agent_behavior.py`
Tests for natural language command understanding and how the agent maps user commands to appropriate MCP tools:

- **Test 1**: Task Creation - Maps "Add a task to buy groceries" to `add_task` with title="Buy groceries"
- **Test 2**: Task Listing - Maps "Show me all my tasks" to `list_tasks` with status="all"
- **Test 3**: Task Completion - Maps "Mark task 3 as complete" to `complete_task` with task_id=3
- **Test 4**: Task Deletion - Maps "Delete the meeting task" to sequence of `list_tasks` then `delete_task`
- **Test 5**: Task Update - Maps "Change task 1 to 'Call mom tonight'" to `update_task` with task_id=1, title="Call mom tonight"

### `test_mcp_tools.py`
Tests for each MCP tool implementation:
- `add_task` tool
- `list_tasks` tool
- `complete_task` tool
- `delete_task` tool
- `update_task` tool
- MCP server initialization
- MCP protocol compliance

## Running Tests

Execute all tests from the backend directory:

```bash
cd backend
python -m pytest tests/ -v
```

Or run individual test files:

```bash
python -m pytest tests/test_agent_behavior.py -v
python -m pytest tests/test_mcp_tools.py -v
```

Alternatively, run the test runner:

```bash
python run_tests.py
```

## Purpose

These tests validate that:
1. Natural language commands are correctly interpreted by the agent
2. Appropriate MCP tools are called with correct parameters
3. MCP tools follow expected patterns and conventions
4. The system correctly handles command-to-tool mapping scenarios