import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTasks } from '@/lib/api-client-server'; // Import server-side API client
import CreateTaskForm from '@/components/create-task-form';
import TaskList from '@/components/task-list';

// Server component to get user ID
async function getUserId() {
  // In a real Better Auth implementation, you would verify the session token
  // and extract user information from the session
  const authCookie = cookies().get('better-auth.session_token');

  if (!authCookie) {
    return null;
  }

  // In a real implementation, you would decode and validate the token to get the user ID
  // For now, we'll return a placeholder ID to simulate the functionality
  // In practice, Better Auth would provide a way to get user info from the session
  return "user-placeholder-id"; // This would come from the validated session
}

export default async function DashboardPage() {
  const userId = await getUserId();

  if (!userId) {
    redirect('/signin');
  }

  // Try to fetch tasks for the user
  let initialTasks = [];
  try {
    // This will likely fail initially since the backend may not be running
    initialTasks = await getTasks(userId);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Continue with empty tasks array
  }

  // In a real implementation, you would fetch tasks for the user from the API
  // For now, we'll pass the user ID to the components for them to use
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your tasks efficiently</p>
      </div>

      <CreateTaskForm userId={userId} />

      <div className="bg-white rounded-lg shadow p-6">
        <TaskList userId={userId} initialTasks={initialTasks} />
      </div>
    </div>
  );
}