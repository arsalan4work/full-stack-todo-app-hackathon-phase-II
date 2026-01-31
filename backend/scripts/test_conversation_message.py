"""
Test script to verify conversation and message models work correctly.
"""
from datetime import datetime
from models.conversation import Conversation
from models.message import Message, MessageRole

def test_models():
    """Test the conversation and message models."""
    print("Testing Conversation and Message models...")

    # Test Conversation creation
    conversation = Conversation(
        user_id="test-user-123",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    print(f"Created conversation: {conversation.user_id}")

    # Test Message creation
    message = Message(
        conversation_id=1,
        user_id="test-user-123",
        role=MessageRole.USER,
        content="Hello, this is a test message!",
        created_at=datetime.now()
    )
    print(f"Created message: {message.role} - {len(message.content)} chars")

    # Test role constants
    assert MessageRole.USER == "user"
    assert MessageRole.ASSISTANT == "assistant"
    print("Role constants verified!")

    print("All tests passed!")

if __name__ == "__main__":
    test_models()