import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { FilterOptions, TaskPriority, TaskStatus } from '../../types';

interface TaskFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  totalCount: number;
}

export function TaskFilters({ filters, setFilters, totalCount }: TaskFiltersProps) {
  const statusTabs: { id: 'ALL' | TaskStatus; label: string }[] = [
    { id: 'ALL', label: 'All Tasks' },
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  const priorityOptions: { id: 'ALL' | TaskPriority; label: string }[] = [
    { id: 'ALL', label: 'All Priorities' },
    { id: 'HIGH', label: 'High Priority' },
    { id: 'MEDIUM', label: 'Medium Priority' },
    { id: 'LOW', label: 'Low Priority' },
  ];

  const sortOptions: { id: FilterOptions['sort']; label: string }[] = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'priority', label: 'Priority' },
  ];

  const hasActiveFilters =
    filters.status !== 'ALL' || filters.priority !== 'ALL' || filters.search.trim().length > 0;

  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      priority: 'ALL',
      search: '',
      sort: 'newest',
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Secondary Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search tasks by title or description..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            id="task-search-input"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter and Sort Dropdowns */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
          {/* Priority Select */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, priority: e.target.value as any }))
                }
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1"
                id="filter-priority-select"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="dark:bg-zinc-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Select */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sort: e.target.value as any }))
                }
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1"
                id="filter-sort-select"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="dark:bg-zinc-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline shrink-0 px-2 py-1"
              id="clear-filters-btn"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Primary Status Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pt-1">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilters((prev) => ({ ...prev, status: tab.id }))}
                className={`relative px-3.5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors rounded-t-lg ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                id={`status-tab-${tab.id.toLowerCase()}`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeStatusTabBorder"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 hidden sm:inline-block">
          Showing {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
        </span>
      </div>
    </div>
  );
}

