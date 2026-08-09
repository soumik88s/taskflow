import React from 'react';
import { LayoutDashboard, ListTodo, CheckCircle2, Settings } from 'lucide-react';
import { ViewTab } from '../../types';

interface MobileNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export function MobileNav({ currentTab, onSelectTab }: MobileNavProps) {
  const tabs: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
            }`}
            id={`mobile-tab-${tab.id}`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
