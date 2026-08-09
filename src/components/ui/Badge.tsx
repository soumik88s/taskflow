import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
    success: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    warning: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
    danger: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40',
    info: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/40',
    outline: 'border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-medium tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-sans uppercase whitespace-nowrap transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
