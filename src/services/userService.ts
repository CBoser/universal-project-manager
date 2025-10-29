// ============================================
// Universal Project Manager - User Service
// ============================================

import { Collaborator } from '../types';

export interface User {
  id: string;
  name: string;
  email?: string;
  initials: string;
  color: string;
  role?: string;
  avatar?: string;
  createdAt: string;
  active: boolean;
}

const USERS_KEY = 'upm_users';

/**
 * Get all users from the database
 */
export function getAllUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

/**
 * Get a single user by ID
 */
export function getUser(userId: string): User | undefined {
  const users = getAllUsers();
  return users.find(u => u.id === userId);
}

/**
 * Create a new user
 */
export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getAllUsers();

  const newUser: User = {
    ...user,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return newUser;
}

/**
 * Update an existing user
 */
export function updateUser(userId: string, updates: Partial<User>): User | null {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  saveUsers(users);

  return users[index];
}

/**
 * Delete a user
 */
export function deleteUser(userId: string): boolean {
  const users = getAllUsers();
  const filtered = users.filter(u => u.id !== userId);

  if (filtered.length === users.length) return false;

  saveUsers(filtered);
  return true;
}

/**
 * Get active users only
 */
export function getActiveUsers(): User[] {
  return getAllUsers().filter(u => u.active);
}

/**
 * Convert Collaborator to User (for migration)
 */
export function collaboratorToUser(collaborator: Collaborator): User {
  return {
    id: collaborator.id,
    name: collaborator.name,
    email: collaborator.email,
    initials: collaborator.initials || generateInitials(collaborator.name),
    color: collaborator.color || generateUserColor(),
    role: collaborator.role,
    createdAt: new Date().toISOString(),
    active: true,
  };
}

/**
 * Import users from collaborators (migration helper)
 */
export function importCollaboratorsAsUsers(collaborators: Collaborator[]): void {
  const existingUsers = getAllUsers();
  const existingIds = new Set(existingUsers.map(u => u.id));

  const newUsers = collaborators
    .filter(c => !existingIds.has(c.id))
    .map(collaboratorToUser);

  if (newUsers.length > 0) {
    saveUsers([...existingUsers, ...newUsers]);
  }
}

/**
 * Search users by name or email
 */
export function searchUsers(query: string): User[] {
  const users = getAllUsers();
  const lowerQuery = query.toLowerCase();

  return users.filter(u =>
    u.name.toLowerCase().includes(lowerQuery) ||
    (u.email && u.email.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get user initials from name
 */
export function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a random color for user
 */
export function generateUserColor(): string {
  const colors = [
    '#00A3FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B',
    '#52B788', '#E63946', '#457B9D', '#F4A261', '#2A9D8F'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Save users to localStorage
 */
function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
    throw new Error('Failed to save users');
  }
}

/**
 * Clear all users (use with caution)
 */
export function clearAllUsers(): void {
  localStorage.removeItem(USERS_KEY);
}

/**
 * Export users to JSON
 */
export function exportUsers(): string {
  const users = getAllUsers();
  return JSON.stringify(users, null, 2);
}

/**
 * Import users from JSON
 */
export function importUsers(jsonString: string): boolean {
  try {
    const users = JSON.parse(jsonString);
    if (!Array.isArray(users)) {
      throw new Error('Invalid format: expected array');
    }

    // Validate user structure
    users.forEach(u => {
      if (!u.id || !u.name || !u.initials) {
        throw new Error('Invalid user structure');
      }
    });

    saveUsers(users);
    return true;
  } catch (error) {
    console.error('Error importing users:', error);
    return false;
  }
}
