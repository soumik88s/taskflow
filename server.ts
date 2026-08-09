import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { db, User } from './server/db.js';
import { remindersScheduler } from './server/reminders/reminders.scheduler.js';
import { remindersService } from './server/reminders/reminders.service.js';
import { emailService } from './server/email/email.service.js';
import { createServer as createViteServer } from 'vite';

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_secret_key_2026_super_secure';

interface AuthenticatedRequest extends Request {
  user?: User;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// CORS headers for local development flexibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Authentication middleware
const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Bearer token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or invalid session' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'TaskFlow REST API' });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please login instead.' });
    }

    const user = db.createUserWithPassword(name.trim(), email.trim(), password);
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    if (user.notificationPreferences?.loginNotifications) {
      emailService.sendTaskReminderEmail(user.email, {
        userName: user.name,
        taskTitle: 'Welcome to TaskFlow Workspace',
        priority: 'HIGH',
        dueDate: new Date().toLocaleTimeString('en-US'),
        taskId: 'welcome',
        type: 'LOGIN',
      }).catch((e) => console.error('Failed to send registration notification:', e));
    }

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = db.verifyUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password' });
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    if (user.notificationPreferences?.loginNotifications) {
      emailService.sendTaskReminderEmail(user.email, {
        userName: user.name,
        taskTitle: 'New Session Authenticated',
        priority: 'MEDIUM',
        dueDate: new Date().toLocaleTimeString('en-US'),
        taskId: 'login',
        type: 'LOGIN',
      }).catch((e) => console.error('Failed to send login notification:', e));
    }

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
});

app.post('/api/auth/guest', async (req, res) => {
  try {
    const user = db.createGuestUser();
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Send login notification email if user prefs permit
    if (user.notificationPreferences?.loginNotifications) {
      emailService.sendTaskReminderEmail(user.email, {
        userName: user.email,
        taskTitle: 'New Session Started',
        priority: 'MEDIUM',
        dueDate: new Date().toLocaleTimeString('en-US'),
        taskId: 'login',
        type: 'LOGIN',
      }).catch((e) => console.error('Failed to send login notification:', e));
    }

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create guest session' });
  }
});

app.get('/api/auth/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: {
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      isGuest: req.user!.isGuest,
      notificationPreferences: req.user!.notificationPreferences,
    },
  });
});

// User Preferences Endpoints
app.get('/api/user/preferences', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    preferences: req.user!.notificationPreferences,
  });
});

app.patch('/api/user/preferences', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedUser = db.updateUserNotificationPreferences(req.user!.id, req.body);
    res.json({
      success: true,
      preferences: updatedUser?.notificationPreferences,
      message: 'Notification preferences saved successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
});

// Manual Reminder Scheduler Trigger Endpoint (for testing)
app.post('/api/reminders/trigger', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await remindersService.checkAndSendReminders();
    res.json({
      success: true,
      message: 'Reminder evaluation triggered successfully',
      result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to run reminder evaluation' });
  }
});

// Task Statistics Endpoint
app.get('/api/tasks/stats', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getStats(req.user!.id);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch task statistics' });
  }
});

// Seed sample tasks endpoint
app.post('/api/tasks/seed', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const seededTasks = db.seedUserData(req.user!.id);
    res.json({ success: true, data: seededTasks, message: 'Sample tasks reseeded successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to seed sample tasks' });
  }
});

// GET /api/tasks (List tasks with filtering, search, and sorting)
app.get('/api/tasks', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, search, sort } = req.query;
    const tasks = db.getTasksByUserId(req.user!.id, {
      status: status as string,
      priority: priority as string,
      search: search as string,
      sort: sort as string,
    });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve tasks' });
  }
});

// GET /api/tasks/:id
app.get('/api/tasks/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = db.getTaskById(req.params.id, req.user!.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving task' });
  }
});

// POST /api/tasks (Create Task)
app.post('/api/tasks', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, reminderEnabled } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Task title is required and cannot be empty' });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Task title cannot exceed 100 characters' });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({ success: false, message: 'Description cannot exceed 1000 characters' });
    }

    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    const taskStatus = validStatuses.includes(status) ? status : 'TODO';
    const taskPriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

    const newTask = db.createTask(req.user!.id, {
      title: title.trim(),
      description: description ? description.trim() : '',
      status: taskStatus,
      priority: taskPriority,
      dueDate: dueDate || null,
      reminderEnabled: reminderEnabled !== undefined ? Boolean(reminderEnabled) : true,
    });

    // Check reminders immediately in background
    remindersService.checkAndSendReminders().catch((e) => console.error(e));

    res.status(201).json({ success: true, data: newTask, message: 'Task created successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id (Update Task)
app.patch('/api/tasks/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, reminderEnabled } = req.body;

    const updates: any = {};
    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Task title cannot be empty' });
      }
      if (title.trim().length > 100) {
        return res.status(400).json({ success: false, message: 'Task title cannot exceed 100 characters' });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (description && description.length > 1000) {
        return res.status(400).json({ success: false, message: 'Description cannot exceed 1000 characters' });
      }
      updates.description = description.trim();
    }

    if (status !== undefined) {
      const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
      updates.status = status;
    }

    if (priority !== undefined) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ success: false, message: 'Invalid priority value' });
      }
      updates.priority = priority;
    }

    if (dueDate !== undefined) {
      updates.dueDate = dueDate || null;
    }

    if (reminderEnabled !== undefined) {
      updates.reminderEnabled = Boolean(reminderEnabled);
    }

    const updatedTask = db.updateTask(req.params.id, req.user!.id, updates);
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Trigger reminder evaluation if status or due date updated
    remindersService.checkAndSendReminders().catch((e) => console.error(e));

    res.json({ success: true, data: updatedTask, message: 'Task updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id (Delete Task)
app.delete('/api/tasks/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteTask(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

// Start Express + Vite Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow Server running on http://0.0.0.0:${PORT}`);
    // Start background email reminder scheduler
    remindersScheduler.start();
  });
}

startServer();
