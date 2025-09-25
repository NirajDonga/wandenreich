import { API_ENDPOINTS } from '../utils/constants';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  provider: 'credentials' | 'google';
  status?: string;
  lastLogin?: string;
}

class UserService {
  async getUsers(): Promise<User[]> {
    const response = await fetch(API_ENDPOINTS.USERS);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }

  async createUser(userData: Omit<User, '_id'>): Promise<User> {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  }

  async updateUser(userData: User): Promise<User> {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return response.json();
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId })
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }
}

export const userService = new UserService();