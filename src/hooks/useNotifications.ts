import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, DeadlineNotification } from '../types';

const READ_NOTIFS_KEY = 'taskflow_read_notifications';

function getDaysRemaining(dueDateStr: string): number {
  const date = new Date(dueDateStr);
  if (isNaN(date.getTime())) return 999;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function useNotifications(tasks: Task[]) {
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(READ_NOTIFS_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Save readIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(Array.from(readIds)));
    } catch (e) {
      console.error('Failed to save read notifications', e);
    }
  }, [readIds]);

  // Derive notifications from tasks
  const notifications: DeadlineNotification[] = useMemo(() => {
    const list: DeadlineNotification[] = [];

    tasks.forEach((task) => {
      if (task.status === 'COMPLETED' || !task.dueDate) return;

      const daysRemaining = getDaysRemaining(task.dueDate);

      // Only notify for overdue, due today, or due within 2 days
      if (daysRemaining > 2) return;

      let urgency: 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON';
      let message = '';

      if (daysRemaining < 0) {
        urgency = 'OVERDUE';
        const overdueDays = Math.abs(daysRemaining);
        message = overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`;
      } else if (daysRemaining === 0) {
        urgency = 'DUE_TODAY';
        message = 'Due today';
      } else if (daysRemaining === 1) {
        urgency = 'DUE_SOON';
        message = 'Due tomorrow';
      } else {
        urgency = 'DUE_SOON';
        message = `Due in ${daysRemaining} days`;
      }

      const notifId = `deadline-${task.id}-${task.dueDate}`;

      if (dismissedIds.has(notifId)) return;

      list.push({
        id: notifId,
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        urgency,
        daysRemaining,
        message,
        isRead: readIds.has(notifId),
      });
    });

    // Sort: OVERDUE -> DUE_TODAY -> DUE_SOON -> priority -> days
    return list.sort((a, b) => {
      const urgencyScore = { OVERDUE: 0, DUE_TODAY: 1, DUE_SOON: 2 };
      if (urgencyScore[a.urgency] !== urgencyScore[b.urgency]) {
        return urgencyScore[a.urgency] - urgencyScore[b.urgency];
      }
      return a.daysRemaining - b.daysRemaining;
    });
  }, [tasks, readIds, dismissedIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Request browser permission for system notifications
  const requestBrowserPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    requestBrowserPermission,
  };
}
