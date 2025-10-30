/**
 * API Key Service
 * Handles API key storage and retrieval from the backend
 */

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface ApiKeyService {
  service_name: string;
  created_at: string;
  updated_at: string;
  last_used?: string;
}

/**
 * Store or update an API key for a service
 */
export async function storeApiKey(serviceName: string, apiKey: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ serviceName, apiKey }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to store API key');
  }
}

/**
 * Retrieve an API key for a service
 */
export async function getApiKey(serviceName: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/keys/${serviceName}`, {
      credentials: 'include',
    });

    if (response.status === 404) {
      return null;
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      return null;
    }

    return data.apiKey || null;
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
}

/**
 * Check if user has an API key for a service
 */
export async function hasApiKey(serviceName: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/keys/${serviceName}/check`, {
      credentials: 'include',
    });

    const data = await response.json();
    return data.hasKey || false;
  } catch (error) {
    console.error('Error checking API key:', error);
    return false;
  }
}

/**
 * Get all services that user has API keys for
 */
export async function getApiKeyServices(): Promise<ApiKeyService[]> {
  try {
    const response = await fetch(`${API_URL}/api/keys`, {
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return [];
    }

    return data.services || [];
  } catch (error) {
    console.error('Error retrieving API key services:', error);
    return [];
  }
}

/**
 * Delete an API key for a service
 */
export async function deleteApiKey(serviceName: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/keys/${serviceName}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete API key');
  }
}

/**
 * Validate an API key without storing it
 */
export async function validateApiKey(serviceName: string, apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/keys/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ serviceName, apiKey }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return false;
    }

    return data.valid || false;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}
