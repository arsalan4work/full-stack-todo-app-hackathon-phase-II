---
name: mcp-python-sdk-skill
description: Build Model Context Protocol (MCP) servers and clients using the official Python SDK. Use when creating MCP servers that expose resources, tools, and prompts to LLM applications, or building clients that connect to MCP servers. Supports FastMCP (high-level) and low-level APIs, multiple transports (stdio, SSE, StreamableHTTP), and production patterns including authentication, pagination, and structured output.
---

# MCP Python SDK Skill

## Instructions

Build production-ready MCP servers and clients using the Model Context Protocol Python SDK:

### 1. **Installation & Setup**

#### Install MCP SDK
```bash
# With UV (recommended)
uv add "mcp[cli]"

# With pip
pip install "mcp[cli]"
```

#### Project Structure
```
mcp-server/
├── server.py          # MCP server implementation
├── .env              # Environment variables
├── pyproject.toml    # Dependencies
└── README.md
```

### 2. **Core Imports**
```python
# FastMCP (recommended for most use cases)
from mcp.server.fastmcp import FastMCP, Context, Image
from mcp.server.fastmcp.prompts import base

# Low-level server (for advanced control)
from mcp.server.lowlevel import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.types as types

# Client
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.client.streamable_http import streamablehttp_client

# Types
from mcp.types import (
    Resource,
    Tool,
    Prompt,
    TextContent,
    ImageContent,
    CallToolResult,
)
```

### 3. **FastMCP Server (High-Level API)**

FastMCP is the recommended way to build MCP servers with minimal boilerplate.

#### Basic Server
```python
from mcp.server.fastmcp import FastMCP

# Create server
mcp = FastMCP("My Server")

# Add a tool
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b

# Add a resource
@mcp.resource("config://settings")
def get_settings() -> str:
    """Get application settings."""
    return '{"theme": "dark", "language": "en"}'

# Add a prompt
@mcp.prompt()
def code_review(code: str) -> str:
    """Generate a code review prompt."""
    return f"Please review this code:\n\n{code}"

# Run server
if __name__ == "__main__":
    mcp.run(transport="stdio")  # or "sse" or "streamable-http"
```

#### Tools with Context
```python
from mcp.server.fastmcp import Context, FastMCP
from mcp.server.session import ServerSession

mcp = FastMCP("Context Example")

@mcp.tool()
async def long_task(
    name: str,
    ctx: Context[ServerSession, None],
    steps: int = 5
) -> str:
    """Execute a long-running task with progress updates."""
    await ctx.info(f"Starting: {name}")
    
    for i in range(steps):
        progress = (i + 1) / steps
        await ctx.report_progress(
            progress=progress,
            total=1.0,
            message=f"Step {i + 1}/{steps}"
        )
    
    return f"Task '{name}' completed"
```

#### Structured Output
```python
from pydantic import BaseModel, Field

class WeatherData(BaseModel):
    """Weather information structure."""
    temperature: float = Field(description="Temperature in Celsius")
    humidity: float
    condition: str
    wind_speed: float

@mcp.tool()
def get_weather(city: str) -> WeatherData:
    """Get weather - returns structured data."""
    return WeatherData(
        temperature=22.5,
        humidity=65.0,
        condition="sunny",
        wind_speed=5.2
    )
```

#### Dynamic Resources
```python
@mcp.resource("file://documents/{name}")
def read_document(name: str) -> str:
    """Read a document by name."""
    # This would normally read from disk
    return f"Content of {name}"
```

### 4. **Tools, Resources & Prompts**

#### Tools
Tools let LLMs take actions through your server.
```python
@mcp.tool()
def search_database(query: str, limit: int = 10) -> list[dict]:
    """Search database for matching records."""
    # Database search logic
    return results

@mcp.tool()
async def call_api(endpoint: str, ctx: Context) -> dict:
    """Call external API with logging."""
    await ctx.info(f"Calling {endpoint}")
    response = await http_client.get(endpoint)
    return response.json()
```

#### Resources
Resources expose data to LLMs (like GET endpoints).
```python
@mcp.resource("database://users")
def get_users() -> str:
    """Get all users as JSON."""
    users = db.query(User).all()
    return json.dumps([u.dict() for u in users])

@mcp.resource("api://status")
def api_status() -> dict:
    """Get API status."""
    return {"status": "healthy", "version": "1.0.0"}
```

#### Prompts
Prompts are reusable templates for LLM interactions.
```python
from mcp.server.fastmcp.prompts import base

@mcp.prompt()
def debug_error(error: str) -> list[base.Message]:
    """Debug assistant prompt."""
    return [
        base.UserMessage("I'm seeing this error:"),
        base.UserMessage(error),
        base.AssistantMessage("I'll help debug that.")
    ]
```

### 5. **Context & Capabilities**

The Context object provides access to MCP capabilities:
```python
@mcp.tool()
async def process_data(
    data: str,
    ctx: Context[ServerSession, None]
) -> str:
    """Process data with full context capabilities."""
    
    # Logging
    await ctx.debug(f"Processing '{data}'")
    await ctx.info("Starting processing")
    await ctx.warning("This is experimental")
    await ctx.error("Error occurred")
    
    # Progress reporting
    await ctx.report_progress(0.5, 1.0, "50% complete")
    
    # Read resources
    resource = await ctx.read_resource("config://settings")
    
    # Notify about changes
    await ctx.session.send_resource_list_changed()
    
    # Access server info
    server_name = ctx.fastmcp.name
    settings = ctx.fastmcp.settings
    
    return f"Processed: {data}"
```

### 6. **Database Integration (SQLModel)**
```python
from sqlmodel import Session, select
from models import Task

@mcp.tool()
def create_task(title: str, description: str, user_id: int) -> dict:
    """Create a new task."""
    with Session(engine) as session:
        task = Task(
            title=title,
            description=description,
            user_id=user_id
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        
        return {
            "id": task.id,
            "title": task.title,
            "completed": task.completed
        }

@mcp.tool()
def get_tasks(user_id: int, status: str = "all") -> list[dict]:
    """Get user tasks with optional status filter."""
    with Session(engine) as session:
        query = select(Task).where(Task.user_id == user_id)
        
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)
        
        tasks = session.exec(query).all()
        return [{"id": t.id, "title": t.title} for t in tasks]
```

### 7. **Lifespan Management**
```python
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

@dataclass
class AppContext:
    """Application context with dependencies."""
    db: Database
    config: AppConfig

@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    """Manage startup/shutdown with resources."""
    # Initialize on startup
    db = await Database.connect()
    config = await load_config()
    
    try:
        yield AppContext(db=db, config=config)
    finally:
        # Cleanup on shutdown
        await db.disconnect()

# Pass lifespan to server
mcp = FastMCP("My App", lifespan=app_lifespan)

@mcp.tool()
def query_with_config(query: str, ctx: Context) -> str:
    """Use lifespan resources."""
    app_ctx: AppContext = ctx.request_context.lifespan_context
    return app_ctx.db.execute(query)
```

### 8. **Running Servers**

#### Development with MCP Inspector
```bash
# Test with inspector
uv run mcp dev server.py

# With dependencies
uv run mcp dev server.py --with pandas --with numpy

# Mount local code
uv run mcp dev server.py --with-editable .
```

#### Claude Desktop Integration
```bash
# Install in Claude Desktop
uv run mcp install server.py

# Custom name
uv run mcp install server.py --name "My Server"

# With environment variables
uv run mcp install server.py -v API_KEY=abc123 -f .env
```

#### Direct Execution
```python
if __name__ == "__main__":
    # stdio transport (for Claude Desktop)
    mcp.run(transport="stdio")
    
    # HTTP transport (for web clients)
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
    
    # SSE transport
    mcp.run(transport="sse", host="0.0.0.0", port=8000)
```

### 9. **StreamableHTTP Transport**
```python
from mcp.server.fastmcp import FastMCP

# Stateful server (maintains session state)
mcp = FastMCP("Stateful Server")

# Stateless server (no session persistence)
# mcp = FastMCP("Stateless", stateless_http=True)

@mcp.tool()
def greet(name: str = "World") -> str:
    """Greet someone."""
    return f"Hello, {name}!"

# Run with streamable HTTP
if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

#### Mounting to Starlette/FastAPI
```python
from starlette.applications import Starlette
from starlette.routing import Mount
from starlette.middleware.cors import CORSMiddleware

# Create MCP servers
api_mcp = FastMCP("API Server", stateless_http=True)
chat_mcp = FastMCP("Chat Server", stateless_http=True)

# Mount at different paths
app = Starlette(
    routes=[
        Mount("/api", api_mcp.streamable_http_app()),
        Mount("/chat", chat_mcp.streamable_http_app()),
    ]
)

# Add CORS for browser clients
app = CORSMiddleware(
    app,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "DELETE"],
    expose_headers=["Mcp-Session-Id"],  # Required for browsers
)
```

### 10. **MCP Clients**

#### Stdio Client
```python
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(
    command="uv",
    args=["run", "server", "my_server", "stdio"]
)

async def run():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize
            await session.initialize()
            
            # List tools
            tools = await session.list_tools()
            print(f"Tools: {[t.name for t in tools.tools]}")
            
            # Call a tool
            result = await session.call_tool("add", {"a": 5, "b": 3})
            print(f"Result: {result.content[0].text}")
            
            # Read a resource
            resource = await session.read_resource("config://settings")
            print(f"Resource: {resource.contents[0].text}")

asyncio.run(run())
```

#### StreamableHTTP Client
```python
from mcp.client.streamable_http import streamablehttp_client

async def main():
    async with streamablehttp_client("http://localhost:8000/mcp") as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            tools = await session.list_tools()
            print(f"Available tools: {[t.name for t in tools.tools]}")

asyncio.run(main())
```

### 11. **Authentication (OAuth 2.1)**

#### Server-Side (Resource Server)
```python
from pydantic import AnyHttpUrl
from mcp.server.auth.provider import AccessToken, TokenVerifier
from mcp.server.auth.settings import AuthSettings

class MyTokenVerifier(TokenVerifier):
    """Custom token verifier."""
    
    async def verify_token(self, token: str) -> AccessToken | None:
        # Validate token against your auth system
        # Return AccessToken if valid, None if invalid
        pass

# Create server as Resource Server
mcp = FastMCP(
    "Protected Server",
    token_verifier=MyTokenVerifier(),
    auth=AuthSettings(
        issuer_url=AnyHttpUrl("https://auth.example.com"),
        resource_server_url=AnyHttpUrl("http://localhost:3001"),
        required_scopes=["user"],
    ),
)

@mcp.tool()
async def get_user_data(user_id: int) -> dict:
    """Protected tool requiring authentication."""
    return {"id": user_id, "name": "Alice"}
```

#### Client-Side (OAuth Flow)
```python
from mcp.client.auth import OAuthClientProvider, TokenStorage
from mcp.shared.auth import OAuthClientMetadata

class InMemoryTokenStorage(TokenStorage):
    """Token storage implementation."""
    # Implement get_tokens, set_tokens, etc.
    pass

oauth_auth = OAuthClientProvider(
    server_url="http://localhost:8001",
    client_metadata=OAuthClientMetadata(
        client_name="My Client",
        redirect_uris=[AnyHttpUrl("http://localhost:3000/callback")],
        grant_types=["authorization_code", "refresh_token"],
        response_types=["code"],
        scope="user",
    ),
    storage=InMemoryTokenStorage(),
    redirect_handler=handle_redirect,
    callback_handler=handle_callback,
)

async with streamablehttp_client(
    "http://localhost:8001/mcp",
    auth=oauth_auth
) as (read, write, _):
    # Client automatically handles OAuth flow
    pass
```

### 12. **Low-Level Server (Advanced)**

For full protocol control:
```python
from mcp.server.lowlevel import Server
import mcp.types as types

server = Server("advanced-server")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """List available tools."""
    return [
        types.Tool(
            name="calculate",
            description="Perform calculation",
            inputSchema={
                "type": "object",
                "properties": {
                    "expression": {"type": "string"}
                },
                "required": ["expression"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(
    name: str,
    arguments: dict
) -> list[types.TextContent]:
    """Handle tool calls."""
    if name == "calculate":
        result = eval(arguments["expression"])
        return [types.TextContent(type="text", text=str(result))]
    
    raise ValueError(f"Unknown tool: {name}")
```

### 13. **Pagination (Advanced)**
```python
from mcp.types import ListResourcesRequest, ListResourcesResult

ITEMS = [f"Item {i}" for i in range(1, 101)]  # 100 items

@server.list_resources()
async def list_resources_paginated(
    request: ListResourcesRequest
) -> ListResourcesResult:
    """List resources with pagination."""
    page_size = 10
    
    # Extract cursor
    cursor = request.params.cursor if request.params else None
    start = 0 if cursor is None else int(cursor)
    end = start + page_size
    
    # Get page
    page_items = [
        types.Resource(
            uri=AnyUrl(f"resource://items/{item}"),
            name=item
        )
        for item in ITEMS[start:end]
    ]
    
    # Next cursor
    next_cursor = str(end) if end < len(ITEMS) else None
    
    return ListResourcesResult(
        resources=page_items,
        nextCursor=next_cursor
    )
```

## Best Practices

### Server Development
- ✅ Use FastMCP for most servers (simpler, less boilerplate)
- ✅ Use low-level server only when you need full protocol control
- ✅ Implement proper error handling in all tools
- ✅ Use structured output (Pydantic models) for complex data
- ✅ Add progress reporting for long-running operations
- ✅ Use lifespan for resource initialization/cleanup
- ✅ Validate inputs with type hints and Pydantic
- ✅ Log important events using context methods

### Client Development
- ✅ Always initialize sessions before use
- ✅ Handle connection errors gracefully
- ✅ Parse tool results based on content type
- ✅ Use `get_display_name()` for user-friendly names
- ✅ Implement proper OAuth token storage
- ✅ Handle pagination for large datasets

### Production
- ✅ Use StreamableHTTP transport for scalability
- ✅ Implement authentication for protected resources
- ✅ Add CORS headers for browser clients
- ✅ Use environment variables for configuration
- ✅ Implement proper logging and monitoring
- ✅ Test with MCP Inspector before deployment
- ✅ Add health check endpoints

## Common Patterns

### Task Management Server
```python
mcp = FastMCP("Task Manager")

@mcp.tool()
def create_task(title: str, user_id: int) -> dict:
    """Create task in database."""
    # Database logic
    pass

@mcp.tool()
def list_tasks(user_id: int, status: str = "all") -> list[dict]:
    """List user tasks."""
    # Database query
    pass

@mcp.resource("tasks://{user_id}")
def get_user_tasks(user_id: int) -> str:
    """Get tasks as resource."""
    # Return JSON
    pass
```

### API Integration Server
```python
@mcp.tool()
async def call_external_api(
    endpoint: str,
    ctx: Context
) -> dict:
    """Call external API with logging."""
    await ctx.info(f"Calling {endpoint}")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(endpoint)
        return response.json()
```

### File Processing Server
```python
@mcp.resource("file://{path}")
def read_file(path: str) -> str:
    """Read file content."""
    with open(path) as f:
        return f.read()

@mcp.tool()
def process_file(path: str) -> dict:
    """Process file and return metadata."""
    # Processing logic
    pass
```