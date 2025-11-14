import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { cn } from '@/lib/utils';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  useEffect(() => {
    const handler = () => setThemeMode(localStorage.getItem('themeMode') || 'light');
    window.addEventListener('themeModeChanged', handler);
    window.addEventListener('storage', handler);
    // initialize class on mount
    document.documentElement.classList.toggle('dark', (localStorage.getItem('themeMode') || 'light') === 'dark');
    return () => {
      window.removeEventListener('themeModeChanged', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className={cn(
          "p-4 lg:p-6 bg-background text-foreground"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;