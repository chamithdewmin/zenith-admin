import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Loader2, Shield, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { usersApi } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const emptyForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'admin',
};

const UserManagement = () => {
  const { toast } = useToast();
  const { user: activeUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ id: null, password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  // Check if user is admin
  const isAdmin = activeUser?.role === 'admin';

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await usersApi.list();
      setUsers(response.users || []);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    // Filter out the admin user (zenithlog) from display
    const visibleUsers = users.filter(
      (user) => user.username !== 'zenithlog'
    );
    
    if (!search) return visibleUsers;
    const query = search.toLowerCase();
    return visibleUsers.filter(
      (item) =>
        item.username?.toLowerCase().includes(query) ||
        item.full_name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.role?.toLowerCase().includes(query)
    );
  }, [users, search]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await usersApi.create({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      toast({
        title: 'User created',
        description: `${form.name} can now access the admin panel.`,
      });
      setCreateOpen(false);
      setForm(emptyForm);
      loadUsers();
    } catch (err) {
      toast({
        title: 'Failed to create user',
        description: err?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm) return;
    setIsSubmitting(true);
    try {
      await usersApi.update({
        id: editForm.id,
        name: editForm.full_name,
        email: editForm.email,
        role: editForm.role,
      });
      toast({
        title: 'User updated',
        description: `${editForm.full_name} saved successfully.`,
      });
      setEditOpen(false);
      setEditForm(null);
      loadUsers();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err?.message || 'Unable to save changes.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.id) return;
    setIsSubmitting(true);
    try {
      await usersApi.changePassword({
        id: passwordForm.id,
        newPassword: passwordForm.password,
      });
      toast({
        title: 'Password updated',
        description: 'Share the new password securely with the user.',
      });
      setPasswordOpen(false);
      setPasswordForm({ id: null, password: '' });
    } catch (err) {
      toast({
        title: 'Password update failed',
        description: err?.message || 'Unable to update password.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id) => {
    setBusyUserId(id);
    try {
      const response = await usersApi.toggleStatus(id);
      toast({
        title: response.is_active ? 'User activated' : 'User blocked',
        description: response.message,
      });
      loadUsers();
    } catch (err) {
      toast({
        title: 'Unable to change status',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (id) => {
    setBusyUserId(id);
    try {
      await usersApi.delete(id);
      toast({
        title: 'User deleted',
        description: 'The user has been removed permanently.',
      });
      loadUsers();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err?.message || 'Unable to delete user.',
        variant: 'destructive',
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const openEditDialog = (target) => {
    setEditForm(target);
    setEditOpen(true);
  };

  const openPasswordDialog = (target) => {
    setPasswordForm({ id: target.id, password: '' });
    setPasswordOpen(true);
  };

  const renderStatusPill = (item) => {
    const active = item.is_active === true || item.is_active === 1;
    const base =
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold';
    const styles = active
      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/40'
      : 'bg-rose-500/10 text-rose-500 border border-rose-500/40';
    return (
      <span className={`${base} ${styles}`}>
        {active ? 'Active' : 'Blocked'}
      </span>
    );
  };

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isSelf = (item) =>
    activeUser && Number(activeUser.id) === Number(item.id);

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <>
        <Helmet>
          <title>Admin | Access Denied</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="p-6 bg-card rounded-lg border border-secondary">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-secondary rounded-full">
                <Shield className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have permission to access this page.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Only administrators can manage users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin | User Management</title>
        <meta
          name="description"
          content="Create, update, and secure access for Zenith admin users."
        />
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Control who can access the Zenith admin workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadUsers}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Input
              placeholder="Search by name, username, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search users"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {users.filter(u => u.username !== 'zenithlog').length} total • {filteredUsers.length} shown
          </div>
        </div>

        <div className="bg-card rounded-lg border border-secondary overflow-hidden">
          {error && (
            <div className="p-4 text-sm text-destructive border-b border-secondary">
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Username</th>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Created
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <p className="text-muted-foreground">
                        No users match your search.
                      </p>
                    </td>
                  </tr>
                )}
                {!loading &&
                  filteredUsers.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-t border-secondary"
                    >
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {item.username}
                          {isSelf(item) && (
                            <span className="text-[10px] uppercase tracking-wide text-primary border border-primary/40 px-1.5 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.full_name || '—'}</td>
                      <td className="px-4 py-3">{item.email || '—'}</td>
                      <td className="px-4 py-3 capitalize">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            item.role === 'admin'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                          }`}
                        >
                          {item.role}
                          {item.role === 'admin' ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <ShieldOff className="w-3 h-3" />
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">{renderStatusPill(item)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPasswordDialog(item)}
                          >
                            Password
                          </Button>
                          {item.role === 'admin' ? (
                            <Button
                              size="sm"
                              variant={item.is_active ? 'destructive' : 'outline'}
                              className="min-w-[96px]"
                              onClick={() => toggleStatus(item.id)}
                              disabled={busyUserId === item.id || isSelf(item)}
                            >
                              {busyUserId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : item.is_active ? (
                                'Block'
                              ) : (
                                'Unblock'
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(item.id)}
                              disabled={busyUserId === item.id}
                            >
                              {busyUserId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="text"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Share this password securely. The user can change it later.
              </p>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full rounded-md border border-secondary bg-secondary text-foreground px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="admin">Admin (full access)</option>
                <option value="user">User (limited)</option>
              </select>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Full Name</Label>
                <Input
                  id="edit_name"
                  value={editForm.full_name || ''}
                  onChange={(e) =>
                    handleEditChange('full_name', e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_role">Role</Label>
                <select
                  id="edit_role"
                  value={editForm.role}
                  onChange={(e) => handleEditChange('role', e.target.value)}
                  className="w-full rounded-md border border-secondary bg-secondary text-foreground px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-md min-h-0">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-sm font-medium">
                New Password
              </Label>
              <Input
                id="new_password"
                type="password"
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="Enter new password"
                required
                minLength={8}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Passwords are hashed securely before saving.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagement;


