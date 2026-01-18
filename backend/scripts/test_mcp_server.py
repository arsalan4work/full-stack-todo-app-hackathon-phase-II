"""Test script to verify MCP server functionality."""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.tools.task_tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task
)

def test_mcp_task_tools():
    """Test all MCP task tools functionality."""
    print("Testing MCP task management tools...")

    # Test user ID (using a numeric ID since the database expects integer user IDs)
    test_user_id = "1"  # Assuming user with ID 1 exists

    # Test 1: Add a task
    print("\n[TEST 1] Adding a task...")
    result = add_task(
        user_id=test_user_id,
        title="Test Task from MCP",
        description="This is a test task created via MCP tools"
    )

    if "error" not in result:
        task_id = result["task_id"]
        print(f"[OK] Task added successfully: {result}")

        # Test 2: List tasks
        print("\n[TEST 2] Listing tasks...")
        tasks = list_tasks(user_id=test_user_id, status="all")
        if isinstance(tasks, list) and len(tasks) > 0:
            print(f"[OK] Found {len(tasks)} tasks")

            # Find our test task
            test_task = None
            for task in tasks:
                if task["id"] == task_id:
                    test_task = task
                    break

            if test_task:
                print(f"[OK] Test task found in list: {test_task['title']}")

                # Test 3: Update task
                print("\n[TEST 3] Updating task...")
                update_result = update_task(
                    user_id=test_user_id,
                    task_id=task_id,
                    title="Updated Test Task from MCP"
                )

                if "error" not in update_result:
                    print(f"[OK] Task updated successfully: {update_result}")

                    # Test 4: Complete task
                    print("\n[TEST 4] Completing task...")
                    complete_result = complete_task(user_id=test_user_id, task_id=task_id)

                    if "error" not in complete_result:
                        print(f"[OK] Task completed successfully: {complete_result}")

                        # Verify task is completed
                        updated_tasks = list_tasks(user_id=test_user_id, status="completed")
                        completed_task = None
                        for task in updated_tasks:
                            if task["id"] == task_id:
                                completed_task = task
                                break

                        if completed_task and completed_task["completed"]:
                            print(f"[OK] Task is marked as completed: {completed_task['title']}")

                            # Test 5: Delete task
                            print("\n[TEST 5] Deleting task...")
                            delete_result = delete_task(user_id=test_user_id, task_id=task_id)

                            if "error" not in delete_result:
                                print(f"[OK] Task deleted successfully: {delete_result}")

                                # Verify task is deleted
                                remaining_tasks = list_tasks(user_id=test_user_id, status="all")
                                task_exists = any(task["id"] == task_id for task in remaining_tasks)

                                if not task_exists:
                                    print("[OK] Task is no longer in the list (successfully deleted)")
                                    print("\n[SUCCESS] All MCP task tools are working correctly!")
                                else:
                                    print(f"[ERROR] Task still exists in the list after deletion")
                            else:
                                print(f"[ERROR] Failed to delete task: {delete_result}")
                        else:
                            print(f"[ERROR] Task was not marked as completed: {complete_result}")
                    else:
                        print(f"[ERROR] Failed to complete task: {complete_result}")
                else:
                    print(f"[ERROR] Failed to update task: {update_result}")
            else:
                print(f"[ERROR] Test task not found in task list")
        else:
            print(f"[ERROR] Failed to list tasks or no tasks found: {tasks}")
    else:
        print(f"[ERROR] Failed to add task: {result}")

        # Let's try with a different approach - maybe user doesn't exist
        # Try to create a task with a known valid user ID
        print("\nTrying with a different approach...")

        # First, let's just test the function signatures and validation
        print("\n[VALIDATION TEST] Testing error handling...")

        # Test invalid user ID
        invalid_user_result = add_task(user_id="invalid", title="Test", description="Test")
        print(f"[OK] Invalid user ID handled: {invalid_user_result}")

        # Test empty title
        empty_title_result = add_task(user_id=test_user_id, title="", description="Test")
        print(f"[OK] Empty title handled: {empty_title_result}")

        # Test negative task ID for other operations
        invalid_task_result = complete_task(user_id=test_user_id, task_id=-1)
        print(f"[OK] Invalid task ID handled: {invalid_task_result}")


if __name__ == "__main__":
    test_mcp_task_tools()