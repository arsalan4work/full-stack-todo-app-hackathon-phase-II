import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar';
import { cookies } from 'next/headers';

// This is a server component that checks authentication
async function checkAuth() {
  // In a real Better Auth implementation, you would verify the session token
  // from cookies or headers. For this implementation, we'll check for a session cookie.
  const authCookie = cookies().get('better-auth.session_token');

  // If no session token exists, the user is not authenticated
  if (!authCookie) {
    return false;
  }

  // In a real implementation, you would validate the token with Better Auth
  // For now, we'll assume if the cookie exists, the user is authenticated
  return true;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const isAuthenticated = await checkAuth();

  // If not authenticated, redirect to sign in
  if (!isAuthenticated) {
    redirect('/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}