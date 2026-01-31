---
name: openai-chatkit-python-skill
description: Build production-ready AI chat interfaces using OpenAI's ChatKit Python SDK. Use when creating chat applications with threads, widgets, actions, streaming responses, file uploads, and interactive UI components. Perfect for customer support bots, internal assistants, knowledge bases, and conversational AI experiences with FastAPI backends.
---

# ChatKit Python SDK Skill

## Instructions

Build production-ready AI chat interfaces using OpenAI's ChatKit Python SDK with FastAPI backends:

### 1. **Installation & Setup**

#### Install ChatKit
```bash
pip install openai-chatkit

# Or with UV (recommended)
uv add openai-chatkit
```

#### Project Structure
```
my-chatkit-app/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── server.py            # ChatKitServer implementation
│   ├── store.py             # Store implementation
│   ├── widgets/             # Custom widgets
│   └── tools/               # Agent tools
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # React app with ChatKit
│   │   └── index.html
│   └── package.json
├── .env
└── README.md
```

### 2. **Core Imports**
```python
from chatkit.server import ChatKitServer
from chatkit.store import Store, NotFoundError
from chatkit.types import (
    ThreadMetadata,
    ThreadItem,
    UserMessageItem,
    AssistantMessageItem,
    AssistantMessageContent,
    ThreadStreamEvent,
    ThreadItemDoneEvent,
    Page,
    Attachment,
)
from chatkit.widgets import (
    WidgetRoot,
    WidgetNode,
    Card,
    ListView,
    ListViewItem,
    Button,
    Badge,
    Text,
)
from chatkit.icons import Icon
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, Response
from typing import AsyncIterator
from datetime import datetime
```

### 3. **Store Implementation**

ChatKit requires a `Store` to persist threads and messages.

#### In-Memory Store (Development)
```python
from collections import defaultdict
from chatkit.store import NotFoundError, Store
from chatkit.types import ThreadMetadata, ThreadItem, Page

class InMemoryChatKitStore(Store[dict]):
    """In-memory store for development/testing."""
    
    def __init__(self):
        self.threads: dict[str, ThreadMetadata] = {}
        self.items: dict[str, list[ThreadItem]] = defaultdict(list)
    
    async def load_thread(
        self,
        thread_id: str,
        context: dict
    ) -> ThreadMetadata:
        """Load thread metadata by ID."""
        if thread_id not in self.threads:
            raise NotFoundError(f"Thread {thread_id} not found")
        return self.threads[thread_id]
    
    async def save_thread(
        self,
        thread: ThreadMetadata,
        context: dict
    ) -> None:
        """Save thread metadata."""
        self.threads[thread.id] = thread
    
    async def load_threads(
        self,
        limit: int,
        after: str | None,
        order: str,
        context: dict
    ) -> Page[ThreadMetadata]:
        """Load paginated list of threads."""
        threads = list(self.threads.values())
        return self._paginate(
            threads,
            after,
            limit,
            order,
            sort_key=lambda t: t.created_at,
            cursor_key=lambda t: t.id
        )
    
    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: dict
    ) -> Page[ThreadItem]:
        """Load paginated thread items (messages)."""
        items = self.items.get(thread_id, [])
        return self._paginate(
            items,
            after,
            limit,
            order,
            sort_key=lambda i: i.created_at,
            cursor_key=lambda i: i.id
        )
    
    async def save_thread_item(
        self,
        item: ThreadItem,
        context: dict
    ) -> None:
        """Save a thread item (message)."""
        self.items[item.thread_id].append(item)
```

#### Database Store (Production)
```python
from sqlmodel import Session, select
from models import Thread, Message

class DatabaseChatKitStore(Store[dict]):
    """Production store using SQLModel + PostgreSQL."""
    
    def __init__(self, engine):
        self.engine = engine
    
    async def load_thread(
        self,
        thread_id: str,
        context: dict
    ) -> ThreadMetadata:
        """Load thread from database."""
        with Session(self.engine) as session:
            thread = session.get(Thread, thread_id)
            if not thread:
                raise NotFoundError(f"Thread {thread_id} not found")
            
            return ThreadMetadata(
                id=thread.id,
                created_at=thread.created_at,
                updated_at=thread.updated_at,
                title=thread.title,
                metadata=thread.metadata or {}
            )
    
    async def save_thread(
        self,
        thread: ThreadMetadata,
        context: dict
    ) -> None:
        """Save thread to database."""
        with Session(self.engine) as session:
            db_thread = session.get(Thread, thread.id)
            
            if db_thread:
                db_thread.updated_at = thread.updated_at
                db_thread.title = thread.title
                db_thread.metadata = thread.metadata
            else:
                db_thread = Thread(
                    id=thread.id,
                    created_at=thread.created_at,
                    updated_at=thread.updated_at,
                    title=thread.title,
                    metadata=thread.metadata
                )
            
            session.add(db_thread)
            session.commit()
    
    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: dict
    ) -> Page[ThreadItem]:
        """Load messages from database."""
        with Session(self.engine) as session:
            query = select(Message).where(Message.thread_id == thread_id)
            
            if order == "desc":
                query = query.order_by(Message.created_at.desc())
            else:
                query = query.order_by(Message.created_at.asc())
            
            if after:
                # Implement cursor pagination
                pass
            
            query = query.limit(limit)
            messages = session.exec(query).all()
            
            # Convert to ThreadItem objects
            items = [self._message_to_thread_item(msg) for msg in messages]
            
            return Page(
                data=items,
                has_more=len(items) == limit,
                next_cursor=items[-1].id if items else None
            )
    
    async def save_thread_item(
        self,
        item: ThreadItem,
        context: dict
    ) -> None:
        """Save message to database."""
        with Session(self.engine) as session:
            message = Message(
                id=item.id,
                thread_id=item.thread_id,
                role=item.role,
                content=item.content,
                created_at=item.created_at
            )
            session.add(message)
            session.commit()
```

### 4. **ChatKitServer Implementation**

#### Basic Server
```python
from chatkit.server import ChatKitServer
from chatkit.types import (
    ThreadMetadata,
    UserMessageItem,
    ThreadStreamEvent,
    ThreadItemDoneEvent,
    AssistantMessageItem,
    AssistantMessageContent,
)
from typing import AsyncIterator
from datetime import datetime

class MyChatKitServer(ChatKitServer[dict]):
    """Custom ChatKit server implementation."""
    
    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """
        Respond to user message with streaming events.
        
        This is called when:
        - User sends a message
        - Client tool returns output
        - Widget action is triggered
        """
        
        # Simple hardcoded response (replace with AI model)
        yield ThreadItemDoneEvent(
            item=AssistantMessageItem(
                thread_id=thread.id,
                id=self.store.generate_item_id("message", thread, context),
                created_at=datetime.now(),
                content=[AssistantMessageContent(text="Hello, world!")],
            ),
        )
```

#### Server with OpenAI Integration
```python
from openai import AsyncOpenAI
from chatkit.server import ChatKitServer

class AIAssistantServer(ChatKitServer[dict]):
    """ChatKit server with OpenAI integration."""
    
    def __init__(self, store, openai_api_key: str):
        super().__init__(store=store)
        self.client = AsyncOpenAI(api_key=openai_api_key)
    
    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Respond using OpenAI API."""
        
        if not input_user_message:
            return
        
        # Get conversation history
        history = await self._load_conversation_history(thread, context)
        
        # Add user message
        messages = history + [{
            "role": "user",
            "content": input_user_message.content[0].text
        }]
        
        # Stream response from OpenAI
        stream = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True,
        )
        
        full_response = ""
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                full_response += delta.content
        
        # Yield complete assistant message
        yield ThreadItemDoneEvent(
            item=AssistantMessageItem(
                thread_id=thread.id,
                id=self.store.generate_item_id("message", thread, context),
                created_at=datetime.now(),
                content=[AssistantMessageContent(text=full_response)],
            ),
        )
    
    async def _load_conversation_history(
        self,
        thread: ThreadMetadata,
        context: dict
    ) -> list[dict]:
        """Load conversation history for context."""
        items = await self.store.load_thread_items(
            thread_id=thread.id,
            after=None,
            limit=50,
            order="asc",
            context=context
        )
        
        messages = []
        for item in items.data:
            if hasattr(item, 'role') and hasattr(item, 'content'):
                messages.append({
                    "role": item.role,
                    "content": item.content[0].text if item.content else ""
                })
        
        return messages
```

#### Server with Agents SDK Integration
```python
from agents import Agent, Runner
from chatkit.server import ChatKitServer

class AgentChatKitServer(ChatKitServer[dict]):
    """ChatKit server with OpenAI Agents SDK."""
    
    def __init__(self, store, agent: Agent):
        super().__init__(store=store)
        self.agent = agent
    
    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Respond using OpenAI Agent."""
        
        if not input_user_message:
            return
        
        user_input = input_user_message.content[0].text
        
        # Run agent
        result = await Runner.run(
            starting_agent=self.agent,
            input=user_input
        )
        
        # Yield agent response
        yield ThreadItemDoneEvent(
            item=AssistantMessageItem(
                thread_id=thread.id,
                id=self.store.generate_item_id("message", thread, context),
                created_at=datetime.now(),
                content=[AssistantMessageContent(text=result.final_output)],
            ),
        )
    
    async def stream_agent_response(
        self,
        thread: ThreadMetadata,
        user_input: str,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Stream agent response in real-time."""
        
        from chatkit.types import ThreadItemStreamingEvent, ResponseTextDeltaEvent
        
        # Start streaming assistant message
        message_id = self.store.generate_item_id("message", thread, context)
        
        # Stream agent response
        result = Runner.run_streamed(
            starting_agent=self.agent,
            input=user_input
        )
        
        full_text = ""
        async for event in result.stream_events():
            if event.type == "raw_response_event":
                if isinstance(event.data, ResponseTextDeltaEvent):
                    full_text += event.data.delta
                    
                    # Yield streaming event
                    yield ThreadItemStreamingEvent(
                        item_id=message_id,
                        thread_id=thread.id,
                        delta=event.data.delta
                    )
        
        # Yield final complete message
        yield ThreadItemDoneEvent(
            item=AssistantMessageItem(
                thread_id=thread.id,
                id=message_id,
                created_at=datetime.now(),
                content=[AssistantMessageContent(text=full_text)],
            ),
        )
```

### 5. **FastAPI Integration**

#### Basic Endpoint
```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, Response
from chatkit.server import StreamingResult

app = FastAPI()

# Create store
store = InMemoryChatKitStore()

# Create server
server = MyChatKitServer(store=store)

@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    """Main ChatKit endpoint for all requests."""
    
    # Process request
    result = await server.process(
        await request.body(),
        context={}  # Add user context, auth, etc.
    )
    
    # Return streaming or JSON response
    if isinstance(result, StreamingResult):
        return StreamingResponse(
            result,
            media_type="text/event-stream"
        )
    
    return Response(
        content=result.json,
        media_type="application/json"
    )
```

#### With Authentication
```python
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse, Response

async def get_current_user(request: Request) -> dict:
    """Extract user from request headers/token."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Verify token and get user
    token = auth_header.replace("Bearer ", "")
    user = verify_token(token)  # Your auth logic
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return user

@app.post("/chatkit")
async def chatkit_endpoint(
    request: Request,
    user: dict = Depends(get_current_user)
):
    """Authenticated ChatKit endpoint."""
    
    # Add user to context
    context = {
        "user_id": user["id"],
        "user_email": user["email"],
    }
    
    result = await server.process(
        await request.body(),
        context=context
    )
    
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    
    return Response(content=result.json, media_type="application/json")
```

### 6. **Widgets**

Widgets are interactive UI components that appear in messages.

#### Simple Card Widget
```python
from chatkit.widgets import Card, Text, Button
from chatkit.types import ThreadItemDoneEvent, AssistantMessageItem, AssistantMessageContent

def create_welcome_widget(thread_id: str, item_id: str) -> ThreadItemDoneEvent:
    """Create a welcome card widget."""
    
    widget = Card(
        status="Welcome to ChatKit!",
        children=[
            Text(text="I'm your AI assistant. How can I help you today?"),
            Button(
                text="Get Started",
                action={
                    "type": "welcome.get_started",
                    "handler": "server"
                }
            )
        ]
    )
    
    return ThreadItemDoneEvent(
        item=AssistantMessageItem(
            thread_id=thread_id,
            id=item_id,
            created_at=datetime.now(),
            content=[
                AssistantMessageContent(
                    text="Welcome!",
                    widget=widget.to_dict()
                )
            ],
        ),
    )
```

#### List View Widget
```python
from chatkit.widgets import ListView, ListViewItem, Badge, Button

def create_task_list_widget(tasks: list[dict], thread_id: str, item_id: str):
    """Create a task list widget."""
    
    items = []
    for task in tasks:
        items.append(
            ListViewItem(
                title=task["title"],
                subtitle=task["description"],
                trailing=[
                    Badge(
                        text="Pending" if not task["completed"] else "Done",
                        variant="warning" if not task["completed"] else "success"
                    ),
                    Button(
                        text="Complete",
                        size="sm",
                        action={
                            "type": "task.complete",
                            "task_id": task["id"],
                            "handler": "server"
                        }
                    )
                ]
            )
        )
    
    widget = Card(
        status=f"{len(tasks)} tasks",
        children=[
            ListView(items=items)
        ]
    )
    
    return ThreadItemDoneEvent(
        item=AssistantMessageItem(
            thread_id=thread_id,
            id=item_id,
            created_at=datetime.now(),
            content=[
                AssistantMessageContent(
                    text=f"Here are your {len(tasks)} tasks:",
                    widget=widget.to_dict()
                )
            ],
        ),
    )
```

### 7. **Actions**

Actions handle widget button clicks and other interactions.

#### Implementing Actions
```python
from chatkit.server import ChatKitServer
from chatkit.types import ActionEvent

class ActionHandlingServer(ChatKitServer[dict]):
    """Server with action handling."""
    
    async def action(
        self,
        thread: ThreadMetadata,
        action_event: ActionEvent,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Handle widget actions."""
        
        action_type = action_event.action.get("type")
        
        if action_type == "task.complete":
            # Handle task completion
            task_id = action_event.action.get("task_id")
            
            # Update task in database
            await self.complete_task(task_id, context)
            
            # Send confirmation message
            yield ThreadItemDoneEvent(
                item=AssistantMessageItem(
                    thread_id=thread.id,
                    id=self.store.generate_item_id("message", thread, context),
                    created_at=datetime.now(),
                    content=[
                        AssistantMessageContent(
                            text=f"✅ Task {task_id} marked as complete!"
                        )
                    ],
                ),
            )
        
        elif action_type == "welcome.get_started":
            # Show getting started guide
            yield self.create_getting_started_message(thread, context)
    
    async def complete_task(self, task_id: int, context: dict):
        """Complete a task in the database."""
        # Database logic here
        pass
```

### 8. **Client Tools**

Client tools let the agent call JavaScript functions in the browser.

#### Server-side Registration
```python
from chatkit.types import ClientTool

class ClientToolServer(ChatKitServer[dict]):
    """Server with client tools."""
    
    def __init__(self, store):
        super().__init__(store=store)
        
        # Register client tools
        self.client_tools = [
            ClientTool(
                name="get_selected_items",
                description="Get currently selected items from the UI",
                parameters={
                    "type": "object",
                    "properties": {}
                }
            ),
            ClientTool(
                name="update_ui_state",
                description="Update UI state on the client",
                parameters={
                    "type": "object",
                    "properties": {
                        "state": {"type": "string"}
                    }
                }
            )
        ]
    
    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Respond with client tool calls."""
        
        # Request client tool call
        from chatkit.types import ClientToolCallEvent
        
        yield ClientToolCallEvent(
            tool_name="get_selected_items",
            arguments={}
        )
        
        # Wait for client tool response
        # Then continue processing...
```

#### Client-side Handling
```javascript
// frontend/src/App.tsx
import { ChatKit, useChatKit } from "@openai/chatkit-react";

export function App() {
  const chatkit = useChatKit({
    api: {
      url: "http://localhost:8000/chatkit",
    },
    clientTools: {
      // Register client tools
      get_selected_items: async () => {
        // Get selected items from UI state
        const selectedItems = getSelectedItemsFromState();
        return { items: selectedItems };
      },
      update_ui_state: async ({ state }) => {
        // Update UI state
        updateUIState(state);
        return { success: true };
      }
    }
  });

  return <ChatKit control={chatkit.control} />;
}
```

### 9. **File Uploads**

#### Server-side File Handling
```python
from chatkit.types import FileUpload, Attachment
from fastapi import UploadFile, File

class FileHandlingServer(ChatKitServer[dict]):
    """Server with file upload support."""
    
    async def handle_file_upload(
        self,
        file: UploadFile,
        context: dict
    ) -> Attachment:
        """Handle file upload and return attachment."""
        
        # Save file to storage (S3, local, etc.)
        file_url = await self.save_file(file)
        
        # Create attachment
        attachment = Attachment(
            id=generate_unique_id(),
            filename=file.filename,
            content_type=file.content_type,
            size=file.size,
            url=file_url
        )
        
        return attachment
    
    async def save_file(self, file: UploadFile) -> str:
        """Save file and return URL."""
        # Implement file storage logic
        pass

# FastAPI endpoint for file upload
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload file endpoint."""
    attachment = await server.handle_file_upload(file, context={})
    return {"attachment": attachment.dict()}
```

### 10. **Production Best Practices**

#### Environment Configuration
```python
# .env
OPENAI_API_KEY=your-api-key
DATABASE_URL=postgresql://user:pass@host/db
DOMAIN_KEY=production-domain
ALLOWED_ORIGINS=https://yourapp.com
```

#### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourapp.com"],  # Your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Error Handling
```python
from chatkit.errors import ChatKitError

@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    try:
        result = await server.process(
            await request.body(),
            context={}
        )
        
        if isinstance(result, StreamingResult):
            return StreamingResponse(result, media_type="text/event-stream")
        
        return Response(content=result.json, media_type="application/json")
    
    except ChatKitError as e:
        return Response(
            content={"error": str(e)},
            status_code=400,
            media_type="application/json"
        )
    
    except Exception as e:
        logging.error(f"ChatKit error: {e}", exc_info=True)
        return Response(
            content={"error": "Internal server error"},
            status_code=500,
            media_type="application/json"
        )
```

## Examples

### Complete Task Management ChatKit App
```python
# server.py
from chatkit.server import ChatKitServer
from chatkit.types import *
from chatkit.widgets import Card, ListView, ListViewItem, Button, Badge
from agents import Agent, Runner, function_tool
from sqlmodel import Session, select
from models import Task

# Define tools
@function_tool()
def get_tasks(user_id: int, status: str = "all") -> list[dict]:
    """Get user tasks."""
    with Session(engine) as session:
        query = select(Task).where(Task.user_id == user_id)
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)
        tasks = session.exec(query).all()
        return [{"id": t.id, "title": t.title, "completed": t.completed} for t in tasks]

# Create agent
task_agent = Agent(
    name="Task Manager",
    model="gpt-4o-mini",
    instructions="You help users manage their tasks.",
    tools=[get_tasks]
)

# Create ChatKit server
class TaskChatKitServer(ChatKitServer[dict]):
    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        if not input_user_message:
            return
        
        user_input = input_user_message.content[0].text
        user_id = context.get("user_id", 1)
        
        # Run agent
        result = await Runner.run(
            starting_agent=task_agent,
            input=f"User ID: {user_id}\n{user_input}"
        )
        
        # Check if agent returned tasks
        if "tasks" in result.final_output.lower():
            # Create widget
            tasks = await get_tasks(user_id, "all")
            yield self.create_task_widget(tasks, thread)
        else:
            # Regular text response
            yield ThreadItemDoneEvent(
                item=AssistantMessageItem(
                    thread_id=thread.id,
                    id=self.store.generate_item_id("message", thread, context),
                    created_at=datetime.now(),
                    content=[AssistantMessageContent(text=result.final_output)],
                ),
            )
```

## Best Practices

- ✅ Use database store in production (not in-memory)
- ✅ Implement proper authentication and authorization
- ✅ Add CORS configuration for frontend domain
- ✅ Handle errors gracefully with try-catch
- ✅ Use widgets for rich interactive experiences
- ✅ Implement actions for button clicks
- ✅ Stream responses for better UX
- ✅ Add logging and monitoring
- ✅ Test file uploads thoroughly
- ✅ Set domain allowlist in OpenAI settings

Ready for the sub-agent!