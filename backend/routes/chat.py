"""Chat API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List
import logging
from auth.dependencies import get_current_user_id
from models.conversation import Conversation
from models.message import Message, MessageRole
from schemas.chat import ChatRequest, ChatResponse
from agents.todo_agent import run_agent
from db import get_session
from utils.error_handler import handle_exception_as_http_error, APIServiceError, DatabaseConnectionError, ToolExecutionError


router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Chat endpoint that integrates with the OpenAI agent and database.

    Steps:
    1. Get or create conversation
    2. Fetch conversation history
    3. Store user message
    4. Run agent
    5. Store assistant response
    6. Return response
    """
    try:
        # Verify that the path user_id matches the authenticated user
        if user_id != current_user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Step 1: Get or create conversation
        conversation = None

        if request.conversation_id:
            # Fetch existing conversation
            conversation = session.exec(
                select(Conversation).where(Conversation.id == request.conversation_id)
            ).first()

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            # Verify that the conversation belongs to the user
            if str(conversation.user_id) != user_id:
                raise HTTPException(status_code=401, detail="Unauthorized")
        else:
            # Create new conversation
            conversation = Conversation(user_id=user_id)
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

        # Step 2: Fetch conversation history
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.asc())
        )
        messages_db = session.exec(statement).all()

        # Convert to list of {role, content}
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages_db
        ]

        # Step 3: Store user message
        user_message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role=MessageRole.USER,
            content=request.message
        )
        session.add(user_message)
        session.commit()

        # Step 4: Run agent
        try:
            response, tool_calls = run_agent(
                user_id=user_id,
                conversation_history=conversation_history,
                new_message=request.message
            )
        except Exception as e:
            logging.error(f"OpenAI API error in chat endpoint: {str(e)}")

            # Handle specific API service errors
            if "rate limit" in str(e).lower():
                raise APIServiceError("OpenAI", "Rate limit exceeded. Please try again later.")
            elif "invalid key" in str(e).lower() or "authentication" in str(e).lower():
                raise APIServiceError("OpenAI", "Authentication failed. Invalid API key.")
            else:
                raise APIServiceError("OpenAI", f"Service temporarily unavailable: {str(e)}")

        # Step 5: Store assistant response
        assistant_message = Message(
            conversation_id=conversation.id,
            user_id=user_id,  # Use the same user_id for reference
            role=MessageRole.ASSISTANT,
            content=response
        )
        session.add(assistant_message)
        session.commit()

        # Step 6: Return response
        return ChatResponse(
            conversation_id=conversation.id,
            response=response,
            tool_calls=tool_calls
        )

    except DatabaseConnectionError as e:
        logging.error(f"Database connection error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Database connection failed")

    except APIServiceError as e:
        logging.error(f"API service error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=503, detail=str(e))

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise

    except Exception as e:
        # Log all other errors
        logging.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)

        # Return a generic 500 error
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your request"
        )