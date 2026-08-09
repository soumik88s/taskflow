import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Task } from '../../types';
import { formatDate, getPriorityConfig, getStatusConfig, isOverdue } from '../../lib/utils';

export interface TaskCardProps {
  key?: React.Key;
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, onToggleStatus, onEdit, onDelete }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDone = task.status === 'COMPLETED';
  const overdue = isOverdue(task.dueDate, task.status);

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ duration: 0.22, type: 'spring', stiffness: 350, damping: 25 }}
      className={`group relative p-4 sm:p-5 rounded-2xl border transition-colors duration-200 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md ${
        isDone
          ? 'border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 opacity-80'
          : 'border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
      id={`task-card-${task.id}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        {/* Checkbox and Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={() => onToggleStatus(task)}
            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
              isDone
                ? 'bg-emerald-500 border-emerald-500 text-white dark:bg-emerald-500 dark:border-emerald-500'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 bg-zinc-50 dark:bg-zinc-800/80'
            }`}
            aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
            id={`task-check-${task.id}`}
          >
            <AnimatePresence mode="wait">
              {isDone && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15, type: 'spring', stiffness: 400 }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="flex-1 min-w-0">
            <h4
              className={`text-sm sm:text-base font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-100 transition-all ${
                isDone ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal' : ''
              }`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p
                className={`text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed ${
                  isDone ? 'text-zinc-400/80 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Task menu"
            id={`task-menu-btn-${task.id}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-8 z-30 w-40 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl shadow-xl text-xs font-medium"
                  id={`task-dropdown-${task.id}`}
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(task);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                    id={`task-edit-btn-${task.id}`}
                  >
                    <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Edit task</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleStatus(task);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                    id={`task-toggle-btn-${task.id}`}
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{isDone ? 'Mark To Do' : 'Mark Complete'}</span>
                  </button>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete(task);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                    id={`task-delete-btn-${task.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete task</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Badges & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold tracking-wide ${priorityConfig.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
            {priorityConfig.label}
          </span>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-medium tracking-wide ${statusConfig.bg}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              overdue
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {overdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

