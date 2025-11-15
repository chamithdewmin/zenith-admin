import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Sun, Bell, User, Mail, Shield } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const v = localStorage.getItem('notificationsEnabled');
    return v === null ? true : v === 'true';
  });
  const [fullName, setFullName] = useState('Admin User');
  const [email, setEmail] = useState('admin@example.com');

  useEffect(() => {
    const handler = () => setThemeMode(localStorage.getItem('themeMode') || 'light');
    window.addEventListener('themeModeChanged', handler);
    return () => window.removeEventListener('themeModeChanged', handler);
  }, []);

  const changeThemeMode = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
    window.dispatchEvent(new Event('themeModeChanged'));
  };

  const toggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('notificationsEnabled', String(next));
    toast({ title: next ? 'Notifications enabled' : 'Notifications disabled' });
  };

  const handleSaveProfile = () => {
    toast({ title: 'Profile saved', description: 'Your changes have been saved.' });
  };

  return (
    <>
      <Helmet>
        <title>Admin | Settings</title>
      </Helmet>

      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Appearance */}
          <section className="bg-card rounded-lg p-6 border border-secondary elev-shadow dark:shadow-none elev-shadow-hover dark:hover:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <Sun className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Appearance</h2>
                  <p className="text-sm text-muted-foreground">Theme Mode</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">&nbsp;</Label>
                <p className="text-sm text-muted-foreground">Choose Light or Dark theme for the app</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => changeThemeMode('light')}
                  className={`px-4 py-2 rounded-md border ${themeMode === 'light' ? 'bg-primary text-white' : 'bg-secondary'}`}
                >
                  Light
                </button>
                <button
                  onClick={() => changeThemeMode('dark')}
                  className={`px-4 py-2 rounded-md border ${themeMode === 'dark' ? 'bg-primary text-white' : 'bg-secondary'}`}
                >
                  Dark
                </button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-card rounded-lg p-6 border border-secondary elev-shadow dark:shadow-none elev-shadow-hover dark:hover:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Enable Email Notifications</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary rounded-full invisible">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">&nbsp;</p>
                  <p className="text-sm text-muted-foreground">Receive email updates for important events.</p>
                </div>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notificationsEnabled} onChange={toggleNotifications} className="sr-only" />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-primary transition ${notificationsEnabled ? 'bg-primary' : ''}`}></div>
                  <span className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transform transition ${notificationsEnabled ? 'translate-x-5' : ''}`}></span>
                </label>
              </div>
            </div>
          </section>

          {/* Profile Information */}
          <section className="bg-card rounded-lg p-6 border border-secondary elev-shadow dark:shadow-none elev-shadow-hover dark:hover:shadow-none">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="full-name">Full Name</Label>
                <div className="relative mt-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="password">Change Password</Label>
              <div className="relative mt-2">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                </div>
                <Input id="password" placeholder="Enter new password" className="pl-10" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} className="ml-auto">
                Save Changes
              </Button>
            </div>
          </section>
        </motion.div>
      </div>
    </>
  );
};

export default Settings;