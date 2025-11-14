import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, MailOpen, Upload, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStorageData } from '@/utils/storage';
import KpiCard from '@/components/KpiCard';
import Calendar from '@/components/ui/calendar';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmails: 0,
    todayEmails: 0,
    newEmails: 0,
    blogContacts: 0,
  });

  const [emailResponseData, setEmailResponseData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Mock email statistics
    setStats({
      totalEmails: 1248,
      todayEmails: 47,
      newEmails: 23,
      blogContacts: 156,
    });

    // Generate mock email response data
    const mockEmailData = [
      { name: 'Mon', responses: 45 },
      { name: 'Tue', responses: 52 },
      { name: 'Wed', responses: 38 },
      { name: 'Thu', responses: 67 },
      { name: 'Fri', responses: 59 },
      { name: 'Sat', responses: 41 },
      { name: 'Sun', responses: 33 },
    ];
    setEmailResponseData(mockEmailData);
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - Admin Zenith</title>
        <meta name="description" content="Admin dashboard with email analytics and blog insights" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your email and blog overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Emails"
            value={stats.totalEmails}
            icon={Mail}
            trend={12.5}
            trendUp={true}
          />
          <KpiCard
            title="Today's Emails"
            value={stats.todayEmails}
            icon={MailOpen}
            trend={8.2}
            trendUp={true}
          />
          <KpiCard
            title="New Emails"
            value={stats.newEmails}
            icon={MailOpen}
            trend={15.3}
            trendUp={true}
          />
          <KpiCard
            title="Blog Contacts"
            value={stats.blogContacts}
            icon={FileText}
            trend={5.7}
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
            <h2 className="text-xl font-bold mb-4">Email Responses</h2>
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
      </div>
    </>
  );
};

export default Dashboard;