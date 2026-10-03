import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  UserCheck,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  Lock,
  User,
  KeyRound,
  Search,
  Users,
  ShieldCheck,
  UserCog
} from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [resetting, setResetting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'ROLE_STAFF',
  });

  const { showSuccess, showError, showWarning } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users', err);
      showError('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim() || !form.fullName.trim()) {
      showWarning('Please fill all required user fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({ username: '', password: '', fullName: '', role: 'ROLE_STAFF' });
      showSuccess(`User account @${form.username} created successfully!`);
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus, username) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      showSuccess(`Account @${username} is now ${currentStatus ? 'Disabled' : 'Active'}`);
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPasswordVal.trim() || newPasswordVal.length < 6) {
      showWarning('Password must be at least 6 characters long');
      return;
    }
    setResetting(true);
    try {
      await api.patch(`/users/${resetTargetUser.id}/reset-password`, {
        newPassword: newPasswordVal,
      });
      showSuccess(`Password for @${resetTargetUser.username} has been reset successfully`);
      setShowResetModal(false);
      setNewPasswordVal('');
      setResetTargetUser(null);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset user password');
    } finally {
      setResetting(false);
    }
  };

  // KPI Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const adminUsers = users.filter((u) => u.role === 'ROLE_ADMIN').length;
  const staffUsers = users.filter((u) => u.role !== 'ROLE_ADMIN').length;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'ADMIN' && u.role === 'ROLE_ADMIN') ||
        (roleFilter === 'STAFF' && u.role !== 'ROLE_ADMIN');

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border-2 border-slate-900 dark:border-slate-700">
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span>Staff & User Administration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
            Manage cashier counter staff, manager credentials, and system roles with instant access controls
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black border-2 border-slate-900 shadow-2xs flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Staff Member</span>
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            title="Refresh User Accounts"
            className="p-2.5 bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 shadow-2xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center space-x-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-slate-100 shrink-0">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Total Staff</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">{totalUsers}</span>
          </div>
        </div>

        {/* Card 2: Cashiers */}
        <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center space-x-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 border-2 border-blue-500 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <User className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Cashiers</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono leading-none">{staffUsers}</span>
          </div>
        </div>

        {/* Card 3: Administrators */}
        <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center space-x-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 border-2 border-purple-500 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Admins</span>
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono leading-none">{adminUsers}</span>
          </div>
        </div>

        {/* Card 4: Active Status */}
        <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center space-x-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Active Status</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none">
              {activeUsers}/{totalUsers}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shadow-xs transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by full name or username..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="ADMIN">Administrators ({adminUsers})</option>
            <option value="STAFF">Cashiers ({staffUsers})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-[#171c2b] text-slate-900 dark:text-slate-200 uppercase text-xs font-black border-b-2 border-slate-900 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-3 text-center w-14 font-black">#</th>
                <th className="py-3.5 px-4 font-black">Staff Member</th>
                <th className="py-3.5 px-4 font-black">Username</th>
                <th className="py-3.5 px-4 font-black text-center">Role Permission</th>
                <th className="py-3.5 px-4 font-black text-center">Status</th>
                <th className="py-3.5 px-4 font-black text-center sticky right-0 bg-slate-100 dark:bg-[#171c2b] border-l-2 border-slate-900/20 dark:border-slate-800 z-20 min-w-[210px] shadow-[-6px_0_12px_rgba(0,0,0,0.08)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700/80">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-bold">
                    Loading staff accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-bold">
                    No staff accounts found matching filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id} className="group hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors border-b-2 border-slate-200 dark:border-slate-800">
                    {/* S.No / Serial Number */}
                    <td className="py-3 px-3 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </td>

                    {/* Staff Member (Avatar + Name) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-2xs">
                          {u.fullName?.charAt(0)?.toUpperCase() || u.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                            {u.fullName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            ID: #{u.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1a2030] text-amber-700 dark:text-amber-300 font-mono text-xs font-black border border-slate-300 dark:border-slate-700">
                        @{u.username}
                      </span>
                    </td>

                    {/* Role Permission Badge */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {u.role === 'ROLE_ADMIN' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-2 border-purple-500 shadow-2xs">
                          <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
                          <span>Master Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-2 border-blue-500 shadow-2xs">
                          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                          <span>Cashier Staff</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border-2 shadow-2xs ${
                          u.active
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-500'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-500'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{u.active ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>

                    {/* Sticky Actions Column */}
                    <td className="py-3 px-4 text-center sticky right-0 bg-white dark:bg-[#121622] group-hover:bg-amber-50 dark:group-hover:bg-[#161d2d] border-l-2 border-b-2 border-slate-900/20 dark:border-slate-800 z-10 min-w-[210px] shadow-[-6px_0_12px_rgba(0,0,0,0.08)] whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setResetTargetUser(u);
                            setNewPasswordVal('');
                            setShowResetModal(true);
                          }}
                          title={`Reset password for @${u.username}`}
                          className="px-2.5 py-1.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
                        >
                          <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Reset Pwd</span>
                        </button>

                        {/* Toggle Active or Protected Status */}
                        {u.username === 'admin' ? (
                          <span
                            className="px-2.5 py-1.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-bold inline-flex items-center gap-1.5 select-none"
                            title="Default system administrator account cannot be disabled"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                            <span>Protected</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggle(u.id, u.active, u.username)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all shadow-2xs cursor-pointer active:scale-95 inline-flex items-center gap-1.5 ${
                              u.active
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-500 hover:bg-rose-500 hover:text-white'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-500 hover:bg-emerald-500 hover:text-white'
                            }`}
                            title={u.active ? 'Disable account access' : 'Enable account access'}
                          >
                            {u.active ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Enable</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141926] border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in fade-in transition-colors">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-500 stroke-[2.5]" />
                <span>Create Staff Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Vikramaditya Roy"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
                  placeholder="e.g. vikram"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Role Permission *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
                >
                  <option value="ROLE_STAFF">Cashier Staff (POS Counter Billing)</option>
                  <option value="ROLE_ADMIN">Master Admin (Full Shop Suite)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t-2 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black border-2 border-slate-900 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {showResetModal && resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141926] border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in fade-in transition-colors">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-500 stroke-[2.5]" />
                <span>Reset Staff Password</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetTargetUser(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-medium">
              Set a new password for account <strong className="text-amber-600 dark:text-amber-400 font-mono font-black">@{resetTargetUser.username}</strong> ({resetTargetUser.fullName}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">New Password * (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t-2 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetTargetUser(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black border-2 border-slate-900 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {resetting ? 'Resetting...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
