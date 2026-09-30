import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Mail,
  Phone,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  Filter,
  Copy,
  Info,
  Crown,
  Boxes,
  Edit3,
  Headphones,
  User as UserIcon,
} from 'lucide-react';
import { User, RoleSlug, Role } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AdminUsersProps {
  defaultTab?: 'all' | 'staff' | 'customers' | 'inactive';
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ defaultTab = 'all' }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const isSuperAdmin = currentUser?.role_slug === 'super_admin';

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search state
  const [activeTab, setActiveTab] = useState<'all' | 'staff' | 'customers' | 'inactive'>(defaultTab);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'spend' | 'orders'>('newest');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role_id: 4, // Default to customer
    notes: '',
    is_active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load users & roles from backend API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiRequest<User[]>('/admin/users'),
        apiRequest<Role[]>('/admin/roles'),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
    } catch {
      showToast('Error loading user directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await apiRequest<User[]>('/admin/users');
      if (res.success && res.data) {
        setUsers(res.data);
        showToast('User directory refreshed from database.', 'success');
      }
    } catch {
      showToast('Failed to refresh data.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Password Generator
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
    setShowPassword(true);
    showToast('Secure password generated.', 'info');
  };

  // Open Create Modal
  const handleOpenAddModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role_id: 4,
      notes: '',
      is_active: true,
    });
    setShowPassword(false);
    setAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (u: User) => {
    setSelectedUser(u);
    setFormData({
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      email: u.email || '',
      password: '', // Blank unless reset
      phone: u.phone || '',
      role_id: u.role_id,
      notes: u.notes || '',
      is_active: u.is_active,
    });
    setShowPassword(false);
    setEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (u: User) => {
    setSelectedUser(u);
    setDeleteModalOpen(true);
  };

  // Submit Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      showToast('First Name, Last Name, Email, and Password are required.', 'error');
      return;
    }

    if (Number(formData.role_id) === 1 && !isSuperAdmin) {
      showToast('Only Super Admin can assign the Super Administrator role.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<User>('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          role_id: Number(formData.role_id),
          notes: formData.notes.trim() || undefined,
        }),
      });

      if (res.success && res.data) {
        showToast(res.message || 'User created successfully.', 'success');
        setUsers((prev) => [res.data!, ...prev]);
        setAddModalOpen(false);
      } else {
        showToast(res.message || 'Could not create user.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred while creating user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      showToast('First Name, Last Name, and Email are required.', 'error');
      return;
    }

    if (Number(formData.role_id) === 1 && !isSuperAdmin) {
      showToast('Only Super Admin can assign the Super Administrator role.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        role_id: Number(formData.role_id),
        notes: formData.notes.trim() || null,
        is_active: formData.is_active,
      };

      if (formData.password && formData.password.trim().length > 0) {
        payload.password = formData.password.trim();
      }

      const res = await apiRequest<User>(`/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        showToast(res.message || 'User updated successfully.', 'success');
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...res.data! } : u)));
        setEditModalOpen(false);
      } else {
        showToast(res.message || 'Failed to update user.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle User Status
  const handleToggleStatus = async (u: User) => {
    if (u.id === currentUser?.id) {
      showToast('You cannot suspend your own account.', 'error');
      return;
    }

    try {
      const res = await apiRequest<User>(`/admin/users/${u.id}/toggle-status`, {
        method: 'PATCH',
      });

      if (res.success && res.data) {
        showToast(res.message || 'Status updated.', 'success');
        setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, is_active: res.data!.is_active } : item)));
      } else {
        showToast(res.message || 'Could not toggle status.', 'error');
      }
    } catch {
      showToast('Network error while toggling status.', 'error');
    }
  };

  // Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    if (selectedUser.id === currentUser?.id) {
      showToast('You cannot delete your own account.', 'error');
      setDeleteModalOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest(`/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        showToast(res.message || 'User deleted successfully.', 'success');
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setDeleteModalOpen(false);
      } else {
        showToast(res.message || 'Failed to delete user.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred while deleting user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Copy email helper
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    showToast(`Copied ${email} to clipboard.`, 'info');
  };

  // Role Badge Styling
  const getRoleBadge = (roleSlug: RoleSlug, roleName?: string) => {
    switch (roleSlug) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold tracking-wide">
            <Crown className="w-3 h-3 text-amber-400" />
            {roleName || 'Super Administrator'}
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold tracking-wide">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            {roleName || 'Store Administrator'}
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-semibold tracking-wide">
            <Boxes className="w-3 h-3 text-emerald-400" />
            {roleName || 'Store Manager'}
          </span>
        );
      case 'editor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-semibold tracking-wide">
            <Edit3 className="w-3 h-3 text-purple-400" />
            {roleName || 'Content Editor'}
          </span>
        );
      case 'support':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-semibold tracking-wide">
            <Headphones className="w-3 h-3 text-cyan-400" />
            {roleName || 'Customer Support'}
          </span>
        );
      case 'customer':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono text-[11px]">
            <UserIcon className="w-3 h-3 text-neutral-400" />
            {roleName || 'Registered Customer'}
          </span>
        );
    }
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Tab filtering
        if (activeTab === 'staff') {
          if (u.role_slug === 'customer') return false;
        } else if (activeTab === 'customers') {
          if (u.role_slug !== 'customer') return false;
        } else if (activeTab === 'inactive') {
          if (u.is_active) return false;
        }

        // Search text
        if (search.trim()) {
          const term = search.toLowerCase();
          const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
          const email = (u.email || '').toLowerCase();
          const phone = (u.phone || '').toLowerCase();
          const notes = (u.notes || '').toLowerCase();
          const roleName = (u.role_name || u.role_slug || '').toLowerCase();
          if (
            !fullName.includes(term) &&
            !email.includes(term) &&
            !phone.includes(term) &&
            !notes.includes(term) &&
            !roleName.includes(term)
          ) {
            return false;
          }
        }

        // Role filter dropdown
        if (roleFilter !== 'all' && u.role_slug !== roleFilter) {
          return false;
        }

        // Status filter dropdown
        if (statusFilter === 'active' && !u.is_active) return false;
        if (statusFilter === 'inactive' && u.is_active) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.first_name.localeCompare(b.first_name);
        }
        if (sortBy === 'spend') {
          return (b.total_spent || 0) - (a.total_spent || 0);
        }
        if (sortBy === 'orders') {
          return (b.order_count || 0) - (a.order_count || 0);
        }
        // default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [users, activeTab, search, roleFilter, statusFilter, sortBy]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const staffCount = users.filter((u) => u.role_slug !== 'customer').length;
    const customerCount = users.filter((u) => u.role_slug === 'customer').length;
    const activeCount = users.filter((u) => u.is_active).length;
    const suspendedCount = total - activeCount;

    return { total, staffCount, customerCount, activeCount, suspendedCount };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Enterprise Access Control & Personnel
            </span>
            <span className="text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded-full font-mono">
              MySQL Cluster Synchronized
            </span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
            Admin & User Directory Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Authorize administrative operatives, configure role privileges, invite platform managers, and govern VIP connoisseur accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPermissionsModalOpen(true)}
            className="flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white px-3.5 py-2.5 rounded-xl border border-neutral-800 text-xs font-medium transition cursor-pointer"
            title="View system permission hierarchy"
          >
            <Info className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Role Permissions</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white px-3.5 py-2.5 rounded-xl border border-neutral-800 text-xs font-medium transition cursor-pointer"
            title="Reload from MySQL"
          >
            <RefreshCw className={`w-4 h-4 text-neutral-400 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-950/40 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User / Admin</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-transparent" />
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-amber-400/80" />
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-white">{metrics.total}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Across all role tiers</div>
        </div>

        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent" />
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Staff & Admins</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400/80" />
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-indigo-300">{metrics.staffCount}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Privileged operations</div>
        </div>

        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">VIP Patrons</span>
            <Sparkles className="w-4 h-4 text-emerald-400/80" />
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-emerald-300">{metrics.customerCount}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Registered clients</div>
        </div>

        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-rose-500 to-transparent" />
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Account Standing</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono">Live</span>
            </div>
          </div>
          <div className="text-2xl font-serif-luxury font-bold text-white">
            {metrics.activeCount}{' '}
            <span className="text-xs font-normal font-sans text-neutral-500">
              ({metrics.suspendedCount} suspended)
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Active verified access</div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <span>All Users</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
            {metrics.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <span>Staff & Administrators</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
            {metrics.staffCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <span>Customers & Patrons</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
            {metrics.customerCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'inactive'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <span>Suspended Accounts</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800">
            {metrics.suspendedCount}
          </span>
        </button>
      </div>

      {/* 4. Search and Filter Bar */}
      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center gap-3 bg-neutral-900/80 px-3.5 py-2 rounded-lg border border-neutral-800 focus-within:border-amber-500/60 transition">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, role, notes..."
            className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-neutral-500 hover:text-white text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-900/80 px-2.5 py-1.5 rounded-lg border border-neutral-800">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-neutral-900">All Roles</option>
              <option value="super_admin" className="bg-neutral-900">Super Administrator</option>
              <option value="admin" className="bg-neutral-900">Store Administrator</option>
              <option value="manager" className="bg-neutral-900">Store Manager</option>
              <option value="editor" className="bg-neutral-900">Content Editor</option>
              <option value="support" className="bg-neutral-900">Customer Support</option>
              <option value="customer" className="bg-neutral-900">Registered Customer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-900/80 px-2.5 py-1.5 rounded-lg border border-neutral-800">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-neutral-900">All Statuses</option>
              <option value="active" className="bg-neutral-900">Active Only</option>
              <option value="inactive" className="bg-neutral-900">Suspended Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-900/80 px-2.5 py-1.5 rounded-lg border border-neutral-800">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-neutral-900">Newest Enrolled</option>
              <option value="name" className="bg-neutral-900">Name (A-Z)</option>
              <option value="spend" className="bg-neutral-900">Highest Spend</option>
              <option value="orders" className="bg-neutral-900">Order Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Main Users Table */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-3" />
            <p className="text-xs">Querying LuxeCommerce secure user vault...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Users className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
            <p className="text-sm font-semibold text-white">No users matched your query</p>
            <p className="text-xs text-neutral-500 mt-1">Try adjusting your search criteria or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">User Dossier</th>
                  <th className="py-3.5 px-4">Access Role</th>
                  <th className="py-3.5 px-4">Direct Contact</th>
                  <th className="py-3.5 px-4">Standing</th>
                  <th className="py-3.5 px-4">Orders & Spend</th>
                  <th className="py-3.5 px-4">Enrolled</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-neutral-300">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-neutral-900/50 transition">
                      {/* User identity & avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt={u.first_name}
                                className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                              />
                            ) : (
                              <div
                                className={`w-9 h-9 rounded-full border flex items-center justify-center font-serif-luxury font-bold text-sm ${
                                  u.role_slug === 'super_admin'
                                    ? 'bg-amber-950/60 border-amber-600/50 text-amber-400'
                                    : u.role_slug === 'admin'
                                    ? 'bg-indigo-950/60 border-indigo-600/50 text-indigo-300'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                }`}
                              >
                                {u.first_name[0]}
                                {u.last_name ? u.last_name[0] : ''}
                              </div>
                            )}
                            {u.is_active && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-neutral-950" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white">
                                {u.first_name} {u.last_name}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] bg-amber-900/60 text-amber-300 border border-amber-700/60 px-1.5 py-0.2 rounded font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                              ID: #{u.id} {u.notes ? `• ${u.notes}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role_slug, u.role_name)}
                      </td>

                      {/* Contact details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 group">
                          <span className="text-neutral-300 font-mono">{u.email}</span>
                          <button
                            onClick={() => handleCopyEmail(u.email)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-amber-400 transition"
                            title="Copy email"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          {u.phone || 'No phone recorded'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrent}
                          title={isCurrent ? 'Cannot modify your own account' : 'Click to toggle status'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition cursor-pointer ${
                            u.is_active
                              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/80'
                              : 'bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900/80'
                          } ${isCurrent ? 'cursor-not-allowed opacity-80' : ''}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                            }`}
                          />
                          <span>{u.is_active ? 'Active' : 'Suspended'}</span>
                        </button>
                      </td>

                      {/* Orders & Value */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-white font-semibold">
                          {u.order_count || 0} {u.order_count === 1 ? 'order' : 'orders'}
                        </div>
                        <div className="text-[11px] font-mono text-amber-400 font-bold mt-0.5">
                          ${(u.total_spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Enrolled date */}
                      <td className="py-3.5 px-4 font-mono text-neutral-500 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 transition cursor-pointer"
                            title="Edit user details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Toggle Button */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isCurrent
                                ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                                : u.is_active
                                ? 'bg-neutral-900 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 border-neutral-800 hover:border-rose-800'
                                : 'bg-neutral-900 hover:bg-emerald-950/60 text-neutral-400 hover:text-emerald-400 border-neutral-800 hover:border-emerald-800'
                            }`}
                            title={u.is_active ? 'Suspend account' : 'Activate account'}
                          >
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete Button (Super Admin only) */}
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleOpenDeleteModal(u)}
                              disabled={isCurrent}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isCurrent
                                  ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                                  : 'bg-neutral-900 hover:bg-rose-950/80 text-rose-400 hover:text-rose-300 border-neutral-800 hover:border-rose-700'
                              }`}
                              title={isCurrent ? 'Cannot delete yourself' : 'Remove user'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 6. MODAL: ADD NEW USER / ADMIN                           */}
      {/* ======================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    Add New User / Admin Operative
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Provision new credentials directly into the production database.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-5">
              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                    First Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Victor"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                    Last Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Sterling"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. v.sterling@luxecommerce.com"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password with generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono text-neutral-300">
                    Temporary Password <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    Auto-Generate Secure Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter min 6-character passphrase"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 pr-10 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Direct Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Platform Role & Privilege Level <span className="text-amber-400">*</span>
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {isSuperAdmin && (
                    <option value={1} className="bg-neutral-900 text-amber-300 font-bold">
                      Super Administrator — Full unconstrained system access
                    </option>
                  )}
                  <option value={2} className="bg-neutral-900 text-indigo-300">
                    Store Administrator — Products, orders, customers, and CMS
                  </option>
                  <option value={3} className="bg-neutral-900 text-emerald-300">
                    Store Manager — Inventory, catalog, and order fulfillment
                  </option>
                  <option value={5} className="bg-neutral-900 text-purple-300">
                    Content Editor — Blogs, banners, and static pages
                  </option>
                  <option value={6} className="bg-neutral-900 text-cyan-300">
                    Customer Support — Assist client accounts and track orders
                  </option>
                  <option value={4} className="bg-neutral-900 text-neutral-300">
                    Registered Customer — Standard shopping account
                  </option>
                </select>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Permissions are validated at both the REST API middleware and database foreign key levels.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Department / Administrative Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Senior Horology Specialist • London Concierge Desk"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-amber-950/40"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: EDIT USER                                      */}
      {/* ======================================================== */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    Edit User Dossier #{selectedUser.id}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Modifying {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 mt-5">
              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                    First Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                    Last Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Optional Reset Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono text-neutral-300">
                    Reset Password (Optional)
                  </label>
                  <span className="text-[10px] text-neutral-500">Leave blank to retain current password</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password to reset"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 pr-10 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Direct Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Platform Role & Privilege Level
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {isSuperAdmin && (
                    <option value={1} className="bg-neutral-900 text-amber-300 font-bold">
                      Super Administrator — Full unconstrained system access
                    </option>
                  )}
                  <option value={2} className="bg-neutral-900 text-indigo-300">
                    Store Administrator — Products, orders, customers, and CMS
                  </option>
                  <option value={3} className="bg-neutral-900 text-emerald-300">
                    Store Manager — Inventory, catalog, and order fulfillment
                  </option>
                  <option value={5} className="bg-neutral-900 text-purple-300">
                    Content Editor — Blogs, banners, and static pages
                  </option>
                  <option value={6} className="bg-neutral-900 text-cyan-300">
                    Customer Support — Assist client accounts and track orders
                  </option>
                  <option value={4} className="bg-neutral-900 text-neutral-300">
                    Registered Customer — Standard shopping account
                  </option>
                </select>
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2 p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  disabled={selectedUser.id === currentUser?.id}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="edit_is_active" className="text-xs text-neutral-200 cursor-pointer select-none">
                  Account Active & Enabled (Uncheck to suspend access)
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Administrative Notes / Title
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-amber-950/40"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: DELETE CONFIRMATION                            */}
      {/* ======================================================== */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-rose-900/80 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif-luxury">
                  Confirm Account Deletion
                </h3>
                <span className="text-[10px] text-rose-400 uppercase font-mono tracking-wider font-bold">
                  Irreversible Administrative Action
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mt-2">
              Are you certain you wish to remove{' '}
              <strong className="text-white">
                {selectedUser.first_name} {selectedUser.last_name}
              </strong>{' '}
              ({selectedUser.email})?
            </p>

            <div className="mt-3 p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 font-mono space-y-1">
              <div>• User ID: #{selectedUser.id}</div>
              <div>• Role: {selectedUser.role_name || selectedUser.role_slug}</div>
              <div>• Orders Placed: {selectedUser.order_count || 0}</div>
              <div className="text-rose-400">
                • Status: Account will be soft-deleted in MySQL and revoked immediately.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-rose-950/40"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm & Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. MODAL: ROLE PERMISSIONS REFERENCE                     */}
      {/* ======================================================== */}
      {permissionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-serif-luxury">
                  LuxeCommerce Role Permission Hierarchy
                </h3>
              </div>
              <button
                onClick={() => setPermissionsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-neutral-900 rounded-xl border border-amber-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-300 font-mono text-xs flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Super Administrator (slug: super_admin)
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                    Tier 1 (Root Access)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Unrestricted system-wide privileges: create/edit/delete any administrative account, adjust database store settings, purge audit logs, manage product catalog, inventory, and order fulfillment.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-indigo-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-indigo-300 font-mono text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Store Administrator (slug: admin)
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                    Tier 2 (Store Admin)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Manage product catalog, inventory adjustments, orders, coupons, customer accounts, reviews, and CMS banners. Cannot assign Super Admin role or delete Super Admin accounts.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-300 font-mono text-xs flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                    Store Manager (slug: manager)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    Tier 3 (Logistics)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Manage inventory levels, create stock adjustments, review and transition order fulfillment states.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-purple-300 font-mono text-xs flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    Content Editor (slug: editor)
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                    Tier 4 (Editorial)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Draft, publish, and manage editorial articles, blog posts, homepage promo banners, and media assets.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-cyan-300 font-mono text-xs flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                    Customer Support (slug: support)
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                    Tier 5 (Support)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  View customer dossiers and order histories, update order delivery notes, and provide client concierge assistance.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-neutral-300 font-mono text-xs flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                    Registered Customer (slug: customer)
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                    Tier 6 (Shopper)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Standard registered patron. Can browse storefront, manage wishlist, place orders, write reviews, and view their personal order history.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800 text-right">
              <button
                onClick={() => setPermissionsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
