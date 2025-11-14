import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, Search } from 'lucide-react';
import { getStorageData, setStorageData } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Inventory = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Load inbox from storage, or seed when missing
    let inbox = getStorageData('inbox', null);

    const sample = {
      id: 'M-0000',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Project Update',
      // Store date as YYYY-MM-DD to match requested display
      date: '2025-11-14',
      phone: '123-456-7890',
      message: 'Hi team, just checking in for a quick project update. Could you share the latest status and any blockers? Also, please confirm the delivery timeline for the next milestone. Thanks!'
    };

    if (!inbox) {
      const customers = getStorageData('customers', []);
      // Seed simple messages based on customers
      const seeded = customers.map((c, idx) => ({
        id: `M-${String(idx + 1).padStart(4, '0')}`,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        subject: 'General inquiry',
        date: new Date(Date.now() - idx * 86400000).toISOString(),
        message: 'Hello, I would like to learn more about your services. Please get back to me when convenient.'
      }));
      inbox = [sample, ...seeded];
      setStorageData('inbox', inbox);
    } else {
      const hasSample = inbox.some(
        (m) => m.email === sample.email && m.subject === sample.subject && m.name === sample.name
      );
      if (!hasSample) {
        inbox = [sample, ...inbox];
        setStorageData('inbox', inbox);
      }
    }

    setMessages(inbox);
  }, []);

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

  const handleDelete = (id) => {
    const next = messages.filter(m => m.id !== id);
    setMessages(next);
    setStorageData('inbox', next);
    toast({ title: 'Deleted', description: 'Message removed from inbox.' });
  };

  const handleRead = (id) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      setSelected(msg);
      setIsOpen(true);
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
        <title>Inbox - Admin Zenith</title>
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
            <Button onClick={exportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-secondary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, index) => (
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
                    <td className="px-4 py-3 text-sm">{m.phone}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRead(m.id)}>
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
          <DialogContent>
            {selected && (
              <div className="space-y-5">
                <DialogHeader className="pb-1">
                  <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                    {selected.subject || 'Message'}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <div className="space-y-1">
                    <div className="font-bold text-black">{selected.name}</div>
                    <div className="text-black font-medium">{selected.email}</div>
                  </div>
                  <div className="space-y-1 md:text-right">
                    <div className="text-black font-medium">{new Date(selected.date).toLocaleString()}</div>
                    <div className="text-black font-medium">{selected.phone || '-'}</div>
                  </div>
                </div>

                <div className="border-t border-secondary" />

                <div className="text-lg leading-8 font-medium whitespace-pre-wrap text-black">
                  {selected.message || 'Hello, I would like to learn more about your services and pricing. Could someone reach out to me with details?'}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Inventory;