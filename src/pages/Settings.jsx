import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Sun, Bell, User, Mail, Shield, Bug, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/services/apiClient';

const Settings = () => {
  const { toast } = useToast();
  const { user, refreshSession } = useAuth();
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const v = localStorage.getItem('notificationsEnabled');
    return v === null ? true : v === 'true';
  });
  const [bugReport, setBugReport] = useState({
    title: '',
    description: '',
    images: []
  });
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  useEffect(() => {
    const handler = () => setThemeMode(localStorage.getItem('themeMode') || 'dark');
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2); // Limit to 2 images
    const imageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setBugReport(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles].slice(0, 2) // Keep only 2 images
    }));
  };

  const removeImage = (index) => {
    setBugReport(prev => {
      const newImages = [...prev.images];
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleBugReportSubmit = async (e) => {
    e.preventDefault();
    
    if (!bugReport.title.trim() || !bugReport.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both title and description fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmittingBug(true);
    
    try {
      const formData = new FormData();
      formData.append('title', bugReport.title);
      formData.append('description', bugReport.description);
      formData.append('user_name', user?.full_name || user?.username || 'Unknown');
      formData.append('user_email', user?.email || '');
      
      // Add images
      bugReport.images.forEach((imageObj, index) => {
        formData.append(`image_${index}`, imageObj.file);
      });

      // Get API base URL
      const getApiBaseUrl = () => {
        if (typeof window === 'undefined') return 'https://zenithscs.com.au/api';
        const origin = window.location.origin;
        if (origin.includes('zenithscs.com.au')) {
          return `${origin.replace(/\/$/, '')}/api`;
        }
        return 'https://zenithscs.com.au/api';
      };

      const response = await fetch(`${getApiBaseUrl()}/report-bug.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Bug Report Submitted',
          description: 'Thank you for reporting the bug. We will look into it soon.'
        });
        // Reset form
        setBugReport({ title: '', description: '', images: [] });
        // Clean up preview URLs
        bugReport.images.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
      } else {
        throw new Error(data.message || 'Failed to submit bug report');
      }
    } catch (error) {
      console.error('Bug report error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit bug report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingBug(false);
    }
  };


  return (
    <>
      <Helmet>
        <title>Admin | Settings</title>
      </Helmet>

      <div className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="full-name">Full Name</Label>
                <div className="relative mt-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <Input 
                    id="full-name" 
                    value={user?.full_name || user?.name || '—'} 
                    className="pl-10" 
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input 
                    id="email" 
                    type="email"
                    value={user?.email || '—'} 
                    className="pl-10"
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <div className="relative mt-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                  </div>
                  <Input 
                    id="role" 
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'} 
                    className="pl-10 capitalize"
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Report a Bug */}
          <section className="bg-card rounded-lg p-6 border border-secondary elev-shadow dark:shadow-none elev-shadow-hover dark:hover:shadow-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary rounded-lg">
                <Bug className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Report a Bug</h2>
                <p className="text-sm text-muted-foreground">Help us improve by reporting issues</p>
              </div>
            </div>

            <form onSubmit={handleBugReportSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bug-title">Bug Title</Label>
                <Input
                  id="bug-title"
                  type="text"
                  value={bugReport.title}
                  onChange={(e) => setBugReport(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the bug"
                  required
                  disabled={isSubmittingBug}
                  className="bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <Label htmlFor="bug-description">Description</Label>
                <textarea
                  id="bug-description"
                  value={bugReport.description}
                  onChange={(e) => setBugReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the bug in detail. Include steps to reproduce if possible."
                  required
                  disabled={isSubmittingBug}
                  rows={5}
                  className="flex w-full rounded-md border border-secondary bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              <div>
                <Label htmlFor="bug-images">Screenshots (Max 2 images)</Label>
                <div className="mt-2">
                  <input
                    id="bug-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isSubmittingBug || bugReport.images.length >= 2}
                    className="hidden"
                  />
                  <label
                    htmlFor="bug-images"
                    className={`flex items-center justify-center gap-2 px-4 py-2 border border-secondary rounded-md cursor-pointer hover:bg-secondary transition-colors ${
                      (isSubmittingBug || bugReport.images.length >= 2) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">
                      {bugReport.images.length >= 2 ? 'Maximum 2 images' : 'Upload Images'}
                    </span>
                  </label>
                </div>

                {bugReport.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {bugReport.images.map((imageObj, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageObj.preview}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border border-secondary"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isSubmittingBug}
                          className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmittingBug || !bugReport.title.trim() || !bugReport.description.trim()}
                className="w-full"
              >
                {isSubmittingBug ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Bug Report'
                )}
              </Button>
            </form>
          </section>
        </motion.div>
      </div>
    </>
  );
};

export default Settings;