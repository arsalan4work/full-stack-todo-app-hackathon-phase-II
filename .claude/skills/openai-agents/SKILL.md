---
name: openai-agents-skill
description: Build autonomous AI agents using OpenAI's official Agents Python SDK. Use when creating intelligent agents with tools, handoffs, guardrails, streaming responses, and multi-agent orchestration. Supports OpenAI models and external providers (Gemini, Claude). Perfect for building AI assistants, agentic workflows, and intelligent automation.
---

# OpenAI Agents Python Skill

## Instructions

Build production-ready autonomous AI agents using OpenAI's official Agents Python SDK following best practices:

### 1. **Installation & Setup**

#### Install SDK
```bash
pip install openai-agents

# Or with UV (recommended)
uv add openai-agents
```

#### Environment Setup
```python
import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI API Key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Or Gemini API Key
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
```

### 2. **Core Imports**
```python
from agents import (
    Agent,
    Runner,
    RunConfig,
    function_tool,
    input_guardrail,
    output_guardrail,
    GuardrailFunctionOutput,
    InputGuardrailTripwireTriggered,
    OutputGuardrailTripwireTriggered,
    ModelSettings,
    AgentHooks,
    RunHooks,
    set_tracing_disabled,
    AsyncOpenAI,
    OpenAIChatCompletionsModel,
)
```

### 3. **Creating Basic Agents**

#### Simple Sync Agent
```python
from agents import Agent, Runner

# Create basic agent
agent = Agent(
    name="Assistant",
    model="gpt-4o-mini",  # or "gpt-4o" for better quality
    instructions="You are a helpful assistant."
)

# Run synchronously
result = Runner.run_sync(
    starting_agent=agent,
    input="Hello world"
)

print(result.final_output)
```

#### Async Agent
```python
import asyncio
from agents import Agent, Runner

async def main():
    agent = Agent(
        name="Assistant",
        model="gpt-4o-mini",
        instructions="You're a helpful assistant"
    )
    
    user_input = input("What's Your Question: ")
    
    result = await Runner.run(
        starting_agent=agent,
        input=user_input,
    )
    
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

#### Agent with Custom Instructions
```python
weather_agent = Agent(
    name="Weather Forecaster",
    model="gpt-4o-mini",
    instructions="""You are a weather forecaster.
    
    When providing weather information:
    - Be specific about locations
    - Include temperature, conditions, and humidity
    - Provide forecasts for the next 24-48 hours
    - Mention any weather warnings or alerts
    """
)

result = Runner.run_sync(
    starting_agent=weather_agent,
    input="What's the weather like in Pakistan today?"
)

print(result.final_output)
```

### 4. **Function Tools**

#### Defining Function Tools
```python
from agents import Agent, Runner, function_tool

@function_tool()
def get_user_data(min_age: int) -> dict:
    """Retrieve user data based on minimum age.
    
    Args:
        min_age: Minimum age to filter users
    
    Returns:
        Filtered list of users
    """
    users = [
        {"name": "Muneeb", "age": 22},
        {"name": "Ubaid", "age": 25},
        {"name": "Azan", "age": 19},
    ]
    
    # Filter users by minimum age
    filtered_users = [user for user in users if user["age"] >= min_age]
    return {"users": filtered_users, "count": len(filtered_users)}

@function_tool()
def calculate_sum(a: int, b: int) -> int:
    """Calculate sum of two numbers.
    
    Args:
        a: First number
        b: Second number
    
    Returns:
        Sum of a and b
    """
    return a + b

@function_tool()
def search_database(query: str, limit: int = 10) -> list:
    """Search database for matching records.
    
    Args:
        query: Search query string
        limit: Maximum number of results
    
    Returns:
        List of matching records
    """
    # Simulate database search
    results = [
        {"id": i, "title": f"Result {i}", "relevance": 0.9 - (i * 0.1)}
        for i in range(min(5, limit))
    ]
    return results

# Create agent with tools
agent_with_tools = Agent(
    name="Data Assistant",
    model="gpt-4o-mini",
    instructions="You help users query and analyze data. Use available tools to fetch information.",
    tools=[get_user_data, calculate_sum, search_database]
)

result = Runner.run_sync(
    starting_agent=agent_with_tools,
    input="Find users who are at least 20 years old and calculate the average age."
)

print(result.final_output)
```

#### Database Tools Pattern
```python
from sqlmodel import Session, select
from models import Task

@function_tool()
def create_task(title: str, description: str, user_id: int) -> dict:
    """Create a new task in the database.
    
    Args:
        title: Task title
        description: Task description
        user_id: User ID
    
    Returns:
        Created task information
    """
    with Session(engine) as session:
        task = Task(
            title=title,
            description=description,
            user_id=user_id,
            completed=False
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "created_at": task.created_at.isoformat()
        }

@function_tool()
def get_tasks(user_id: int, status: str = "all") -> list:
    """Get tasks for a user.
    
    Args:
        user_id: User ID
        status: Filter by status (all, pending, completed)
    
    Returns:
        List of tasks
    """
    with Session(engine) as session:
        statement = select(Task).where(Task.user_id == user_id)
        
        if status == "pending":
            statement = statement.where(Task.completed == False)
        elif status == "completed":
            statement = statement.where(Task.completed == True)
        
        tasks = session.exec(statement).all()
        
        return [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed
            }
            for task in tasks
        ]

@function_tool()
def update_task(task_id: int, completed: bool) -> dict:
    """Update task completion status.
    
    Args:
        task_id: Task ID
        completed: New completion status
    
    Returns:
        Updated task information
    """
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            return {"error": "Task not found"}
        
        task.completed = completed
        session.add(task)
        session.commit()
        session.refresh(task)
        
        return {
            "id": task.id,
            "title": task.title,
            "completed": task.completed
        }

# Create task management agent
task_agent = Agent(
    name="Task Manager",
    model="gpt-4o",
    instructions="""You are a task management assistant.
    
    Help users:
    - Create new tasks
    - View their tasks
    - Update task status
    - Filter tasks by status
    
    Always confirm actions before executing.
    Provide clear summaries of operations.""",
    tools=[create_task, get_tasks, update_task]
)
```

#### Web Search Tool (Built-in)
```python
from agents import Agent, Runner, WebSearchTool

search_agent = Agent(
    name="Research Assistant",
    model="gpt-4o-mini",
    instructions="You help users research topics using web search. Provide accurate, cited information.",
    tools=[WebSearchTool]
)

result = Runner.run_sync(
    starting_agent=search_agent,
    input="Find recent news about AI advancements in 2025"
)

print(result.final_output)
```

#### File Search Tool (Built-in)
```python
from agents import Agent, Runner, FileSearchTool

file_agent = Agent(
    name="Document Assistant",
    model="gpt-4o-mini",
    instructions="You help users search and analyze documents.",
    tools=[FileSearchTool]
)

result = Runner.run_sync(
    starting_agent=file_agent,
    input="Search for information about Python best practices in the uploaded documents"
)

print(result.final_output)
```

### 5. **Agent Handoffs (Multi-Agent Orchestration)**

#### Multiple Agent Handoffs
```python
from agents import Agent, Runner

# Specialized translator agents
arabic_translator = Agent(
    name="Arabic Translator",
    model="gpt-4o-mini",
    instructions="""You translate user input into Arabic in a user-friendly format."""
)

french_translator = Agent(
    name="French Translator",
    model="gpt-4o-mini",
    instructions="""You translate user input into French in a user-friendly format."""
)

urdu_translator = Agent(
    name="Urdu Translator",
    model="gpt-4o-mini",
    instructions="""You translate user input into Urdu in a user-friendly format."""
)

# Main orchestrator agent
language_translator = Agent(
    name="Language Translator",
    model="gpt-4o-mini",
    instructions="""You take user input and call the appropriate handoff to translate.
    
    If no appropriate translator is available, politely refuse.
    Respect user input and answer in a polite, human-understandable format.""",
    handoffs=[arabic_translator, french_translator, urdu_translator]
)

result = Runner.run_sync(
    starting_agent=language_translator,
    input="Translate: Hello, how are you? (in arabic)"
)

print(result.final_output)
```

#### Customer Support Handoff Pattern
```python
# Tier 1 Support
tier1_support = Agent(
    name="Tier 1 Support",
    model="gpt-4o-mini",
    instructions="""You handle basic customer inquiries:
    - Account questions
    - Password resets
    - Basic troubleshooting
    
    If issue is complex, hand off to Tier 2."""
)

# Tier 2 Support
tier2_support = Agent(
    name="Tier 2 Support",
    model="gpt-4o",
    instructions="""You handle complex technical issues:
    - System errors
    - Integration problems
    - Advanced troubleshooting
    
    If issue requires engineering, hand off to Engineering."""
)

# Engineering Team
engineering_team = Agent(
    name="Engineering Team",
    model="gpt-4o",
    instructions="""You handle critical system issues:
    - Bug reports
    - System outages
    - Architecture questions"""
)

# Main support agent
support_agent = Agent(
    name="Customer Support",
    model="gpt-4o-mini",
    instructions="Route customer inquiries to the appropriate team.",
    handoffs=[tier1_support, tier2_support, engineering_team]
)
```

### 6. **Guardrails (Input/Output Validation)**

#### Input Guardrails
```python
from agents import (
    Agent, 
    Runner, 
    input_guardrail, 
    GuardrailFunctionOutput,
    InputGuardrailTripwireTriggered
)
from pydantic import BaseModel

# Output type for guardrail agent
class MathHomeworkOutput(BaseModel):
    is_math_work: bool
    reasoning: str

# Guardrail validation agent
input_guardrail_agent = Agent(
    name="Input Guardrail Agent",
    model="gpt-4o-mini",
    instructions="""You validate user input. 
    
    Ensure input is only related to math. 
    Other questions will be disqualified.""",
    output_type=MathHomeworkOutput
)

@input_guardrail
async def math_guardrail(ctx, agent, input) -> GuardrailFunctionOutput:
    """Validate input is math-related."""
    result = await Runner.run(input_guardrail_agent, input)
    
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=not result.final_output.is_math_work  # Trigger if NOT math
    )

# Main agent with input guardrail
math_agent = Agent(
    name="Math Homework Agent",
    model="gpt-4o-mini",
    input_guardrails=[math_guardrail],
    instructions="You help students with math homework. Only answer math questions."
)

try:
    result = Runner.run_sync(
        starting_agent=math_agent,
        input="What is 2+2*4000+45-90/3445?"
    )
    print(result.final_output)
except InputGuardrailTripwireTriggered:
    print("Error: Input validation failed. Only math questions allowed.")
```

#### Output Guardrails
```python
from agents import (
    output_guardrail,
    OutputGuardrailTripwireTriggered
)

class PhysicsHomeworkOutput(BaseModel):
    is_physics_work: bool
    reasoning: str

# Output validation agent
output_guardrail_agent = Agent(
    name="Output Guardrail Agent",
    model="gpt-4o-mini",
    instructions="""You validate LLM output.
    
    Ensure output is only related to physics.
    Other topics will be disqualified.""",
    output_type=PhysicsHomeworkOutput
)

@output_guardrail
async def physics_guardrail(ctx, agent, output) -> GuardrailFunctionOutput:
    """Validate output is physics-related."""
    result = await Runner.run(output_guardrail_agent, output)
    
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=not result.final_output.is_physics_work
    )

# Main agent with both guardrails
class MainMessageOutput(BaseModel):
    response: str

homework_agent = Agent(
    name="Homework Agent",
    model="gpt-4o-mini",
    input_guardrails=[math_guardrail],
    output_guardrails=[physics_guardrail],
    output_type=MainMessageOutput,
    instructions="You help students with homework."
)

try:
    result = Runner.run_sync(
        starting_agent=homework_agent,
        input="Explain Newton's laws"
    )
    print(result.final_output)
except InputGuardrailTripwireTriggered:
    print("Error: Input validation failed.")
except OutputGuardrailTripwireTriggered:
    print("Error: Output validation failed.")
```

#### Content Safety Guardrail
```python
class SafetyCheckOutput(BaseModel):
    is_safe: bool
    reason: str

safety_agent = Agent(
    name="Safety Agent",
    model="gpt-4o-mini",
    instructions="""Check if content is safe and appropriate.
    
    Flag content that contains:
    - Hate speech
    - Violence
    - Explicit content
    - Personal information
    - Harmful instructions""",
    output_type=SafetyCheckOutput
)

@input_guardrail
async def safety_guardrail(ctx, agent, input) -> GuardrailFunctionOutput:
    result = await Runner.run(safety_agent, input)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=not result.final_output.is_safe
    )
```

### 7. **Streaming Responses**

#### Sync Streaming
```python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    model="gpt-4o-mini",
    instructions="You are a helpful assistant."
)

result = Runner.run_streamed_sync(
    starting_agent=agent,
    input="Tell me a story about AI"
)

# Stream text chunks
for chunk in result.stream():
    print(chunk, end="", flush=True)
```

#### Async Streaming with Events
```python
from agents import Agent, Runner, ResponseTextDeltaEvent

async def stream_response():
    agent = Agent(
        name="Assistant",
        model="gpt-4o-mini",
        instructions="You are a weather forecaster"
    )
    
    result = Runner.run_streamed(
        starting_agent=agent,
        input="Tell me something interesting about Pakistan"
    )
    
    async for event in result.stream_events():
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="", flush=True)
    
    print("\n\nFinal output:", result.final_output)

# Run async streaming
asyncio.run(stream_response())
```

### 8. **Model Settings & Configuration**

#### Model Settings
```python
from agents import Agent, ModelSettings

agent = Agent(
    name="Assistant",
    model="gpt-4o-mini",
    instructions="You're a helpful assistant",
    model_settings=ModelSettings(
        # Parallel tool calls (call multiple tools simultaneously)
        parallel_tool_calls=True,  # True = parallel, False = sequential
        
        # Tool choice strategy
        tool_choice="auto",  # "auto", "none", "required"
        
        # Token limit
        max_tokens=500,
        
        # Temperature (0.0 = precise, 1.0 = creative)
        temperature=0.7,
        
        # Top P (nucleus sampling)
        top_p=0.9,
        
        # Frequency penalty (reduce repetition)
        frequency_penalty=0.5,
        
        # Presence penalty (encourage new topics)
        presence_penalty=0.3,
    )
)
```

#### Temperature Examples
```python
# Very precise (good for math, code, facts)
precise_agent = Agent(
    name="Precise Assistant",
    model="gpt-4o",
    model_settings=ModelSettings(temperature=0.1)
)

# Balanced (good for general conversation)
balanced_agent = Agent(
    name="Balanced Assistant",
    model="gpt-4o",
    model_settings=ModelSettings(temperature=0.7)
)

# Very creative (good for stories, brainstorming)
creative_agent = Agent(
    name="Creative Assistant",
    model="gpt-4o",
    model_settings=ModelSettings(temperature=0.9)
)
```

### 9. **External Model Providers (Gemini, Claude)**

#### Using Google Gemini
```python
from agents import Agent, AsyncOpenAI, OpenAIChatCompletionsModel, Runner, RunConfig

async def use_gemini():
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    MODEL_NAME = "gemini-2.0-flash-exp"
    
    # Create external client
    external_client = AsyncOpenAI(
        api_key=GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )
    
    # Create model
    model = OpenAIChatCompletionsModel(
        model=MODEL_NAME,
        openai_client=external_client
    )
    
    # Create run config
    config = RunConfig(
        model=model,
        model_provider=external_client,
        tracing_disabled=True,
    )
    
    # Create agent with Gemini
    agent = Agent(
        name="Gemini Assistant",
        instructions="You are a weather forecaster",
        model=model,
    )
    
    result = Runner.run_streamed(
        starting_agent=agent,
        input="Tell me something interesting about Pakistan"
    )
    
    async for event in result.stream_events():
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="", flush=True)

asyncio.run(use_gemini())
```

#### Using Anthropic Claude
```python
async def use_claude():
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    MODEL_NAME = "claude-3-5-sonnet-20241022"
    
    external_client = AsyncOpenAI(
        api_key=ANTHROPIC_API_KEY,
        base_url="https://api.anthropic.com/v1",
    )
    
    model = OpenAIChatCompletionsModel(
        model=MODEL_NAME,
        openai_client=external_client
    )
    
    agent = Agent(
        name="Claude Assistant",
        instructions="You are a helpful assistant",
        model=model,
    )
    
    result = await Runner.run(
        starting_agent=agent,
        input="Hello, Claude!"
    )
    
    print(result.final_output)
```

### 10. **Hooks & Lifecycle Events**

#### Agent Hooks
```python
from agents import AgentHooks

class CustomAgentHooks(AgentHooks):
    async def on_agent_start(self, agent, input_data):
        """Called when agent starts processing."""
        print(f"[START] Agent '{agent.name}' starting with input: {input_data[:50]}...")
    
    async def on_agent_end(self, agent, output_data):
        """Called when agent finishes."""
        print(f"[END] Agent '{agent.name}' finished")
    
    async def on_tool_call(self, agent, tool_name, tool_args):
        """Called before tool execution."""
        print(f"[TOOL] Calling tool '{tool_name}' with args: {tool_args}")
    
    async def on_tool_result(self, agent, tool_name, result):
        """Called after tool execution."""
        print(f"[RESULT] Tool '{tool_name}' returned: {result}")

# Create agent with hooks
agent = Agent(
    name="Monitored Agent",
    model="gpt-4o-mini",
    instructions="You help users with tasks",
    tools=[get_user_data],
    hooks=CustomAgentHooks()
)
```

#### Run Hooks
```python
from agents import RunHooks

class CustomRunHooks(RunHooks):
    async def on_run_start(self, run_context):
        """Called when run starts."""
        print("[RUN] Starting execution")
    
    async def on_run_end(self, run_context, result):
        """Called when run ends."""
        print(f"[RUN] Execution complete. Output: {result.final_output[:50]}...")
    
    async def on_error(self, run_context, error):
        """Called on error."""
        print(f"[ERROR] Run failed: {error}")

# Use hooks in Runner
result = await Runner.run(
    starting_agent=agent,
    input="Process this request",
    hooks=CustomRunHooks()
)
```

### 11. **Tracing & Debugging**

#### Disable Tracing
```python
from agents import set_tracing_disabled

# Disable tracing globally (improves performance)
set_tracing_disabled(True)

# Or per-run
config = RunConfig(tracing_disabled=True)
```

#### Enable Detailed Logging
```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

# Or specific logger
logger = logging.getLogger("agents")
logger.setLevel(logging.DEBUG)
```

### 12. **Error Handling**

#### Comprehensive Error Handling
```python
from agents import (
    Agent,
    Runner,
    InputGuardrailTripwireTriggered,
    OutputGuardrailTripwireTriggered,
)

async def safe_agent_run(agent, user_input):
    """Run agent with comprehensive error handling."""
    try:
        result = await Runner.run(
            starting_agent=agent,
            input=user_input
        )
        return {"success": True, "output": result.final_output}
    
    except InputGuardrailTripwireTriggered as e:
        return {
            "success": False,
            "error": "Input validation failed",
            "message": "Your input doesn't meet the requirements"
        }
    
    except OutputGuardrailTripwireTriggered as e:
        return {
            "success": False,
            "error": "Output validation failed",
            "message": "The generated response doesn't meet safety standards"
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": "Unexpected error",
            "message": str(e)
        }
```

### 13. **Production Patterns**

#### Task Management Agent (Complete Example)
```python
from agents import Agent, Runner, function_tool
from sqlmodel import Session, select
from models import Task
from pydantic import BaseModel

# Tool definitions
@function_tool()
def create_task(title: str, description: str, user_id: int) -> dict:
    """Create a new task."""
    with Session(engine) as session:
        task = Task(title=title, description=description, user_id=user_id)
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"id": task.id, "title": task.title, "completed": task.completed}

@function_tool()
def list_tasks(user_id: int, status: str = "all") -> list:
    """List user tasks with optional status filter."""
    with Session(engine) as session:
        query = select(Task).where(Task.user_id == user_id)
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)
        
        tasks = session.exec(query).all()
        return [{"id": t.id, "title": t.title, "completed": t.completed} for t in tasks]

@function_tool()
def update_task(task_id: int, user_id: int, completed: bool) -> dict:
    """Update task status."""
    with Session(engine) as session:
        task = session.exec(
            select(Task).where(Task.id == task_id, Task.user_id == user_id)
        ).first()
        
        if not task:
            return {"error": "Task not found or unauthorized"}
        
        task.completed = completed
        session.add(task)
        session.commit()
        return {"id": task.id, "title": task.title, "completed": task.completed}

@function_tool()
def delete_task(task_id: int, user_id: int) -> dict:
    """Delete a task."""
    with Session(engine) as session:
        task = session.exec(
            select(Task).where(Task.id == task_id, Task.user_id == user_id)
        ).first()
        
        if not task:
            return {"error": "Task not found or unauthorized"}
        
        session.delete(task)
        session.commit()
        return {"success": True, "message": f"Task '{task.title}' deleted"}

# Create agent
task_agent = Agent(
    name="Task Manager",
    model="gpt-4o",
    instructions="""You are a task management assistant.

You help users:
- Create new tasks with clear titles and descriptions
- View all their tasks or filter by status (pending/completed)
- Update task completion status
- Delete tasks they no longer need

Always:
- Confirm destructive actions (delete) before executing
- Provide clear summaries of operations
- Ask for clarification if task details are unclear
- Be friendly and helpful""",
    tools=[create_task, list_tasks, update_task, delete_task],
    model_settings=ModelSettings(
        temperature=0.3,  # More precise for task operations
        parallel_tool_calls=False  # Sequential for safety
    )
)

# Usage
async def handle_task_request(user_id: int, request: str):
    # Inject user_id context into request
    full_request = f"User ID: {user_id}\nRequest: {request}"
    
    result = await Runner.run(
        starting_agent=task_agent,
        input=full_request
    )
    
    return result.final_output

# Example calls
await handle_task_request(1, "Create a task to buy groceries")
await handle_task_request(1, "Show me all my pending tasks")
await handle_task_request(1, "Mark task 5 as completed")
await handle_task_request(1, "Delete task 3")
```

## Best Practices

### 1. **Agent Design**
- ✅ Write clear, specific instructions
- ✅ Use appropriate temperature (0.1 = precise, 0.9 = creative)
- ✅ Define tools with comprehensive docstrings
- ✅ Handle tool errors gracefully
- ✅ Use guardrails for validation

### 2. **Tool Development**
- ✅ Type all parameters and returns
- ✅ Provide detailed docstrings
- ✅ Handle edge cases and errors
- ✅ Return structured data (dicts/lists)
- ✅ Keep tools focused and atomic

### 3. **Performance**
- ✅ Use `gpt-4o-mini` for speed/cost
- ✅ Use `gpt-4o` for complex reasoning
- ✅ Disable tracing in production
- ✅ Set appropriate token limits
- ✅ Use async for concurrent operations

### 4. **Security**
- ✅ Validate inputs with guardrails
- ✅ Never expose API keys in code
- ✅ Use environment variables
- ✅ Sanitize user inputs in tools
- ✅ Implement rate limiting

### 5. **Error Handling**
- ✅ Wrap runs in try-catch blocks
- ✅ Handle guardrail exceptions
- ✅ Log errors for debugging
- ✅ Provide user-friendly error messages
- ✅ Implement fallback behaviors

## Common Patterns Checklist

- [ ] Agent has clear, specific instructions
- [ ] Tools have type hints and docstrings
- [ ] Error handling implemented
- [ ] Guardrails for input/output validation
- [ ] Appropriate model settings (temperature, tokens)
- [ ] Tracing disabled in production
- [ ] API keys in environment variables
- [ ] Streaming for long responses
- [ ] Hooks for monitoring/logging
- [ ] Handoffs for multi-agent workflows