import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  X,
  Mail,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inbox', icon: Mail, label: 'Inbox' },
    ...(isAdmin ? [{ to: '/users', icon: Users, label: 'User Management' }] : []),
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-[#111316] border-r border-[#1f2933] transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-secondary">
            <div className="flex flex-col">
              <div
                className="text-white font-extrabold text-3xl md:text-4xl leading-none"
                style={{ letterSpacing: '0.28em' }}
              >
                ZENITH
              </div>
              <div
                className="text-xs uppercase text-[#9AA3A9] mt-1"
                style={{ letterSpacing: '0.12em' }}
              >
                SUPPLY CHAIN SOLUTIONS
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-primary/20 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-[#1f2933] hover:translate-x-1",
                    isActive
                      ? "bg-primary text-white elev-shadow"
                      : "text-[#bfc9d1]"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          {/* Powered by footer */}
          <div className="p-4 border-t border-secondary">
            <div className="text-center">
              <div className="text-xs text-[#9AA3A9] mb-2">Powered by</div>
              <a href="https://logozodev.com" target="_blank" rel="noopener noreferrer" className="inline-block">
                <img src="https://logozodev.com/assets/img/logo/logo.svg" alt="Logozodev" className="mx-auto w-28 h-auto" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;