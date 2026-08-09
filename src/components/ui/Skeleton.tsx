import React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80', className)}
      {...props}
    />
  );
}

export function TaskSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-5 w-48 sm:w-64" />
            </div>
            <Skeleton className="w-6 h-6 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-3/4 ml-8" />
          <div className="flex items-center gap-3 ml-8 pt-1">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
