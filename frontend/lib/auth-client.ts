import { auth } from "./auth";
import { useState, useEffect } from 'react';

// Define the hooks manually since better-auth/react may not be available
export function useSession() {
  // This would normally use React state to manage session
  // For now, we'll return a basic implementation
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session from auth client
    auth.getSession()
      .then(data => {
        setSession(data?.session || data);
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });
  }, []);

  return { data: session, isLoading: loading };
}

export async function signIn(credentials) {
  try {
    return await auth.signIn(credentials);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    return await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}