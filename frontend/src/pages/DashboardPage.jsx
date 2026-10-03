import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Package,
  CreditCard,
  Award,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [shopSettings, setShopSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [sumRes, setRes] = await Promise.allSettled([
        api.get('/reports/dashboard'),
        api.get('/settings'),
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
      if (setRes.status === 'fulfilled') setShopSettings(setRes.value.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const currency = shopSettings?.currencySymbol || '₹';
  const todaySales = Number(summary?.todaySales || 0);
  const todayOrders = Number(summary?.todayOrdersCount || 0);
  const avgBillValue = todayOrders > 0 ? (todaySales / todayOrders).toFixed(2) : '0.00';
  const lowStockCount = Number(summary?.lowStockCount || 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-sm dark:shadow-md transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-amber-500" />
            <span>Bakery Business Performance</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-0.5">
            Real-time daily operations and sales metrics aggregated directly from PostgreSQL
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchDashboard}
            title="Refresh analytics"
            className="p-2.5 bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          <Link
            to="/pos"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/25 flex items-center space-x-1.5 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open POS Counter</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Today's Revenue */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight leading-none">
              {currency}{todaySales.toFixed(2)}
            </h2>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <span>Avg bill: {currency}{avgBillValue}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Live DB sync</span>
            </div>
          </div>
        </div>

        {/* Today's Bills Count */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Bills Completed
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
              {todayOrders}
            </h2>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <span>Sales transactions</span>
              <Link to="/orders" className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1">
                <span>View bills</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className={`text-3xl font-black font-mono tracking-tight leading-none ${
              lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {lowStockCount}
            </h2>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <span>Items needing reorder</span>
              {lowStockCount > 0 && (
                <Link to="/inventory" className="text-rose-600 dark:text-rose-400 font-bold hover:underline">
                  Review stock
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Catalog & Customers */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Catalog & Clients
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2 leading-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {summary?.totalProducts || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">items</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                {summary?.totalCustomers || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">clients</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Registered records in DB
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Top Selling Bakery Items Today</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Ranked by volume</span>
          </div>

          <div className="space-y-2">
            {!summary?.topProducts || summary.topProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <ShoppingBag className="w-8 h-8 stroke-1 mx-auto mb-1 opacity-30 text-amber-500" />
                <span>No product sales recorded yet today.</span>
              </div>
            ) : (
              summary.topProducts.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black flex items-center justify-center text-xs shrink-0 font-mono border border-amber-500/30">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.quantitySold} units sold</p>
                    </div>
                  </div>
                  <span className="font-black text-amber-600 dark:text-amber-400 font-mono text-sm sm:text-base shrink-0 ml-2">
                    {currency}{Number(item.totalRevenue).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Payment Method Revenue</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Today's breakdown</span>
          </div>

          <div className="space-y-2">
            {!summary?.paymentMethodSummary || summary.paymentMethodSummary.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CreditCard className="w-8 h-8 stroke-1 mx-auto mb-1 opacity-30 text-amber-500" />
                <span>No payment transactions logged today.</span>
              </div>
            ) : (
              summary.paymentMethodSummary.map((pm, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-[#171c2b] border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm"
                >
                  <div>
                    <span className="font-black uppercase text-slate-900 dark:text-white tracking-wider text-xs sm:text-sm">
                      {pm.paymentMethod}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {pm.orderCount} {pm.orderCount === 1 ? 'sale' : 'sales'} processed
                    </p>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-base sm:text-lg">
                    {currency}{Number(pm.totalAmount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
