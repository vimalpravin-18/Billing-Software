import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Settings, Save, CheckCircle, Store, Receipt, Percent, FileText } from 'lucide-react';

const SettingsPage = () => {
  const [form, setForm] = useState({
    shopName: '',
    address: '',
    phone: '',
    email: '',
    invoicePrefix: 'INV',
    defaultTaxRate: '5.00',
    currencySymbol: '₹',
    receiptFooterText: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/settings');
        setForm(response.data);
      } catch (err) {
        console.error('Failed to load shop settings', err);
        showError('Failed to load shop settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/settings', form);
      setForm(response.data);
      showSuccess('Shop & billing settings updated successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save shop settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading settings...</div>;
  }

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-sm dark:shadow-md transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>Shop & Invoicing Configuration</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-0.5">
            Configure bakery store profile, invoice number sequence prefix, tax rate, and receipt footer
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3.5">
        {/* Section 1: Store Brand Identity */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-3.5 transition-colors">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <Store className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Bakery Store Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bakery Shop Name *</label>
              <input
                type="text"
                required
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-amber-500 font-sans shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-amber-600 dark:text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Store Address *</label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-inner"
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Invoicing */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-3.5 transition-colors">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <Receipt className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Billing, Invoices & Tax Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Prefix *</label>
              <input
                type="text"
                required
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase().trim() })}
                placeholder="e.g. BAKE or INV"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-amber-600 dark:text-amber-400 font-mono font-black focus:outline-none focus:border-amber-500 shadow-inner"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Sample: {form.invoicePrefix}-20260918-0001</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Default GST Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.defaultTaxRate}
                onChange={(e) => setForm({ ...form, defaultTaxRate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-black focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Receipt Footer */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-3.5 transition-colors">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Receipt Customer Message</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Receipt Footer Note</label>
            <input
              type="text"
              value={form.receiptFooterText}
              onChange={(e) => setForm({ ...form, receiptFooterText: e.target.value })}
              placeholder="Thank you for visiting! Have a sweet day."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium shadow-inner"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#171c2b] rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
            <span className="text-xs text-amber-600 dark:text-amber-400 block uppercase mb-1 font-sans font-bold">Thermal Receipt Preview</span>
            <p className="text-slate-900 dark:text-white font-bold text-sm">{form.receiptFooterText || 'Thank you for your visit!'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Powered by BakeryPOS</p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
