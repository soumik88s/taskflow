import { db, Task, User } from '../db.js';
import { emailService } from '../email/email.service.js';
import { DEFAULT_TIMEZONE } from './reminders.constants.js';

export class RemindersService {
  /**
   * Helper to format dates in user's timezone (default Asia/Kolkata)
   */
  private formatInTimezone(dateStr: string, timezone: string = DEFAULT_TIMEZONE): { dateFormatted: string; timeFormatted: string; yyyymmdd: string } {
    try {
      const date = new Date(dateStr);
      const yyyymmdd = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
      const dateFormatted = new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'long', day: 'numeric', year: 'numeric' }).format(date);
      const timeFormatted = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: true }).format(date);

      return { dateFormatted, timeFormatted, yyyymmdd };
    } catch {
      const date = new Date(dateStr);
      return {
        dateFormatted: date.toLocaleDateString('en-US'),
        timeFormatted: date.toLocaleTimeString('en-US'),
        yyyymmdd: date.toISOString().split('T')[0],
      };
    }
  }

  /**
   * Main processor method executed by scheduler every 10-15 minutes
   */
  async checkAndSendReminders(): Promise<{ processedCount: number; emailsSent: number }> {
    console.log(`[RemindersService] Starting periodic reminder evaluation cycle...`);

    const allTasks = db.getAllTasksForReminders();
    let processedCount = 0;
    let emailsSent = 0;

    const now = new Date();

    for (const task of allTasks) {
      if (!task.dueDate || task.status === 'COMPLETED' || task.reminderEnabled === false) {
        continue;
      }

      const user = db.findUserById(task.userId);
      if (!user) continue;

      // Check global email notification toggle
      const prefs = user.notificationPreferences || {
        emailNotifications: true,
        loginNotifications: true,
        taskReminders: true,
        dueTodayReminders: true,
        overdueReminders: true,
        timezone: DEFAULT_TIMEZONE,
      };

      if (!prefs.emailNotifications) continue;

      const userTz = prefs.timezone || DEFAULT_TIMEZONE;

      // Get current date YYYY-MM-DD in user's timezone
      const nowTz = this.formatInTimezone(now.toISOString(), userTz);
      const taskTz = this.formatInTimezone(task.dueDate, userTz);

      const nowTime = now.getTime();
      const taskTime = new Date(task.dueDate).getTime();
      const diffHours = (taskTime - nowTime) / (1000 * 60 * 60);

      // Determine calendar day difference
      const nowDateObj = new Date(nowTz.yyyymmdd);
      const taskDateObj = new Date(taskTz.yyyymmdd);
      const dayDiff = Math.round((taskDateObj.getTime() - nowDateObj.getTime()) / (1000 * 60 * 60 * 24));

      // 1. ONE DAY BEFORE REMINDER
      // Conditions: dayDiff === 1 or (diffHours > 0 && diffHours <= 30), task.reminderOneDaySent is false, user enabled taskReminders
      if (
        (dayDiff === 1 || (diffHours > 0 && diffHours <= 30)) &&
        !task.reminderOneDaySent &&
        prefs.taskReminders
      ) {
        processedCount++;
        console.log(`[RemindersService] Sending 1-day reminder for task "${task.title}" to ${user.email}`);

        const sentSuccess = await emailService.sendTaskReminderEmail(user.email, {
          userName: user.name,
          taskTitle: task.title,
          taskDescription: task.description,
          priority: task.priority,
          dueDate: taskTz.dateFormatted,
          dueTime: taskTz.timeFormatted,
          taskId: task.id,
          type: 'ONE_DAY_BEFORE',
        });

        if (sentSuccess) {
          db.updateTaskReminderFlags(task.id, { reminderOneDaySent: true });
          emailsSent++;
        }
        continue;
      }

      // 2. DUE TODAY REMINDER
      // Conditions: dayDiff === 0 or (diffHours >= -12 && diffHours <= 12), task.reminderDueTodaySent is false, user enabled dueTodayReminders
      if (
        (dayDiff === 0 || (diffHours >= -12 && diffHours <= 12)) &&
        !task.reminderDueTodaySent &&
        prefs.dueTodayReminders
      ) {
        processedCount++;
        console.log(`[RemindersService] Sending Due-Today reminder for task "${task.title}" to ${user.email}`);

        const sentSuccess = await emailService.sendTaskReminderEmail(user.email, {
          userName: user.name,
          taskTitle: task.title,
          taskDescription: task.description,
          priority: task.priority,
          dueDate: taskTz.dateFormatted,
          dueTime: taskTz.timeFormatted,
          taskId: task.id,
          type: 'DUE_TODAY',
        });

        if (sentSuccess) {
          db.updateTaskReminderFlags(task.id, { reminderDueTodaySent: true });
          emailsSent++;
        }
        continue;
      }

      // 3. OVERDUE REMINDER
      // Conditions: dayDiff < 0 or diffHours < -12, task.overdueNotificationSent is false, user enabled overdueReminders
      if (
        (dayDiff < 0 || diffHours < -12) &&
        !task.overdueNotificationSent &&
        prefs.overdueReminders
      ) {
        processedCount++;
        console.log(`[RemindersService] Sending Overdue notification for task "${task.title}" to ${user.email}`);

        const sentSuccess = await emailService.sendTaskReminderEmail(user.email, {
          userName: user.name,
          taskTitle: task.title,
          taskDescription: task.description,
          priority: task.priority,
          dueDate: taskTz.dateFormatted,
          dueTime: taskTz.timeFormatted,
          taskId: task.id,
          type: 'OVERDUE',
        });

        if (sentSuccess) {
          db.updateTaskReminderFlags(task.id, { overdueNotificationSent: true });
          emailsSent++;
        }
        continue;
      }
    }

    console.log(`[RemindersService] Reminder check completed. Evaluated tasks, sent ${emailsSent} emails.`);
    return { processedCount, emailsSent };
  }
}

export const remindersService = new RemindersService();
