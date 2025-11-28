import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, Search, RefreshCw, Loader2, User, Mail, Calendar, Phone, MessageSquare, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { inboxApi } from '@/services/apiClient';

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizeMessages = (items = []) =>
    items.map((item) => ({
      id: item.id,
      name: item.sender || item.name || 'Unknown',
      email: item.email,
      subject: item.subject,
      date: item.date,
      phone: item.phone,
      message: item.message,
      is_read: Boolean(item.is_read),
    }));

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await inboxApi.list({ limit: 200 });
      setMessages(normalizeMessages(response.data));
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Unable to load inbox. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filtered = useMemo(() => {
    if (!search) return messages;
    const q = search.toLowerCase();
    return messages.filter(m =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.subject || '').toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q)
    );
  }, [messages, search]);

  const handleDelete = async (id) => {
    try {
      await inboxApi.remove(id);
      const next = messages.filter((m) => m.id !== id);
      setMessages(next);
      toast({ title: 'Deleted', description: 'Message removed from inbox.' });
    } catch (err) {
      toast({
        title: 'Unable to delete message',
        description: err?.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleRead = async (msg) => {
    setSelected(msg);
    setIsOpen(true);

    if (!msg?.is_read) {
      try {
        await inboxApi.markRead(msg.id);
        setMessages((prev) =>
          prev.map((item) =>
            item.id === msg.id ? { ...item, is_read: true } : item
          )
        );
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Subject', 'Date', 'Phone'];
    const rows = messages.map(m => [
      m.id,
      m.name,
      m.email,
      m.subject,
      m.date,
      m.phone
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inbox.csv';
    a.click();

    toast({
      title: "Export successful",
      description: "Inbox exported to CSV",
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin | Inbox</title>
        <meta name="description" content="Manage your contact inbox" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contact Inbox</h1>
            <p className="text-muted-foreground">Review and manage contact messages</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name & date..."
                className="w-64 pl-9 pr-3 py-2 bg-secondary border border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={fetchMessages} variant="outline" className="gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
            <Button onClick={exportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-secondary overflow-hidden">
          {error && (
            <div className="p-4 text-sm text-destructive border-b border-secondary">
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading inbox...
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      No messages found.
                    </td>
                  </tr>
                )}
                {!loading && filtered.map((m, index) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-secondary hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-sm">{m.email}</td>
                    <td className="px-4 py-3 text-sm">{m.subject}</td>
                    <td className="px-4 py-3 text-sm">{new Date(m.date).toLocaleDateString('en-CA')}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${m.is_read ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>
                        {m.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{m.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRead(m)}>
                          Read
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Read dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-3xl">
            {selected && (
              <div className="space-y-6">
                {/* Header with Subject and Message ID */}
                <div className="relative">
                  <DialogHeader className="pr-8">
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      {selected.subject || 'Message'}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Message ID: M-{String(selected.id).padStart(4, '0')}
                    </p>
                  </DialogHeader>
                </div>

                {/* Sender and Contact Information - Two Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* From */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="text-base font-medium text-foreground">{selected.name || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-base font-medium text-foreground">{selected.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date & Time</p>
                        <p className="text-base font-medium text-foreground">
                          {new Date(selected.date).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-base font-medium text-foreground">{selected.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">MESSAGE</h3>
                  </div>
                  <div className="pl-12">
                    <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                      {selected.message || 'No message content available.'}
                    </p>
                  </div>
                </div>

                {/* Reply Button */}
                <div className="flex justify-center pt-4 border-t border-secondary">
                  <Button 
                    variant="outline" 
                    className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => {
                      window.location.href = `mailto:${selected.email}?subject=Re: ${selected.subject || 'Message'}`;
                    }}
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Inbox;
