import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Boxes, AlertTriangle, History, PlusCircle, RefreshCw, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock');

  // Manual Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyChange, setQtyChange] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError, showWarning } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.allSettled([
        api.get('/products/all'),
        api.get('/inventory/transactions'),
      ]);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data);
      if (tRes.status === 'fulfilled') setTransactions(tRes.value.data);
    } catch (err) {
      console.error('Failed to load inventory data', err);
      showError('Failed to load inventory logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !qtyChange || !reason.trim()) {
      showWarning('Please provide product, quantity change, and a valid reason');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/inventory/adjust', {
        productId: Number(selectedProductId),
        quantityChange: parseFloat(qtyChange),
        reason: reason.trim(),
      });

      setShowAdjustModal(false);
      setSelectedProductId('');
      setQtyChange('');
      setReason('');
      showSuccess('Stock adjustment logged successfully!');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Stock adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
  }, [products]);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-sm dark:shadow-md transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-500" />
            <span>Inventory & Stock Audit Control</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-0.5">
            Monitor real-time warehouse quantities, track inventory reductions, and log restock audits
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setSelectedProductId(products[0]?.id || '');
              setShowAdjustModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/25 flex items-center space-x-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Stock Adjustment</span>
          </button>

          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2 bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Low Stock Banner Alert */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/40 flex items-start space-x-3 text-amber-900 dark:text-amber-300 text-xs sm:text-sm shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-extrabold text-amber-950 dark:text-amber-300 text-sm sm:text-base">
              Low Stock Reorder Alert ({lowStockProducts.length} items)
            </h4>
            <p className="mt-1 text-slate-700 dark:text-slate-200">
              The following products are at or below their low-stock threshold:{' '}
              <span className="font-bold text-amber-700 dark:text-amber-300">
                {lowStockProducts.map((p) => `${p.name} (${p.stockQuantity} ${p.unit})`).join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex bg-slate-100 dark:bg-[#121622] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            activeTab === 'stock' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Current Stock Levels ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            activeTab === 'audit' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Audit History ({transactions.length})
        </button>
      </div>

      {/* Dual Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Card: Current Stock */}
        <div
          className={`bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl flex flex-col transition-colors ${
            activeTab === 'audit' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Boxes className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Current Stock Status</h3>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">{products.length} catalog items</span>
          </div>

          <div className="overflow-y-auto max-h-[520px] pr-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 dark:bg-[#171c2b] text-slate-700 dark:text-slate-300 uppercase text-xs font-black border-b-2 border-slate-200 dark:border-slate-700/80 sticky top-0">
                <tr>
                  <th className="py-2.5 px-2.5 text-center w-12 font-black">#</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Available Stock</th>
                  <th className="py-2.5 px-3 text-right">Reorder Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700/80">
                {products.map((p, index) => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b-2 border-slate-200 dark:border-slate-800">
                      <td className="py-2.5 px-2.5 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {p.name}
                        <span className="block text-xs font-mono text-slate-500 dark:text-slate-400">{p.sku}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300 text-xs font-semibold">{p.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span
                          className={`font-black px-2.5 py-0.5 rounded text-xs inline-block ${
                            isLow ? 'bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 font-black border border-amber-300 dark:border-amber-400/30' : 'text-slate-900 dark:text-white font-bold'
                          }`}
                        >
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500 dark:text-slate-400 text-xs">
                        {p.lowStockThreshold}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Audit Trail */}
        <div
          className={`bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl flex flex-col transition-colors ${
            activeTab === 'stock' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Inventory Audit Logs</h3>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">{transactions.length} audit entries</span>
          </div>

          <div className="overflow-y-auto max-h-[520px] pr-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 dark:bg-[#171c2b] text-slate-700 dark:text-slate-300 uppercase text-xs font-black border-b-2 border-slate-200 dark:border-slate-700/80 sticky top-0">
                <tr>
                  <th className="py-2.5 px-2.5 text-center w-12 font-black">#</th>
                  <th className="py-2.5 px-3">Product / Log</th>
                  <th className="py-2.5 px-3 text-center">Delta</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700/80">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 text-xs">
                      No stock movement logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, index) => {
                    const isPositive = tx.quantityChange > 0;

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b-2 border-slate-200 dark:border-slate-800">
                        <td className="py-2.5 px-2.5 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{tx.productName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by{' '}
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">{tx.userName}</span>
                          </p>
                          {tx.reason && <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{tx.reason}"</p>}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center font-black px-2 py-0.5 rounded text-xs font-mono ${
                              isPositive
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                                : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {tx.quantityChange}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#171c2b] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {tx.transactionType}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                          {tx.resultStock}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in fade-in transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <span>Record Stock Adjustment</span>
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Product *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-mono font-bold">
                    Current stock balance: {selectedProduct.stockQuantity} {selectedProduct.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity Change (+ to restock, - to write off) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={qtyChange}
                  onChange={(e) => setQtyChange(e.target.value)}
                  placeholder="e.g. +10 or -2"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-base text-amber-600 dark:text-amber-400 font-mono font-black focus:outline-none focus:border-amber-500 shadow-inner"
                />

                {/* Quick Delta Helper Buttons */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[1, 5, 10, 25].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQtyChange(`+${val}`)}
                      className="flex-1 py-1.5 bg-emerald-50 dark:bg-[#10141e] hover:bg-emerald-100 dark:hover:bg-slate-800 border border-emerald-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
                    >
                      +{val}
                    </button>
                  ))}
                  {[-1, -5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQtyChange(`${val}`)}
                      className="flex-1 py-1.5 bg-rose-50 dark:bg-[#10141e] hover:bg-rose-100 dark:hover:bg-slate-800 border border-rose-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-rose-700 dark:text-rose-400 transition-colors cursor-pointer"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Audit Reason / Note *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Morning Oven Restock, Waste, Damaged"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Committing...' : 'Commit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
