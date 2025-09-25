import { API_ENDPOINTS } from '../utils/constants';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  dueDate: string;
  createdAt: string;
}

class TaskService {
  async getTasks(): Promise<Task[]> {
    const response = await fetch(API_ENDPOINTS.TASKS);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  }

  async createTask(taskData: Omit<Task, '_id'>): Promise<Task> {
    const response = await fetch(API_ENDPOINTS.TASKS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  }

  async updateTask(taskData: Task): Promise<Task> {
    const response = await fetch(API_ENDPOINTS.TASKS, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  }

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.TASKS, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId })
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  }

  async updateTaskStatus(taskId: string, status: 'To Do' | 'In Progress' | 'Done'): Promise<Task> {
    const response = await fetch(`${API_ENDPOINTS.TASKS}/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update task status');
    }
    return response.json();
  }
}

export const taskService = new TaskService();