import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import InvoicePrintModal from '../components/invoice/InvoicePrintModal';
import { Receipt, Search, Printer, Calendar, Filter, RefreshCw, ArrowUpDown, Users } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [shopSettings, setShopSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [datePreset, setDatePreset] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, setRes] = await Promise.allSettled([
        api.get('/orders'),
        api.get('/settings'),
      ]);
      if (ordRes.status === 'fulfilled') setOrders(ordRes.value.data);
      if (setRes.status === 'fulfilled') setShopSettings(setRes.value.data);
    } catch (err) {
      console.error('Failed to load orders history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        o.invoiceNumber.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.cashierName && o.cashierName.toLowerCase().includes(q));

      const matchesPayment = paymentFilter === '' || o.paymentMethod === paymentFilter;

      let matchesDate = true;
      if (datePreset === 'TODAY') {
        matchesDate = o.createdAt && o.createdAt.startsWith(todayStr);
      } else if (datePreset === 'YESTERDAY') {
        matchesDate = o.createdAt && o.createdAt.startsWith(yesterdayStr);
      }

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [orders, searchQuery, paymentFilter, datePreset]);

  const currency = shopSettings?.currencySymbol || '₹';

  const totalFilteredRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
  }, [filteredOrders]);

  const totalFilteredClients = useMemo(() => {
    const registeredClients = new Set();
    let walkInCount = 0;

    filteredOrders.forEach((o) => {
      const name = (o.customerName || '').trim().toLowerCase();
      if (o.customerId) {
        registeredClients.add(`id_${o.customerId}`);
      } else if (name && name !== 'walk-in customer' && name !== 'walk-in' && name !== 'guest') {
        registeredClients.add(`name_${name}`);
      } else {
        walkInCount += 1;
      }
    });

    return registeredClients.size + walkInCount;
  }, [filteredOrders]);

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-sm dark:shadow-md transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <span>Sales & Counter Bills History</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-0.5">
            View completed orders, cashier history, and reprint receipts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
          {/* Total Revenue */}
          <div className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700/80 flex items-center space-x-2 shadow-inner">
            <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">Total Revenue:</span>
            <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base">
              {currency}{totalFilteredRevenue.toFixed(2)}
            </span>
          </div>

          {/* Number of Clients */}
          <div className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700/80 flex items-center space-x-2 shadow-inner">
            <Users className="w-4 h-4 text-amber-500 stroke-[2.5]" />
            <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">Total Clients:</span>
            <span className="font-mono font-black text-slate-900 dark:text-white text-sm sm:text-base">
              {totalFilteredClients}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 hidden md:inline">
              ({filteredOrders.length} {filteredOrders.length === 1 ? 'bill' : 'bills'})
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            title="Refresh order history"
            className="p-2 sm:p-2.5 bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700/80 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar: Search, Payment Method, Date Preset */}
      <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-3 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between shadow-sm transition-colors">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, customer, or cashier..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-medium shadow-inner"
          />
        </div>

        {/* Date Presets & Payment Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-[#171c2b] p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDatePreset(p.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  datePreset === p.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
          >
            <option value="">All Payment Modes</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI QR</option>
            <option value="CARD">Card</option>
          </select>
        </div>
      </div>

      {/* Orders View: Desktop Table + Mobile Cards */}
      <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-[#171c2b] text-slate-700 dark:text-slate-300 uppercase text-xs font-black border-b-2 border-slate-200 dark:border-slate-700/80">
              <tr>
                <th className="py-3.5 px-3 text-center w-12 font-black">#</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Cashier</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-center">Payment</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700/80">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-400">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-400">
                    No sales orders found matching filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b-2 border-slate-200 dark:border-slate-800">
                    {/* S.No / Serial Number */}
                    <td className="py-3.5 px-3 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-amber-600 dark:text-amber-400">
                      {order.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      {new Date(order.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {order.customerName}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{order.cashierName}</td>

                    <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white font-mono">
                      {order.items?.length || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase bg-slate-100 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-amber-600 dark:text-amber-400 font-mono text-base">
                      {currency}{Number(order.totalAmount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#1a2030] hover:bg-amber-500 hover:text-slate-950 border border-slate-200 dark:border-slate-700 hover:border-amber-500 rounded-xl text-slate-700 dark:text-amber-300 text-xs font-black transition-all flex items-center space-x-1.5 ml-auto shadow-sm cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
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
            <div className="text-center py-8 text-slate-400 text-xs">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No orders found.</div>
          ) : (
            filteredOrders.map((order, index) => (
              <div key={order.id} className="p-3 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{index + 1}</span>
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                      {order.invoiceNumber}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{order.customerName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Cashier: {order.cashierName} • {order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                      {currency}{Number(order.totalAmount).toFixed(2)}
                    </span>
                    <span className="block text-xs uppercase font-black text-slate-600 dark:text-slate-300">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full py-2 bg-slate-100 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print Receipt</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedOrder && (
        <InvoicePrintModal
          order={selectedOrder}
          shopSettings={shopSettings}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrdersPage;
