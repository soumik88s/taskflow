import React from 'react';
import { motion } from 'motion/react';
import { Task } from '../../types';
import { Calendar, AlertCircle, Clock, Bell, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface UpcomingTasksTimelineProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
}

export function UpcomingTasksTimeline({
  tasks,
  onSelectTask,
  onToggleStatus,
}: UpcomingTasksTimelineProps) {
  const now = new Date();

  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate);

  // Grouping
  const overdue: Task[] = [];
  const dueToday: Task[] = [];
  const dueTomorrow: Task[] = [];
  const upcomingLater: Task[] = [];

  activeTasks.forEach((t) => {
    if (!t.dueDate) return;
    const taskDate = new Date(t.dueDate);

    // Date comparison in UTC / local
    const nowDateStr = now.toISOString().split('T')[0];
    const taskDateStr = taskDate.toISOString().split('T')[0];

    const diffDays = Math.round(
      (new Date(taskDateStr).getTime() - new Date(nowDateStr).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      overdue.push(t);
    } else if (diffDays === 0) {
      dueToday.push(t);
    } else if (diffDays === 1) {
      dueTomorrow.push(t);
    } else {
      upcomingLater.push(t);
    }
  });

  if (activeTasks.length === 0) {
    return null;
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Upcoming Deadlines & Email Schedule
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tasks monitored by backend automated email reminder scheduler.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {/* Overdue Section */}
        {overdue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Overdue ({overdue.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {overdue.map((task) => (
                <TimelineTaskItem
                  key={task.id}
                  task={task}
                  urgencyClass="border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20"
                  badgeText="Overdue Alert"
                  badgeSent={task.overdueNotificationSent}
                  onSelect={() => onSelectTask(task)}
                  onToggle={() => onToggleStatus(task)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Due Today Section */}
        {dueToday.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Due Today ({dueToday.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dueToday.map((task) => (
                <TimelineTaskItem
                  key={task.id}
                  task={task}
                  urgencyClass="border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20"
                  badgeText="Due-Today Email"
                  badgeSent={task.reminderDueTodaySent}
                  onSelect={() => onSelectTask(task)}
                  onToggle={() => onToggleStatus(task)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Due Tomorrow Section */}
        {dueTomorrow.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due Tomorrow ({dueTomorrow.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dueTomorrow.map((task) => (
                <TimelineTaskItem
                  key={task.id}
                  task={task}
                  urgencyClass="border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/20"
                  badgeText="1-Day Email"
                  badgeSent={task.reminderOneDaySent}
                  onSelect={() => onSelectTask(task)}
                  onToggle={() => onToggleStatus(task)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Later */}
        {upcomingLater.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming Later ({upcomingLater.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {upcomingLater.map((task) => (
                <TimelineTaskItem
                  key={task.id}
                  task={task}
                  urgencyClass="border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/30"
                  badgeText="Scheduled"
                  badgeSent={false}
                  onSelect={() => onSelectTask(task)}
                  onToggle={() => onToggleStatus(task)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineTaskItem({
  task,
  urgencyClass,
  badgeText,
  badgeSent,
  onSelect,
  onToggle,
}: {
  key?: React.Key;
  task: Task;
  urgencyClass: string;
  badgeText: string;
  badgeSent?: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${urgencyClass} transition-all`}
    >
      <div className="min-w-0 flex-1 cursor-pointer" onClick={onSelect}>
        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
          {task.title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
          <span>📅 {formatDate(task.dueDate!)}</span>
          {task.reminderEnabled !== false && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
              <Bell className="w-2.5 h-2.5" />
              {badgeSent ? 'Sent ✓' : badgeText}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shrink-0"
        title="Mark complete"
      >
        <CheckCircle2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
