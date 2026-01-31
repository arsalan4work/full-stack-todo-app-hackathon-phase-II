"""Message builder for converting conversation history to OpenAI format."""
from typing import List, Dict, Any


def build_messages(conversation_history: List[Dict[str, str]], new_message: str) -> List[Dict[str, Any]]:
    """
    Convert conversation history to OpenAI message format.

    Args:
        conversation_history: List of messages in the format {"role": "...", "content": "..."}
        new_message: The new message to add to the conversation

    Returns:
        List of messages in OpenAI format
    """
    messages = []

    # Convert conversation history to OpenAI format
    for msg in conversation_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")

        # Validate role
        if role not in ["user", "assistant", "system"]:
            role = "user"  # Default to user if invalid

        messages.append({
            "role": role,
            "content": content
        })

    # Append the new message
    messages.append({
        "role": "user",
        "content": new_message
    })

    return messages