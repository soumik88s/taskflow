import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, SearchX, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  type?: 'no-tasks' | 'no-results';
  onAction?: () => void;
  actionLabel?: string;
  title?: string;
  description?: string;
}

export function EmptyState({
  type = 'no-tasks',
  onAction,
  actionLabel = 'Create Task',
  title,
  description,
}: EmptyStateProps) {
  const isNoResults = type === 'no-results';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 my-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
        {isNoResults ? <SearchX className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
      </div>

      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {title || (isNoResults ? 'No tasks found' : 'No tasks yet')}
      </h3>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {description ||
          (isNoResults
            ? 'Try adjusting your search terms or clearing priority and status filters.'
            : 'Create your first task to start organizing your daily workspace and getting things done.')}
      </p>

      {onAction && (
        <Button
          onClick={onAction}
          variant={isNoResults ? 'outline' : 'primary'}
          size="sm"
          leftIcon={!isNoResults && <Plus className="w-4 h-4" />}
          id="empty-state-action-btn"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
