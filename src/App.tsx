import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useTasks } from './hooks/useTasks';
import { useNotifications } from './hooks/useNotifications';
import { ViewTab } from './types';
import { ToastProvider, useToast } from './components/ui/Toast';
import { LandingPage } from './components/layout/LandingPage';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { TaskStatsCards } from './components/dashboard/TaskStatsCards';
import { UpcomingTasksTimeline } from './components/dashboard/UpcomingTasksTimeline';
import { TaskFilters } from './components/tasks/TaskFilters';
import { TaskCard } from './components/tasks/TaskCard';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { EmptyState } from './components/ui/EmptyState';
import { TaskSkeletonList, StatsSkeleton } from './components/ui/Skeleton';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { Plus, ListTodo, CheckCircle2 } from 'lucide-react';
import { Button } from './components/ui/Button';

function MainAppContent() {
  const { user, isLoading: isAuthLoading, login, register, loginAsGuest, logout } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    tasks,
    stats,
    isLoading: isTasksLoading,
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
  } = useTasks(!!user);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    requestBrowserPermission,
  } = useNotifications(tasks);

  // Initial toast notification for approaching/overdue deadlines
  const [hasNotifiedInitial, setHasNotifiedInitial] = useState(false);

  useEffect(() => {
    if (!isTasksLoading && tasks.length > 0 && !hasNotifiedInitial) {
      const overdue = notifications.filter((n) => n.urgency === 'OVERDUE').length;
      const dueToday = notifications.filter((n) => n.urgency === 'DUE_TODAY').length;

      if (overdue > 0 || dueToday > 0) {
        showToast(
          `Deadline Alert: ${overdue > 0 ? `${overdue} overdue task${overdue > 1 ? 's' : ''}` : ''}${
            overdue > 0 && dueToday > 0 ? ', ' : ''
          }${dueToday > 0 ? `${dueToday} task${dueToday > 1 ? 's' : ''} due today` : ''}!`,
          'warning',
          'Upcoming Deadlines'
        );
      }
      setHasNotifiedInitial(true);
    }
  }, [isTasksLoading, tasks, notifications, hasNotifiedInitial, showToast]);

  // If user is not authenticated yet, render Landing Page
  if (!user && !isAuthLoading) {
    return (
      <LandingPage
        onLogin={login}
        onRegister={register}
        onContinueAsGuest={async () => {
          await loginAsGuest();
        }}
        isLoading={isAuthLoading}
      />
    );
  }

  // Auth loading fallback
  if (isAuthLoading && !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Initializing TaskFlow workspace...
          </p>
        </div>
      </div>
    );
  }

  const handleTabSelect = (tab: ViewTab) => {
    setCurrentTab(tab);
    if (tab === 'completed') {
      setFilters((prev) => ({ ...prev, status: 'COMPLETED' }));
    } else if (tab === 'tasks') {
      setFilters((prev) => ({ ...prev, status: 'ALL' }));
    }
  };

  const handleSelectTaskFromNotif = (taskId: string) => {
    setCurrentTab('tasks');
    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask) {
      setEditingTask(targetTask);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col lg:flex-row selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabSelect}
        user={user}
        onLogout={logout}
        onReseedData={reseedData}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-zinc-950/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Navbar
          user={user}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          theme={theme}
          resolvedTheme={resolvedTheme}
          onToggleTheme={toggleTheme}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          notifications={notifications}
          unreadNotificationsCount={unreadCount}
          isNotificationsOpen={isNotificationsOpen}
          onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
          onCloseNotifications={() => setIsNotificationsOpen(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDismissNotification={dismissNotification}
          onSelectTask={handleSelectTaskFromNotif}
          onCompleteTask={async (taskId) => {
            const taskToComplete = tasks.find((t) => t.id === taskId);
            if (taskToComplete) {
              await toggleTaskStatus(taskToComplete);
            }
          }}
          onRequestBrowserPermission={requestBrowserPermission}
        />

        {/* View Contents */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {/* DASHBOARD TAB */}
            {currentTab === 'dashboard' && (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Statistics Row */}
                {isTasksLoading ? <StatsSkeleton /> : <TaskStatsCards stats={stats} />}

                {/* Upcoming Tasks & Email Schedule Timeline */}
                {!isTasksLoading && (
                  <UpcomingTasksTimeline
                    tasks={tasks}
                    onSelectTask={(t) => {
                      setCurrentTab('tasks');
                      setEditingTask(t);
                    }}
                    onToggleStatus={toggleTaskStatus}
                  />
                )}

                {/* Toolbar & Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Task Workspace
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Filter, organize, and update task statuses in real time.
                    </p>
                  </div>

                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    id="dashboard-new-task-btn"
                  >
                    Create Task
                  </Button>
                </div>

                <TaskFilters
                  filters={filters}
                  setFilters={setFilters}
                  totalCount={tasks.length}
                />

                {/* Task Cards Grid */}
                {isTasksLoading ? (
                  <TaskSkeletonList count={4} />
                ) : tasks.length === 0 ? (
                  <EmptyState
                    type={filters.search || filters.priority !== 'ALL' || filters.status !== 'ALL' ? 'no-results' : 'no-tasks'}
                    onAction={() => setIsCreateModalOpen(true)}
                    actionLabel="Create First Task"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={toggleTaskStatus}
                          onEdit={(t) => setEditingTask(t)}
                          onDelete={(t) => setDeletingTask(t)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* MY TASKS TAB */}
            {currentTab === 'tasks' && (
              <motion.div
                key="tasks-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      All Tasks
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      View and manage your complete list of tasks across all priorities.
                    </p>
                  </div>

                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    id="tasks-page-new-btn"
                  >
                    Add Task
                  </Button>
                </div>

                <TaskFilters
                  filters={filters}
                  setFilters={setFilters}
                  totalCount={tasks.length}
                />

                {isTasksLoading ? (
                  <TaskSkeletonList count={5} />
                ) : tasks.length === 0 ? (
                  <EmptyState
                    type="no-tasks"
                    onAction={() => setIsCreateModalOpen(true)}
                  />
                ) : (
                  <div className="space-y-3.5">
                    <AnimatePresence>
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={toggleTaskStatus}
                          onEdit={(t) => setEditingTask(t)}
                          onDelete={(t) => setDeletingTask(t)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* COMPLETED TAB */}
            {currentTab === 'completed' && (
              <motion.div
                key="completed-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Completed Tasks Archive
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Review all your completed tasks and achievements.
                  </p>
                </div>

                <TaskFilters
                  filters={filters}
                  setFilters={setFilters}
                  totalCount={tasks.length}
                />

                {isTasksLoading ? (
                  <TaskSkeletonList count={3} />
                ) : tasks.length === 0 ? (
                  <EmptyState
                    type="no-results"
                    title="No completed tasks yet"
                    description="When you mark tasks as complete, they will appear in this archive."
                  />
                ) : (
                  <div className="space-y-3.5">
                    <AnimatePresence>
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={toggleTaskStatus}
                          onEdit={(t) => setEditingTask(t)}
                          onDelete={(t) => setDeletingTask(t)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {currentTab === 'settings' && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SettingsView
                  user={user}
                  theme={theme}
                  setTheme={setTheme}
                  onReseedData={reseedData}
                  onLogout={logout}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  isActionLoading={isActionLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentTab={currentTab} onSelectTab={handleTabSelect} />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onRegister={register}
        onContinueAsGuest={async () => {
          await loginAsGuest();
        }}
        isLoading={isAuthLoading}
      />

      {/* Task Creation Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createTask(data);
        }}
        isLoading={isActionLoading}
      />

      {/* Task Edit Modal */}
      <TaskFormModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        taskToEdit={editingTask}
        onSubmit={async (data) => {
          if (editingTask) {
            await updateTask(editingTask.id, data);
          }
        }}
        isLoading={isActionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={async () => {
          if (deletingTask) {
            await deleteTask(deletingTask.id);
          }
        }}
        title="Delete Task?"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        isLoading={isActionLoading}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
