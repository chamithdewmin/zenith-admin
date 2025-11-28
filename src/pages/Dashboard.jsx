import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, MailOpen, Users, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { inboxApi, usersApi } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import KpiCard from '@/components/KpiCard';
import Calendar from '@/components/ui/calendar';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [stats, setStats] = useState({
    totalEmails: 0,
    todayEmails: 0,
    newEmails: 0,
    activeUsers: 0,
  });

  const [emailResponseData, setEmailResponseData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch emails to calculate stats (get enough to calculate today's and recent stats)
        let emails = [];
        let totalEmails = 0;
        
        try {
          const emailsResponse = await inboxApi.list({ page: 1, limit: 1000 });
          emails = emailsResponse.data || [];
          totalEmails = emailsResponse.total || 0;
        } catch (emailError) {
          console.error('Error fetching emails:', emailError);
          // If email fetch fails, continue with empty data
          emails = [];
          totalEmails = 0;
        }

        // Calculate today's emails (date format from API is Y-m-d)
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        let todayEmails = 0;
        
        // If we have all emails (less than 1000), calculate from fetched data
        if (totalEmails <= 1000) {
          todayEmails = emails.filter(email => {
            const emailDateStr = email.date ? email.date.split(' ')[0] : '';
            return emailDateStr === todayStr;
          }).length;
        } else {
          // If more than 1000 emails, fetch today's emails separately
          const todayResponse = await inboxApi.list({ 
            page: 1, 
            limit: 1000,
            search: todayStr 
          });
          todayEmails = todayResponse.data ? todayResponse.data.length : 0;
        }

        // Calculate new/unread emails from fetched data
        const newEmails = emails.filter(email => !email.is_read || email.is_read === 0 || email.is_read === false).length;

        // Fetch users to get active count (only for admin users)
        let activeUsers = 0;
        if (isAdmin) {
          try {
            const usersResponse = await usersApi.list();
            const users = usersResponse.users || [];
            activeUsers = users
              .filter(user => user.username !== 'zenithlog')
              .filter(user => user.is_active === 1 || user.is_active === true).length;
          } catch (userError) {
            console.warn('Could not fetch users (admin only):', userError);
            // Non-admin users or if API fails, just show 0
            activeUsers = 0;
          }
        }

        setStats({
          totalEmails,
          todayEmails,
          newEmails,
          activeUsers,
        });

        // Generate email chart data for last 7 days
        const last7Days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
          
          const dayEmails = emails.filter(email => {
            const emailDateStr = email.date ? email.date.split(' ')[0] : '';
            return emailDateStr === dateStr;
          }).length;

          last7Days.push({
            name: dayNames[date.getDay()],
            responses: dayEmails,
          });
        }

        setEmailResponseData(last7Days);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error?.message || 'Failed to load some dashboard data. Please refresh the page.');
        // Don't reset stats if we already have some data
      } finally {
        setLoading(false);
      }
  }, [isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <>
      <Helmet>
        <title>Admin | Dashboard</title>
        <meta name="description" content="Admin dashboard with email analytics and user management" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your email and user overview.</p>
          </div>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">
            <p className="font-medium">Error loading dashboard</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading dashboard data...</div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Total Emails"
                value={stats.totalEmails}
                icon={Mail}
                trend={stats.todayEmails > 0 ? ((stats.todayEmails / stats.totalEmails) * 100).toFixed(1) : 0}
                trendUp={stats.todayEmails > 0}
              />
              <KpiCard
                title="Today's Emails"
                value={stats.todayEmails}
                icon={MailOpen}
                trend={stats.totalEmails > 0 ? ((stats.todayEmails / stats.totalEmails) * 100).toFixed(1) : 0}
                trendUp={stats.todayEmails > 0}
              />
              <KpiCard
                title="New Emails"
                value={stats.newEmails}
                icon={MailOpen}
                trend={stats.totalEmails > 0 ? ((stats.newEmails / stats.totalEmails) * 100).toFixed(1) : 0}
                trendUp={stats.newEmails > 0}
              />
              <KpiCard
                title="Active Users"
                value={stats.activeUsers}
                icon={Users}
                trend={0}
                trendUp={true}
              />
            </div>

            {/* Charts and Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Responses Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-card rounded-lg p-6 border border-secondary elev-shadow dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
              >
                <h2 className="text-xl font-bold mb-4">Email Responses (Last 7 Days)</h2>
                {emailResponseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={emailResponseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                      <XAxis dataKey="name" stroke="#bfc9d1" />
                      <YAxis stroke="#bfc9d1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111316',
                          border: '1px solid #1f2933',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Bar dataKey="responses" fill="#0066ff" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No email data available
                  </div>
                )}
              </motion.div>

              {/* Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Calendar 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </motion.div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;