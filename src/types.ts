export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserNotificationPreferences {
  emailNotifications: boolean;
  loginNotifications: boolean;
  taskReminders: boolean;
  dueTodayReminders: boolean;
  overdueReminders: boolean;
  timezone: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  reminderEnabled?: boolean;
  reminderOneDaySent?: boolean;
  reminderDueTodaySent?: boolean;
  overdueNotificationSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  notificationPreferences?: UserNotificationPreferences;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  newThisWeek: number;
}

export interface FilterOptions {
  status: 'ALL' | TaskStatus;
  priority: 'ALL' | TaskPriority;
  search: string;
  sort: 'newest' | 'oldest' | 'dueDate' | 'priority';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface DeadlineNotification {
  id: string;
  taskId: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  urgency: 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON';
  daysRemaining: number;
  message: string;
  isRead: boolean;
}

export type ViewTab = 'dashboard' | 'tasks' | 'completed' | 'settings';
