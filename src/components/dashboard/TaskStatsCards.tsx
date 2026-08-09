import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, ListTodo, TrendingUp, Layers } from 'lucide-react';
import { TaskStats } from '../../types';

interface TaskStatsCardsProps {
  stats: TaskStats;
}

export function TaskStatsCards({ stats }: TaskStatsCardsProps) {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      change: `+${stats.newThisWeek} this week`,
      icon: Layers,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50',
    },
    {
      title: 'To Do',
      value: stats.todo,
      change: 'Pending action',
      icon: ListTodo,
      color: 'text-zinc-600 dark:text-zinc-400',
      bg: 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      change: 'Active focus',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50',
    },
    {
      title: 'Completed',
      value: stats.completed,
      change: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% done` : '0% done',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.06 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between"
            id={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {card.value}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{card.change}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
