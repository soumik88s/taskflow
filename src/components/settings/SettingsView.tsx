import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  User as UserIcon,
  Database,
  ShieldCheck,
  RefreshCw,
  BellRing,
  Mail,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { User, UserNotificationPreferences } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Theme } from '../../hooks/useTheme';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';

interface SettingsViewProps {
  user: User | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onReseedData: () => Promise<void>;
  onLogout: () => void;
  onOpenAuthModal?: () => void;
  isActionLoading?: boolean;
}

export function SettingsView({
  user,
  theme,
  setTheme,
  onReseedData,
  onLogout,
  onOpenAuthModal,
  isActionLoading = false,
}: SettingsViewProps) {
  const { showToast } = useToast();
  const [apiHealth, setApiHealth] = useState<string>('Checking...');
  const [isSavingPrefs, setIsSavingPrefs] = useState<boolean>(false);
  const [isTriggeringReminders, setIsTriggeringReminders] = useState<boolean>(false);

  const [prefs, setPrefs] = useState<UserNotificationPreferences>({
    emailNotifications: true,
    loginNotifications: true,
    taskReminders: true,
    dueTodayReminders: true,
    overdueReminders: true,
    timezone: 'Asia/Kolkata',
  });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setApiHealth('Connected & Healthy');
        else setApiHealth('Offline');
      })
      .catch(() => setApiHealth('Connection Error'));

    // Load user notification preferences
    api.getUserPreferences()
      .then((data) => {
        if (data) setPrefs(data);
      })
      .catch((e) => console.error('Failed to load notification preferences:', e));
  }, []);

  const handlePrefChange = async (key: keyof UserNotificationPreferences, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setIsSavingPrefs(true);

    try {
      await api.updateUserPreferences({ [key]: value });
      showToast('Notification preference saved', 'success');
    } catch (err: any) {
      showToast('Failed to save preference', 'error');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleTriggerReminders = async () => {
    setIsTriggeringReminders(true);
    try {
      const res = await api.triggerRemindersEvaluation();
      showToast(
        `Scheduler ran: evaluated tasks, sent ${res.emailsSent} reminder email(s)`,
        'success'
      );
    } catch (err: any) {
      showToast('Failed to trigger reminder scheduler', 'error');
    } finally {
      setIsTriggeringReminders(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Customize visual appearance, manage email notification schedules, inspect session security, and trigger system checks.
        </p>
      </div>

      {/* Email & Notification System Preferences Section */}
      <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Automated Email Reminders
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Backend-driven task reminder system running on NestJS/Express.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerReminders}
            isLoading={isTriggeringReminders}
            leftIcon={<Send className="w-3.5 h-3.5 text-indigo-500" />}
            id="trigger-reminder-check-btn"
          >
            Run Reminder Check Now
          </Button>
        </div>

        {/* Global Email Toggle */}
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Master Email Delivery
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Enable or disable all automated email dispatch from the backend scheduler.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={prefs.emailNotifications}
              onChange={(e) => handlePrefChange('emailNotifications', e.target.checked)}
              className="sr-only peer"
              id="pref-master-email-toggle"
            />
            <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-zinc-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Granular Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* 1-Day Before */}
          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                1-Day Before Due Date
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sends "Task due tomorrow" at 24 hours prior.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.taskReminders}
                onChange={(e) => handlePrefChange('taskReminders', e.target.checked)}
                className="sr-only peer"
                id="pref-1day-toggle"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-zinc-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Due Today */}
          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Due-Today Alert
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sends "Task due today" notification on deadline day.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.dueTodayReminders}
                onChange={(e) => handlePrefChange('dueTodayReminders', e.target.checked)}
                className="sr-only peer"
                id="pref-duetoday-toggle"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-zinc-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Overdue Notification */}
          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Overdue Task Alert
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Notifies when an uncompleted task passes its due date.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.overdueReminders}
                onChange={(e) => handlePrefChange('overdueReminders', e.target.checked)}
                className="sr-only peer"
                id="pref-overdue-toggle"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-zinc-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Login Notification */}
          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Login Security Alert
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sends security email when new session is authenticated.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.loginNotifications}
                onChange={(e) => handlePrefChange('loginNotifications', e.target.checked)}
                className="sr-only peer"
                id="pref-login-toggle"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-zinc-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Timezone Selector */}
        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Reminder Timezone
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Calculates calendar date boundaries for email dispatch.
              </p>
            </div>
          </div>

          <select
            value={prefs.timezone || 'Asia/Kolkata'}
            onChange={(e) => handlePrefChange('timezone', e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            id="pref-timezone-select"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30) [Default]</option>
            <option value="UTC">UTC (Coordinated Universal Time)</option>
            <option value="America/New_York">America/New_York (EST/EDT)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Appearance & Theme
          </h3>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Select your preferred visual theme for the TaskFlow workspace. Theme preferences are automatically saved in local storage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-600/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
            }`}
            id="theme-option-light"
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Theme</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-600/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
            }`}
            id="theme-option-dark"
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Dark Theme</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'system'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-600/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
            }`}
            id="theme-option-system"
          >
            <Laptop className="w-4 h-4 text-zinc-500" />
            <span>System Default</span>
          </button>
        </div>
      </div>

      {/* Account Session Section */}
      <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Account Session
          </h3>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">JWT Authenticated</Badge>
                {user.isGuest && <Badge variant="warning">Guest Mode</Badge>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="danger" size="sm" onClick={onLogout} id="settings-logout-btn">
                Sign Out & Clear Session Token
              </Button>
              {onOpenAuthModal && (
                <Button variant="outline" size="sm" onClick={onOpenAuthModal} id="settings-switch-auth-btn">
                  Switch Account / Register
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">Not currently authenticated.</p>
        )}
      </div>

      {/* System Status & Data Controls */}
      <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Backend API & Database Controls
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">API Health Status</span>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{apiHealth}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Reset Demo Tasks</span>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReseedData}
                isLoading={isActionLoading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                id="settings-reseed-btn"
              >
                Restore Default Sample Tasks
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
