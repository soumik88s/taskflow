import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskPriority, TaskStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'No due date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dateStr?: string | null, status?: TaskStatus): boolean {
  if (!dateStr || status === 'COMPLETED') return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

export function getPriorityConfig(priority: TaskPriority) {
  switch (priority) {
    case 'HIGH':
      return {
        label: 'HIGH',
        bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
        dot: 'bg-rose-500',
      };
    case 'MEDIUM':
      return {
        label: 'MEDIUM',
        bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
        dot: 'bg-amber-500',
      };
    case 'LOW':
      return {
        label: 'LOW',
        bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50',
        dot: 'bg-slate-400',
      };
  }
}

export function getStatusConfig(status: TaskStatus) {
  switch (status) {
    case 'COMPLETED':
      return {
        label: 'Completed',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
      };
    case 'TODO':
      return {
        label: 'To Do',
        bg: 'bg-zinc-500/10 dark:bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/50',
        iconColor: 'text-zinc-500 dark:text-zinc-400',
      };
  }
}
