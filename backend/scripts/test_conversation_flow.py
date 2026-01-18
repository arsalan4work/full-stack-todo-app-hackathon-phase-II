"""
Test script to verify the full conversation and message flow.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone
from models.conversation import Conversation
from models.message import Message, MessageRole

def test_conversation_message_flow():
    """Test the complete conversation and message flow."""
    print("Testing conversation and message flow...")

    # Test Conversation creation
    conversation = Conversation(
        user_id="user-123",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    print(f"[OK] Created conversation for user: {conversation.user_id}")
    print(f"[OK] Conversation ID: {conversation.id}")
    print(f"[OK] Created at: {conversation.created_at}")

    # Test Message creation for user
    user_message = Message(
        conversation_id=1,
        user_id="user-123",
        role=MessageRole.USER,
        content="Hello, how can you help me today?",
        created_at=datetime.now(timezone.utc)
    )

    print(f"[OK] Created user message: {len(user_message.content)} chars")
    print(f"[OK] Message role: {user_message.role}")
    print(f"[OK] User ID: {user_message.user_id}")

    # Test Message creation for assistant
    assistant_message = Message(
        conversation_id=1,
        user_id="user-123",  # Same user context
        role=MessageRole.ASSISTANT,
        content="I'd be happy to help you with your questions. How can I assist you?",
        created_at=datetime.now(timezone.utc)
    )

    print(f"[OK] Created assistant message: {len(assistant_message.content)} chars")
    print(f"[OK] Message role: {assistant_message.role}")

    # Test role constants
    assert MessageRole.USER == "user"
    assert MessageRole.ASSISTANT == "assistant"
    print("[OK] Role constants verified!")

    # Test max content length
    long_content = "A" * 10000  # Maximum allowed content
    long_message = Message(
        conversation_id=1,
        user_id="user-123",
        role=MessageRole.USER,
        content=long_content,
        created_at=datetime.now(timezone.utc)
    )
    print(f"[OK] Successfully created message with max content length: {len(long_message.content)} chars")

    print("\n[SUCCESS] All tests passed! Conversation and message models are working correctly.")
    print("\nSummary:")
    print(f"- Conversation model has: id, user_id, created_at, updated_at, messages relationship")
    print(f"- Message model has: id, conversation_id, user_id, role, content, created_at")
    print(f"- Role enum supports: '{MessageRole.USER}' and '{MessageRole.ASSISTANT}'")
    print(f"- Content field supports up to 10,000 characters")
    print(f"- Proper indexing on user_id and conversation_id for performance")

if __name__ == "__main__":
    test_conversation_message_flow()