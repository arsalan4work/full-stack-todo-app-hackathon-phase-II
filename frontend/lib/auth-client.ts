// lib/auth-client.ts
import { auth } from "./auth";
import { useState, useEffect } from 'react';

// Define the hooks manually since better-auth/react may not be available
export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session from auth client
    const fetchSession = async () => {
      try {
        const sessionData = await auth.getSession();
        setSession(sessionData?.session || sessionData);
      } catch (error) {
        console.error('Error getting session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { data: session, isLoading: loading };
}

// Sign in function - FIXED: removed .email() call
export async function signIn(credentials: { email: string; password: string }) {
  try {
    // Call the backend auth sign-in method directly (no .email())
    const response = await auth.signIn(credentials);
    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Sign out function
export async function signOut() {
  try {
    const response = await auth.signOut();
    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Helper function to get the current user ID from the session
export async function getCurrentUserId(): Promise<string | number | null> {
  try {
    const sessionData = await auth.getSession();
    if (sessionData?.session?.user?.id) {
      return sessionData.session.user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

// Helper function to sign up a new user
export async function signUp(credentials: { email: string; password: string }) {
  try {
    // Call the backend auth sign-up method
    const response = await auth.signUp(credentials);
    return response;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}