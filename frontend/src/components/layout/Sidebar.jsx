import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Receipt,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Store,
  LogOut,
} from 'lucide-react';
import LogoutConfirmModal from '../auth/LogoutConfirmModal';

const Sidebar = ({ isOpen, onClose, collapsed, setCollapsed }) => {
  const { isAdmin, user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    {
      label: 'POS Counter',
      path: '/pos',
      icon: ShoppingCart,
      adminOnly: false,
    },
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      label: 'Products',
      path: '/products',
      icon: Package,
      adminOnly: true,
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Boxes,
      adminOnly: true,
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: Users,
      adminOnly: false,
    },
    {
      label: 'Sales & Bills',
      path: '/orders',
      icon: Receipt,
      adminOnly: false,
    },
    {
      label: 'Staff Accounts',
      path: '/users',
      icon: UserCheck,
      adminOnly: true,
    },
    {
      label: 'Shop Settings',
      path: '/settings',
      icon: Settings,
      adminOnly: true,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Body - Compact width for maximum center catalog space */}
      <aside
        className={`
          fixed md:relative top-0 bottom-0 left-0 z-40 md:z-20
          h-full shrink-0
          bg-white dark:bg-[#111622] border-r-2 border-slate-900 dark:border-slate-800
          flex flex-col justify-between py-2.5
          transition-all duration-150 ease-in-out shadow-xs select-none
          ${collapsed ? 'md:w-16' : 'md:w-48 lg:w-52'}
          ${isOpen ? 'translate-x-0 w-64 shadow-xl z-50' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile Header in Drawer (< 768px) */}
        <div className="flex items-center justify-between px-3.5 pb-2.5 border-b-2 border-slate-900 dark:border-slate-800 md:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 border-2 border-slate-950">
              <Store className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-base text-slate-950 dark:text-white block leading-tight">BakeryPOS</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                {user?.role === 'ROLE_ADMIN' ? 'Admin Portal' : 'Cashier Station'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-900 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Navigation Items List - Compact & Ergonomic */}
        <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1 no-scrollbar">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin()) return null;

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `
                  group relative flex items-center rounded-xl text-xs sm:text-sm tracking-tight transition-all duration-100
                  ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5 space-x-3'}
                  ${
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black shadow-xs border-2 border-slate-950 dark:border-white'
                      : 'text-slate-950 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-black dark:hover:text-white font-bold border-2 border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4.5 h-4.5 shrink-0 transition-transform stroke-[2.2] ${
                        isActive
                          ? 'text-white dark:text-slate-950'
                          : 'text-slate-900 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white'
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          isActive
                            ? 'bg-white text-slate-950 border-white dark:bg-slate-950 dark:text-white dark:border-slate-950'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-slate-100 border-slate-900 dark:border-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer: Desktop Collapse Button & Mobile Drawer Sign Out Button */}
        <div className="px-2 pt-2 border-t-2 border-slate-900 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full p-2 rounded-xl text-slate-900 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs sm:text-sm font-bold cursor-pointer border border-transparent hover:border-slate-900"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4 stroke-[2.5]" /> : <ChevronLeft className="w-4 h-4 stroke-[2.5]" />}
            {!collapsed && <span className="ml-1.5 text-xs font-bold uppercase tracking-wider">Collapse</span>}
          </button>

          {/* Mobile Drawer Logout Trigger */}
          <button
            type="button"
            onClick={() => {
              onClose();
              setShowLogoutModal(true);
            }}
            className="md:hidden flex items-center justify-center w-full p-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-2 border-rose-500/40 transition-colors text-xs font-black cursor-pointer space-x-2"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
        user={user}
      />
    </>
  );
};

export default Sidebar;
