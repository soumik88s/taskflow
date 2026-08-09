import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Plus, Sun, Moon, Bell } from 'lucide-react';
import { DeadlineNotification, User } from '../../types';
import { Button } from '../ui/Button';
import { NotificationPopover } from '../notifications/NotificationPopover';

interface NavbarProps {
  user: User | null;
  onOpenCreateModal: () => void;
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenMobileSidebar: () => void;

  // Notifications
  notifications?: DeadlineNotification[];
  unreadNotificationsCount?: number;
  isNotificationsOpen?: boolean;
  onToggleNotifications?: () => void;
  onCloseNotifications?: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismissNotification?: (id: string) => void;
  onSelectTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onRequestBrowserPermission?: () => Promise<boolean>;
}

export function Navbar({
  user,
  onOpenCreateModal,
  resolvedTheme,
  onToggleTheme,
  onOpenMobileSidebar,

  notifications = [],
  unreadNotificationsCount = 0,
  isNotificationsOpen = false,
  onToggleNotifications,
  onCloseNotifications,
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onDismissNotification = () => {},
  onSelectTask,
  onCompleteTask,
  onRequestBrowserPermission,
}: NavbarProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 transition-colors">
      {/* Mobile Menu & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Open mobile menu"
          id="mobile-menu-trigger"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
            <span>{getGreeting()}</span>
            <span className="hidden sm:inline">👋</span>
          </h2>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {todayStr} • Organize your focus & stay productive
          </p>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Animated Theme Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleTheme}
          className="relative p-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs overflow-hidden"
          title={`Switch theme (Current mode: ${resolvedTheme})`}
          aria-label="Toggle theme"
          id="theme-toggle-btn"
        >
          <AnimatePresence mode="wait" initial={false}>
            {resolvedTheme === 'dark' ? (
              <motion.div
                key="sun-icon"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Sun className="w-4 h-4 text-amber-400" />
              </motion.div>
            ) : (
              <motion.div
                key="moon-icon"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Moon className="w-4 h-4 text-zinc-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications Icon and Popover */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onToggleNotifications}
            className={`p-2 rounded-xl border transition-colors shadow-xs relative ${
              isNotificationsOpen
                ? 'bg-zinc-100 dark:bg-zinc-800 border-indigo-500/50 text-indigo-600 dark:text-indigo-400'
                : 'border-zinc-200/90 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            aria-label="Notifications"
            id="notifications-btn"
            title="Deadline Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
            {unreadNotificationsCount === 0 && notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </motion.button>

          {/* Popover */}
          {onCloseNotifications && (
            <NotificationPopover
              isOpen={isNotificationsOpen}
              onClose={onCloseNotifications}
              notifications={notifications}
              unreadCount={unreadNotificationsCount}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onDismiss={onDismissNotification}
              onSelectTask={onSelectTask}
              onCompleteTask={onCompleteTask}
              onRequestBrowserPermission={onRequestBrowserPermission}
            />
          )}
        </div>

        {/* + New Task Primary CTA */}
        <Button
          onClick={onOpenCreateModal}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          id="header-new-task-btn"
        >
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </header>
  );
}

