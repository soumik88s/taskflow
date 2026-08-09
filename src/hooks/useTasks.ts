import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { FilterOptions, Task, TaskStats, TaskStatus } from '../types';
import { useToast } from '../components/ui/Toast';
import { useDebounce } from './useDebounce';

export function useTasks(isAuthenticated: boolean) {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    newThisWeek: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'ALL',
    priority: 'ALL',
    search: '',
    sort: 'newest',
  });

  const debouncedSearch = useDebounce(filters.search, 250);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Fetch tasks and statistics
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);

    try {
      const [fetchedTasks, fetchedStats] = await Promise.all([
        api.getTasks({
          ...filters,
          search: debouncedSearch,
        }),
        api.getStats(),
      ]);

      setTasks(fetchedTasks);
      setStats(fetchedStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load task data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters.status, filters.priority, filters.sort, debouncedSearch]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Create Task
  const createTask = async (data: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string | null;
    reminderEnabled?: boolean;
  }) => {
    setIsActionLoading(true);
    try {
      const newTask = await api.createTask(data);
      showToast('Task created successfully', 'success');
      setIsCreateModalOpen(false);
      await refreshData();
      return newTask;
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Update Task
  const updateTask = async (
    id: string,
    updates: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      reminderEnabled?: boolean;
    }
  ) => {
    setIsActionLoading(true);
    try {
      const updated = await api.updateTask(id, updates);
      showToast('Task updated successfully', 'success');
      setEditingTask(null);
      await refreshData();
      return updated;
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Quick Toggle Status
  const toggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    if (nextStatus === 'COMPLETED') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      showToast('✓ Task completed!', 'success');
    } else {
      showToast('Task marked as To Do', 'info');
    }

    try {
      await api.updateTask(task.id, { status: nextStatus });
      await refreshData();
    } catch (err: any) {
      showToast('Failed to update task status', 'error');
      await refreshData(); // rollback
    }
  };

  // Delete Task
  const deleteTask = async (id: string) => {
    setIsActionLoading(true);
    try {
      await api.deleteTask(id);
      showToast('Task deleted successfully', 'success');
      setDeletingTask(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reseed sample data
  const reseedData = async () => {
    setIsActionLoading(true);
    try {
      await api.seedTasks();
      showToast('Sample tasks reseeded successfully', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reseed tasks', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    tasks,
    stats,
    isLoading,
    isActionLoading,
    error,
    filters,
    setFilters,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingTask,
    setEditingTask,
    deletingTask,
    setDeletingTask,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    reseedData,
    refreshData,
  };
}
