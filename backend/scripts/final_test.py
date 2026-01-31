"""
Final test to verify that all models work together and can be imported correctly.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import create_db_and_tables

def test_db_creation():
    """Test that all models can be created in the database."""
    print("Testing database table creation with all models...")

    try:
        create_db_and_tables()
        print("[OK] Database tables created successfully!")

        # Test importing all models
        from models import User, Task, Conversation, Message
        print("[OK] All models imported successfully!")

        # Test that models have the expected attributes
        conv_attrs = ['id', 'user_id', 'created_at', 'updated_at', 'messages']
        msg_attrs = ['id', 'conversation_id', 'user_id', 'role', 'content', 'created_at']

        # Check Conversation attributes
        for attr in conv_attrs:
            assert hasattr(Conversation, attr), f"Missing attribute: {attr}"
        print("[OK] Conversation model has all expected attributes!")

        # Check Message attributes
        for attr in msg_attrs:
            assert hasattr(Message, attr), f"Missing attribute: {attr}"
        print("[OK] Message model has all expected attributes!")

        print("\n[SUCCESS] All final tests passed!")
        print("- Database tables can be created with all models")
        print("- All models are properly imported and accessible")
        print("- Models have all expected attributes")

    except Exception as e:
        print(f"[ERROR] Test failed with error: {str(e)}")
        raise

if __name__ == "__main__":
    test_db_creation()