import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Users, UserPlus, Search, Edit2, Phone, RefreshCw, X } from 'lucide-react';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCust, setEditingCust] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  const { showSuccess, showError, showWarning } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error('Failed to load customers', err);
      showError('Failed to load customers directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openNewModal = () => {
    setEditingCust(null);
    setForm({ name: '', phone: '' });
    setShowModal(true);
  };

  const openEditModal = (cust) => {
    setEditingCust(cust);
    setForm({
      name: cust.name,
      phone: cust.phone || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showWarning('Customer name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: '',
        address: '',
      };

      if (editingCust) {
        await api.put(`/customers/${editingCust.id}`, payload);
        showSuccess(`Customer "${form.name}" updated successfully!`);
      } else {
        await api.post('/customers', payload);
        showSuccess(`New customer "${form.name}" added!`);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        q === '' ||
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, searchQuery]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border-2 border-slate-900 dark:border-slate-700">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span>Bakery Customer Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
            Registered customer contact profiles, phone numbers, and repeat billing records
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={openNewModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black border-2 border-slate-900 shadow-2xs flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Customer</span>
          </button>

          <button
            type="button"
            onClick={fetchCustomers}
            title="Refresh Directory"
            className="p-2.5 bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 shadow-2xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-xs transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or mobile number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-bold hidden sm:inline font-mono">
          {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
        </span>
      </div>

      {/* Customers Table & Mobile Cards */}
      <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-[#171c2b] text-slate-900 dark:text-slate-200 uppercase text-xs font-black border-b-2 border-slate-900 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-3 text-center w-14 font-black">#</th>
                <th className="py-3.5 px-4 font-black">Customer Name</th>
                <th className="py-3.5 px-4 font-black">Mobile / Phone Number</th>
                <th className="py-3.5 px-4 text-center sticky right-0 bg-slate-100 dark:bg-[#171c2b] border-l-2 border-slate-900/20 dark:border-slate-800 z-20 w-32 shadow-[-6px_0_12px_rgba(0,0,0,0.08)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700/80">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-400 font-bold">
                    Loading customer records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-400 font-bold">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((customer, index) => (
                  <tr key={customer.id} className="group hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors border-b-2 border-slate-200 dark:border-slate-800">
                    {/* S.No / Serial Number */}
                    <td className="py-3 px-3 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </td>

                    {/* Customer Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs">
                          {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                            {customer.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            ID: #{customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Mobile / Phone Number */}
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm">
                      {customer.phone ? (
                        <a
                          href={`tel:${customer.phone}`}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/40 text-amber-700 dark:text-amber-300 hover:text-amber-800 font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-500" />
                          <span>{customer.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No mobile registered</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center sticky right-0 bg-white dark:bg-[#121622] group-hover:bg-amber-50 dark:group-hover:bg-[#161d2d] border-l-2 border-b-2 border-slate-900/20 dark:border-slate-800 z-10 w-32 shadow-[-6px_0_12px_rgba(0,0,0,0.08)] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(customer)}
                        className="px-2.5 py-1.5 rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 dark:text-amber-200 font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Edit customer details"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y-2 divide-slate-200 dark:divide-slate-700/80 p-2">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs font-bold">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-bold">No customers found.</div>
          ) : (
            filtered.map((customer, index) => (
              <div key={customer.id} className="p-3 flex items-center justify-between text-xs sm:text-sm gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-400 shrink-0">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{customer.name}</h4>
                    {customer.phone ? (
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold mt-0.5 inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-amber-500" />
                        <span>{customer.phone}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No mobile</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(customer)}
                  className="px-2.5 py-1.5 rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 dark:text-amber-200 font-black text-xs inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Edit</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Modal: ONLY Name and Mobile Number */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141926] border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in fade-in transition-colors">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {editingCust ? 'Edit Customer Info' : 'Create Customer Record'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Priya Sundaram"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 font-bold"
                />
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
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black border-2 border-slate-900 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {saving ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
