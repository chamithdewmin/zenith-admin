import React, { useState, useEffect, useCallback } from 'react';
import { Search, Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { inboxApi } from '@/services/apiClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const displayName = user?.name || user?.full_name || user?.username || 'Admin';

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await inboxApi.list({ limit: 1000 });
      const emails = response.data || [];
      const unread = emails.filter(
        email => !email.is_read || email.is_read === 0 || email.is_read === false
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 glass-effect border-b border-secondary">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search email, appearance, notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Right section */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 hover:bg-primary/20 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Notifications</div>
                    {unreadCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {unreadCount > 5 ? `${unreadCount}+ new` : `${unreadCount} new`}
                      </div>
                    )}
                  </div>
                  {unreadCount > 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      You have received {unreadCount > 5 ? `${unreadCount}+` : unreadCount} {unreadCount === 1 ? 'email' : 'emails'}.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      No new emails.
                    </p>
                  )}
                  <div className="mt-3">
                    <DropdownMenuItem onClick={() => navigate('/inbox')}>
                      Open Inbox
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 p-2 hover:bg-primary/20 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">{displayName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
    </header>
  );
};

export default Topbar;