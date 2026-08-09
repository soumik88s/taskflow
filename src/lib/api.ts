import { FilterOptions, Task, TaskStats, User, UserNotificationPreferences } from '../types';

const TOKEN_KEY = 'taskflow_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || `API Error (${response.status})`);
  }

  return data as T;
}

export const api = {
  getToken,
  setToken,
  clearToken,

  // Auth API
  async login(credentials: { email: string; password: string }): Promise<{ accessToken: string; user: User }> {
    const res = await request<{ success: boolean; accessToken: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setToken(res.accessToken);
    return res;
  },

  async register(data: { name: string; email: string; password: string }): Promise<{ accessToken: string; user: User }> {
    const res = await request<{ success: boolean; accessToken: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(res.accessToken);
    return res;
  },

  async loginAsGuest(): Promise<{ accessToken: string; user: User }> {
    const res = await request<{ success: boolean; accessToken: string; user: User }>('/api/auth/guest', {
      method: 'POST',
    });
    setToken(res.accessToken);
    return res;
  },

  async getMe(): Promise<User> {
    const res = await request<{ success: boolean; user: User }>('/api/auth/me');
    return res.user;
  },

  // User Preferences API
  async getUserPreferences(): Promise<UserNotificationPreferences> {
    const res = await request<{ success: boolean; preferences: UserNotificationPreferences }>('/api/user/preferences');
    return res.preferences;
  },

  async updateUserPreferences(prefs: Partial<UserNotificationPreferences>): Promise<UserNotificationPreferences> {
    const res = await request<{ success: boolean; preferences: UserNotificationPreferences }>('/api/user/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    });
    return res.preferences;
  },

  async triggerRemindersEvaluation(): Promise<{ processedCount: number; emailsSent: number }> {
    const res = await request<{ success: boolean; result: { processedCount: number; emailsSent: number } }>('/api/reminders/trigger', {
      method: 'POST',
    });
    return res.result;
  },

  // Task API
  async getTasks(filters?: FilterOptions): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
    }

    const queryString = params.toString();
    const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`;
    const res = await request<{ success: boolean; data: Task[] }>(endpoint);
    return res.data;
  },

  async getStats(): Promise<TaskStats> {
    const res = await request<{ success: boolean; data: TaskStats }>('/api/tasks/stats');
    return res.data;
  },

  async createTask(taskData: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string | null;
    reminderEnabled?: boolean;
  }): Promise<Task> {
    const res = await request<{ success: boolean; data: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return res.data;
  },

  async updateTask(
    id: string,
    updates: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      reminderEnabled?: boolean;
    }
  ): Promise<Task> {
    const res = await request<{ success: boolean; data: Task }>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  async deleteTask(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async seedTasks(): Promise<Task[]> {
    const res = await request<{ success: boolean; data: Task[] }>('/api/tasks/seed', {
      method: 'POST',
    });
    return res.data;
  },
};
