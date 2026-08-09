import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserNotificationPreferences {
  emailNotifications: boolean;
  loginNotifications: boolean;
  taskReminders: boolean;
  dueTodayReminders: boolean;
  overdueReminders: boolean;
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  isGuest: boolean;
  createdAt: string;
  notificationPreferences?: UserNotificationPreferences;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

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

interface DatabaseData {
  users: User[];
  tasks: Task[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed tasks template
const DEFAULT_SEED_TASKS = [
  {
    title: 'Review TaskFlow Figma design specs',
    description: 'Ensure exact visual alignment for typography, component borders, and color palette tokens.',
    status: 'COMPLETED' as TaskStatus,
    priority: 'HIGH' as TaskPriority,
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    reminderEnabled: true,
  },
  {
    title: 'Implement JWT guest authentication',
    description: 'Provide seamless instant access for guest users with session persistence and secure token storage.',
    status: 'COMPLETED' as TaskStatus,
    priority: 'HIGH' as TaskPriority,
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    reminderEnabled: true,
  },
  {
    title: 'Build REST API endpoints & database models',
    description: 'Create endpoints for tasks CRUD, filtering, priority sorting, and dynamic statistics calculation.',
    status: 'IN_PROGRESS' as TaskStatus,
    priority: 'HIGH' as TaskPriority,
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    reminderEnabled: true,
  },
  {
    title: 'Optimize mobile responsiveness & animations',
    description: 'Refine drawer menus, bottom navigation, card hover states, and smooth modal entrance transitions.',
    status: 'IN_PROGRESS' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    reminderEnabled: true,
  },
  {
    title: 'Conduct full-stack QA & test dark mode theme',
    description: 'Verify accessibility standards, keyboard navigation, Zod validation, and error state handling.',
    status: 'TODO' as TaskStatus,
    priority: 'LOW' as TaskPriority,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    reminderEnabled: true,
  },
];

class Database {
  private data: DatabaseData = { users: [], tasks: [] };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database file, falling back to in-memory:', err);
      this.data = { users: [], tasks: [] };
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  // Users
  findUserById(id: string): User | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (user && !user.notificationPreferences) {
      user.notificationPreferences = {
        emailNotifications: true,
        loginNotifications: true,
        taskReminders: true,
        dueTodayReminders: true,
        overdueReminders: true,
        timezone: 'Asia/Kolkata',
      };
    }
    return user;
  }

  findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  private hashPassword(password: string): string {
    return crypto.pbkdf2Sync(password, 'taskflow_salt_2026', 10000, 64, 'sha512').toString('hex');
  }

  createUserWithPassword(name: string, email: string, password: string): User {
    const userId = 'usr_' + Math.random().toString(36).substring(2, 10);
    const passwordHash = this.hashPassword(password);

    const user: User = {
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      isGuest: false,
      createdAt: new Date().toISOString(),
      notificationPreferences: {
        emailNotifications: true,
        loginNotifications: true,
        taskReminders: true,
        dueTodayReminders: true,
        overdueReminders: true,
        timezone: 'Asia/Kolkata',
      },
    };
    this.data.users.push(user);

    // Seed default tasks for newly registered user
    const now = new Date();
    DEFAULT_SEED_TASKS.forEach((template, index) => {
      const task: Task = {
        id: 'task_' + Math.random().toString(36).substring(2, 11),
        userId: user.id,
        title: template.title,
        description: template.description,
        status: template.status,
        priority: template.priority,
        dueDate: template.dueDate,
        reminderEnabled: template.reminderEnabled ?? true,
        reminderOneDaySent: false,
        reminderDueTodaySent: false,
        overdueNotificationSent: false,
        createdAt: new Date(now.getTime() - (index + 1) * 3600000).toISOString(),
        updatedAt: new Date(now.getTime() - (index + 1) * 3600000).toISOString(),
      };
      this.data.tasks.push(task);
    });

    this.save();
    return user;
  }

  verifyUserCredentials(email: string, password: string): User | null {
    const user = this.findUserByEmail(email);
    if (!user || !user.passwordHash) return null;

    const computedHash = this.hashPassword(password);
    if (crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(user.passwordHash))) {
      return user;
    }
    return null;
  }

  createGuestUser(): User {
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
    const user: User = {
      id: guestId,
      name: 'Guest User',
      email: `${guestId}@taskflow.app`,
      isGuest: true,
      createdAt: new Date().toISOString(),
      notificationPreferences: {
        emailNotifications: true,
        loginNotifications: true,
        taskReminders: true,
        dueTodayReminders: true,
        overdueReminders: true,
        timezone: 'Asia/Kolkata',
      },
    };
    this.data.users.push(user);

    // Seed default tasks for this guest user
    const now = new Date();
    DEFAULT_SEED_TASKS.forEach((template, index) => {
      const task: Task = {
        id: 'task_' + Math.random().toString(36).substring(2, 11),
        userId: user.id,
        title: template.title,
        description: template.description,
        status: template.status,
        priority: template.priority,
        dueDate: template.dueDate,
        reminderEnabled: template.reminderEnabled ?? true,
        reminderOneDaySent: false,
        reminderDueTodaySent: false,
        overdueNotificationSent: false,
        createdAt: new Date(now.getTime() - (index + 1) * 3600000).toISOString(),
        updatedAt: new Date(now.getTime() - (index + 1) * 3600000).toISOString(),
      };
      this.data.tasks.push(task);
    });

    this.save();
    return user;
  }

  updateUserNotificationPreferences(userId: string, prefs: Partial<UserNotificationPreferences>): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;

    user.notificationPreferences = {
      emailNotifications: true,
      loginNotifications: true,
      taskReminders: true,
      dueTodayReminders: true,
      overdueReminders: true,
      timezone: 'Asia/Kolkata',
      ...user.notificationPreferences,
      ...prefs,
    };

    this.save();
    return user;
  }

  // Tasks
  getTasksByUserId(
    userId: string,
    filters?: {
      status?: string;
      priority?: string;
      search?: string;
      sort?: string;
    }
  ): Task[] {
    let tasks = this.data.tasks.filter((t) => t.userId === userId);

    if (filters?.status && filters.status !== 'ALL') {
      tasks = tasks.filter((t) => t.status === filters.status);
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      tasks = tasks.filter((t) => t.priority === filters.priority);
    }

    if (filters?.search) {
      const term = filters.search.toLowerCase().trim();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    // Sorting
    const sort = filters?.sort || 'newest';
    tasks = [...tasks].sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sort === 'priority') {
        const priorityMap: Record<TaskPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityMap[b.priority] - priorityMap[a.priority];
      }
      return 0;
    });

    return tasks;
  }

  getTaskById(id: string, userId: string): Task | undefined {
    return this.data.tasks.find((t) => t.id === id && t.userId === userId);
  }

  getAllTasksForReminders(): Task[] {
    return this.data.tasks;
  }

  createTask(userId: string, input: Partial<Task> & { title: string }): Task {
    const task: Task = {
      id: 'task_' + Math.random().toString(36).substring(2, 11),
      userId,
      title: input.title,
      description: input.description || '',
      status: input.status || 'TODO',
      priority: input.priority || 'MEDIUM',
      dueDate: input.dueDate || null,
      reminderEnabled: input.reminderEnabled !== undefined ? input.reminderEnabled : true,
      reminderOneDaySent: false,
      reminderDueTodaySent: false,
      overdueNotificationSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.tasks.unshift(task);
    this.save();
    return task;
  }

  updateTask(id: string, userId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>): Task | null {
    const index = this.data.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const existing = this.data.tasks[index];

    // Reset reminder flags if due date changes
    let resetReminderFlags = {};
    if (updates.dueDate !== undefined && updates.dueDate !== existing.dueDate) {
      resetReminderFlags = {
        reminderOneDaySent: false,
        reminderDueTodaySent: false,
        overdueNotificationSent: false,
      };
    }

    const updated: Task = {
      ...existing,
      ...updates,
      ...resetReminderFlags,
      updatedAt: new Date().toISOString(),
    };

    this.data.tasks[index] = updated;
    this.save();
    return updated;
  }

  updateTaskReminderFlags(
    taskId: string,
    flags: Partial<Pick<Task, 'reminderOneDaySent' | 'reminderDueTodaySent' | 'overdueNotificationSent'>>
  ): boolean {
    const index = this.data.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return false;

    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...flags,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return true;
  }

  deleteTask(id: string, userId: string): boolean {
    const index = this.data.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return false;

    this.data.tasks.splice(index, 1);
    this.save();
    return true;
  }

  seedUserData(userId: string): Task[] {
    // Clear existing tasks for user
    this.data.tasks = this.data.tasks.filter((t) => t.userId !== userId);
    const now = new Date();

    const seededTasks: Task[] = DEFAULT_SEED_TASKS.map((template, index) => ({
      id: 'task_' + Math.random().toString(36).substring(2, 11),
      userId,
      title: template.title,
      description: template.description,
      status: template.status,
      priority: template.priority,
      dueDate: template.dueDate,
      reminderEnabled: template.reminderEnabled,
      reminderOneDaySent: false,
      reminderDueTodaySent: false,
      overdueNotificationSent: false,
      createdAt: new Date(now.getTime() - (index + 1) * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - (index + 1) * 3600000).toISOString(),
    }));

    this.data.tasks.push(...seededTasks);
    this.save();
    return seededTasks;
  }

  getStats(userId: string) {
    const tasks = this.data.tasks.filter((t) => t.userId === userId);
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;

    // Calculate weekly count (tasks created in last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = tasks.filter((t) => new Date(t.createdAt).getTime() >= sevenDaysAgo).length;

    return {
      total,
      todo,
      inProgress,
      completed,
      newThisWeek,
    };
  }
}

export const db = new Database();
