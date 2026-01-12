// lib/auth.ts
"use client";

interface UserCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: string;
    email: string;
  };
}

interface Session {
  user: {
    id: string;
    email: string;
  };
  expiresAt: number;
}

class AuthClient {
  private baseUrl: string;
  private session: Session | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    if (this.baseUrl.endsWith('/api')) {
      this.baseUrl = this.baseUrl.slice(0, -4);
    }
  }

  async signUp(credentials: UserCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem('auth-token', data.access_token);
    }

    return data;
  }

  async signIn(credentials: UserCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem('auth-token', data.access_token);
    }

    return data;
  }

  async signOut(): Promise<void> {
    // Call backend logout endpoint (optional - for logging purposes)
    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    // Remove token from localStorage (this is the important part)
    localStorage.removeItem('auth-token');
    this.session = null;
  }

  async refreshToken(): Promise<AuthResponse | null> {
    const currentToken = this.getAuthToken();
    
    if (!currentToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If refresh fails, clear the token
        localStorage.removeItem('auth-token');
        return null;
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem('auth-token', data.access_token);
      }

      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('auth-token');
      return null;
    }
  }

  async getSession(): Promise<{ session: Session | null } | null> {
    const token = localStorage.getItem('auth-token');

    if (!token) {
      return { session: null };
    }

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const session: Session = {
          user: {
            id: payload.sub || '',
            email: payload.email || '',
          },
          expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 3600000,
        };

        if (Date.now() > session.expiresAt) {
          localStorage.removeItem('auth-token');
          return { session: null };
        }

        return { session };
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      localStorage.removeItem('auth-token');
      return { session: null };
    }

    return { session: null };
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth-token');
  }
}

const authClient = new AuthClient();

export const auth = {
  signIn: authClient.signIn.bind(authClient),
  signUp: authClient.signUp.bind(authClient),
  signOut: authClient.signOut.bind(authClient),
  getSession: authClient.getSession.bind(authClient),
  refreshToken: authClient.refreshToken.bind(authClient),
};

export { authClient };