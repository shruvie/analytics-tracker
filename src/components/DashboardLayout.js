"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Activity } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-blue-500" />
            Analytics
          </h1>
        </div>
        <nav className="px-4 py-2 space-y-1">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/dashboard' 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 size={18} />
            Dashboard
          </Link>
          <Link 
            href="/test-event" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/test-event' 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50'
            }`}
          >
            <Activity size={18} />
            Test Event
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
