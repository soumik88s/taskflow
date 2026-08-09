import React from 'react';
import {
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  CheckCircle2,
  Settings,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { User, ViewTab } from '../../types';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  user: User | null;
  onLogout: () => void;
  onReseedData?: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  onReseedData,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const navItems: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: ListTodo },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: ViewTab) => {
    onSelectTab(tab);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      id="main-sidebar"
    >
      {/* Top Header */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 font-bold">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                TaskFlow
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                SaaS Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                }`}
                id={`sidebar-nav-${item.id}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Account Section */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
        {onReseedData && (
          <button
            onClick={onReseedData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-900/40"
            id="sidebar-reseed-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reset Demo Data</span>
          </button>
        )}

        {user && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-1">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user.name}
                </p>
                {user.isGuest && <Badge variant="info">Guest Session</Badge>}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
              id="sidebar-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
