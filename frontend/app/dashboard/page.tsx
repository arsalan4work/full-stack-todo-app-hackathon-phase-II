"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle,
  Clock,
  ListTodo,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Centralized API URL configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  // Get token helper function
  const getToken = () => {
    return localStorage.getItem("auth-token");
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatInput.trim() || !userId || isLoading) return;

    try {
      setIsLoading(true);

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: Date.now(),
        role: 'user',
        content: chatInput,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, userMessage]);
      const newChatInput = chatInput;
      setChatInput('');

      // Get token from localStorage
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Prepare the request payload
      const payload: any = {
        message: newChatInput,
      };

      // Add conversation_id if we have one
      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      // Debug logging
      console.log('Chat request details:');
      console.log('URL:', `${API_URL}/api/${userId}/chat`);
      console.log('Payload:', payload);
      console.log('Token present:', !!token);

      // Send message to backend
      // Backend route: /api/{user_id}/chat
      const response = await fetch(`${API_URL}/api/${userId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant response to UI
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Update conversation ID
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Check if the response indicates that tasks were modified
      // and refresh the task list if needed
      if (data.response.toLowerCase().includes('task') &&
          (data.response.toLowerCase().includes('created') ||
           data.response.toLowerCase().includes('updated') ||
           data.response.toLowerCase().includes('deleted') ||
           data.response.toLowerCase().includes('completed'))) {
        // Refresh the task list after a short delay
        setTimeout(async () => {
          await fetchTasks(userId);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message. Please try again.', 'error');

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("Token payload:", payload);
          console.log("User ID from token:", payload.sub);
          setUserId(payload.sub);
          await fetchTasks(payload.sub);
        } catch (error) {
          console.error("Error parsing token:", error);
          showToast(
            "Invalid authentication token. Please log in again.",
            "error"
          );
        }
      } else {
        console.error("No auth token found in localStorage");
        showToast("Please log in to view your tasks", "error");
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchTasks = async (uid: string) => {
    try {
      const token = getToken();

      console.log("Fetching tasks for user:", uid);
      console.log("Token exists:", !!token);
      console.log("API URL:", `${API_URL}/api/users/${uid}/tasks`);

      const response = await fetch(`${API_URL}/api/users/${uid}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch tasks:", response.status, errorData);
        if (response.status === 401) {
          showToast("Authentication failed. Please log in again.", "error");
        } else {
          showToast("Failed to fetch tasks. Please check your connection.", "error");
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showToast("Cannot connect to server. Please check if the backend is running.", "error");
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim() || !userId) return;

    try {
      const token = getToken();

      console.log("Creating task...");
      console.log("User ID:", userId);
      console.log("Token exists:", !!token);
      console.log("Request URL:", `${API_URL}/api/users/${userId}/tasks`);

      const response = await fetch(`${API_URL}/api/users/${userId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
        }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        await fetchTasks(userId);
        setNewTask({ title: "", description: "" });
        setShowCreateModal(false);
        showToast("Task created successfully!");
      } else {
        const error = await response.json();
        console.error("Failed to create task:", error);
        showToast(
          `Failed to create task: ${error.detail || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating task:", error);
      showToast("Failed to create task. Check server connection.", "error");
    }
  };

  const toggleComplete = async (taskId: number) => {
    if (!userId) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/users/${userId}/tasks/${taskId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchTasks(userId);
        showToast("Task updated!");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      showToast("Failed to update task", "error");
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!userId) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/users/${userId}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchTasks(userId);
        showToast("Task deleted!");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Failed to delete task", "error");
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditForm({ title: task.title, description: task.description || "" });
  };

  const saveEdit = async (taskId: number) => {
    if (!userId || !editForm.title.trim()) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/users/${userId}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editForm.title,
            description: editForm.description || null,
          }),
        }
      );

      if (response.ok) {
        await fetchTasks(userId);
        setEditingTask(null);
        showToast("Task updated!");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Failed to update task", "error");
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Task Dashboard</h1>
        <p className="text-gray-400">Manage your tasks efficiently</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Your Tasks</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                No tasks yet. Create one to get started!
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
              >
                {editingTask === task.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTask(null)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        task.completed
                          ? "bg-green-500 border-green-500"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      {task.completed && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          task.completed
                            ? "text-gray-500 line-through"
                            : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(task)}
                        className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl w-80 h-96 flex flex-col">
            <div className="bg-gray-900/80 rounded-t-xl p-4 flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-3 font-semibold text-white">Task Assistant</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-300'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white rounded-lg px-4 py-2 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-700">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your tasks..."
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  disabled={!userId || isLoading}
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  disabled={!userId || isLoading || !chatInput.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button
            onClick={async () => {
              setIsChatOpen(true);
              // Initialize chat with user-specific greeting if not already done
              if (chatMessages.length === 0 && userId) {
                try {
                  const token = getToken();
                  if (!token) return;

                  // Get user info to personalize greeting
                  const response = await fetch(`${API_URL}/api/users/${userId}/tasks`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });

                  if (response.ok) {
                    const userTasks = await response.json();
                    const userName = `User ${userId}`;

                    setChatMessages([
                      {
                        id: Date.now(),
                        role: 'assistant',
                        content: `Hello ${userName}! I'm your task assistant. I see you have ${userTasks.length} tasks. How can I help you today?`,
                        timestamp: new Date(),
                      }
                    ]);
                  } else {
                    setChatMessages([
                      {
                        id: Date.now(),
                        role: 'assistant',
                        content: `Hello! I'm your task assistant. How can I help you with your tasks today?`,
                        timestamp: new Date(),
                      }
                    ]);
                  }
                } catch (error) {
                  setChatMessages([
                    {
                      id: Date.now(),
                      role: 'assistant',
                      content: `Hello! I'm your task assistant. How can I help you with your tasks today?`,
                      timestamp: new Date(),
                    }
                  ]);
                }
              }
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
            title="Open Task Assistant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
              <path d="M7.9 5.9A2.1 2.1 0 0 0 10 8v6a2.1 2.1 0 0 1-4.2 0V8a2.1 2.1 0 0 1 2.2-2.1z"/>
              <path d="M12 12h4"/>
              <path d="M7.9 18.1c2.3-.7 4.1-2.5 4.8-4.8"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </button>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Create New Task
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Enter task title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTask.title.trim()) {
                      createTask();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-purple-500 focus:outline-none"
                  rows={3}
                  placeholder="Enter task description (optional)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTask({ title: "", description: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}