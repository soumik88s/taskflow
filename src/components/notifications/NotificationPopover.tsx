import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  Check,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { DeadlineNotification, Task } from '../../types';
import { getPriorityConfig } from '../../lib/utils';
import { Button } from '../ui/Button';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DeadlineNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onSelectTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onRequestBrowserPermission?: () => Promise<boolean>;
}

export function NotificationPopover({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onSelectTask,
  onCompleteTask,
  onRequestBrowserPermission,
}: NotificationPopoverProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON'>('ALL');
  const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    return n.urgency === activeFilter;
  });

  const overdueCount = notifications.filter((n) => n.urgency === 'OVERDUE').length;
  const dueTodayCount = notifications.filter((n) => n.urgency === 'DUE_TODAY').length;
  const dueSoonCount = notifications.filter((n) => n.urgency === 'DUE_SOON').length;

  const handleEnableBrowserNotifs = async () => {
    if (onRequestBrowserPermission) {
      const granted = await onRequestBrowserPermission();
      setBrowserAlertsEnabled(granted);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-2xs"
            onClick={onClose}
          />

          {/* Popover Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[540px]"
            id="notifications-popover"
          >
            {/* Popover Header */}
            <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    Deadline Alerts
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                        {unreadCount} new
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Tasks requiring immediate attention
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium transition-colors"
                  id="mark-all-read-btn"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center gap-1 overflow-x-auto no-scrollbar bg-white dark:bg-zinc-900">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === 'ALL'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                All ({notifications.length})
              </button>

              {overdueCount > 0 && (
                <button
                  onClick={() => setActiveFilter('OVERDUE')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                    activeFilter === 'OVERDUE'
                      ? 'bg-rose-500 text-white'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Overdue ({overdueCount})
                </button>
              )}

              {dueTodayCount > 0 && (
                <button
                  onClick={() => setActiveFilter('DUE_TODAY')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                    activeFilter === 'DUE_TODAY'
                      ? 'bg-amber-500 text-white'
                      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Due Today ({dueTodayCount})
                </button>
              )}

              {dueSoonCount > 0 && (
                <button
                  onClick={() => setActiveFilter('DUE_SOON')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                    activeFilter === 'DUE_SOON'
                      ? 'bg-indigo-600 text-white'
                      : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  Upcoming ({dueSoonCount})
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800/40">
              {filteredNotifs.length === 0 ? (
                <div className="py-8 text-center px-4 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    No active deadline alerts
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[220px]">
                    All your task deadlines are in order or marked as complete.
                  </p>
                </div>
              ) : (
                filteredNotifs.map((notif) => {
                  const priorityCfg = getPriorityConfig(notif.priority);

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => onMarkAsRead(notif.id)}
                      className={`pt-2.5 first:pt-0 pb-1.5 flex items-start gap-3 group rounded-xl p-2 transition-colors ${
                        !notif.isRead
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* Urgency Icon */}
                      <div className="mt-0.5 shrink-0">
                        {notif.urgency === 'OVERDUE' && (
                          <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                        {notif.urgency === 'DUE_TODAY' && (
                          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                        {notif.urgency === 'DUE_SOON' && (
                          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className={`inline-block px-1.5 py-0.25 text-[10px] font-bold rounded ${
                              notif.urgency === 'OVERDUE'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : notif.urgency === 'DUE_TODAY'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {notif.message}
                          </span>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.25 rounded border ${priorityCfg.bg}`}
                          >
                            {notif.priority}
                          </span>
                        </div>

                        <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {notif.title}
                        </h5>

                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Due: {new Date(notif.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          {onCompleteTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCompleteTask(notif.taskId);
                                onDismiss(notif.id);
                              }}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              Mark Complete
                            </button>
                          )}

                          {onSelectTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTask(notif.taskId);
                                onClose();
                              }}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dismiss button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(notif.id);
                        }}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg opacity-0 group-hover:opacity-100"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Popover Footer */}
            <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                Browser alerts: {browserAlertsEnabled ? 'Enabled' : 'Disabled'}
              </span>

              {!browserAlertsEnabled && onRequestBrowserPermission && (
                <button
                  onClick={handleEnableBrowserNotifs}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px]"
                >
                  Enable
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
