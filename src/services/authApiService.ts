/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Log the API URL on load to help with debugging
console.log('[AuthAPI] Using backend URL:', API_URL);
if (!import.meta.env.VITE_BACKEND_URL) {
  console.warn('[AuthAPI] VITE_BACKEND_URL not set, using default:', API_URL);
}

interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  active: boolean;
  created_at: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

/**
 * Register a new user
 */
export async function register(email: string, password: string, name: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies/sessions
      body: JSON.stringify({ email, password, name }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    if (!data.user) {
      throw new Error('No user data received');
    }

    return data.user;
  } catch (error: any) {
    // Handle network errors (server not running, CORS issues, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to server at ${API_URL}. Please ensure the backend server is running.`);
    }
    // Re-throw other errors as-is
    throw error;
  }
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Login failed');
    }

    if (!data.user) {
      throw new Error('No user data received');
    }

    return data.user;
  } catch (error: any) {
    // Handle network errors (server not running, CORS issues, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to server at ${API_URL}. Please ensure the backend server is running.`);
    }
    // Re-throw other errors as-is
    throw error;
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  const data: AuthResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Logout failed');
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('[AuthAPI] Fetching current user from:', `${API_URL}/api/auth/me`);
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });

    console.log('[AuthAPI] Response status:', response.status);

    if (response.status === 401) {
      // User not authenticated
      console.log('[AuthAPI] User not authenticated (401)');
      return null;
    }

    const data: AuthResponse = await response.json();
    console.log('[AuthAPI] Response data:', { success: data.success, hasUser: !!data.user });

    if (!response.ok || !data.success) {
      console.log('[AuthAPI] Auth check failed:', data.error || 'Unknown error');
      return null;
    }

    return data.user || null;
  } catch (error) {
    console.error('[AuthAPI] Error fetching current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/check`, {
      credentials: 'include',
    });

    const data = await response.json();
    return data.authenticated || false;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: {
  name?: string;
  initials?: string;
  color?: string;
  avatar?: string;
}): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Profile update failed');
  }

  if (!data.user) {
    throw new Error('No user data received');
  }

  return data.user;
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Password change failed');
  }
}
