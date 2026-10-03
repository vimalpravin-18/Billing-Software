import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { Store, LogOut, Clock, Menu, ShoppingBag, Sun, Moon, KeyRound } from 'lucide-react';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import LogoutConfirmModal from '../auth/LogoutConfirmModal';

const Header = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { itemCount, grandTotal } = useCart();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-[#111622] border-b-2 border-slate-900 dark:border-slate-800 px-3 sm:px-5 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none transition-colors duration-150">
      {/* Left: Mobile Drawer Trigger & Brand Emblem */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        <Link to="/pos" className="flex items-center space-x-2 sm:space-x-2.5 group shrink-0 focus:outline-hidden">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-950 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors shrink-0">
            <Store className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950 dark:text-white whitespace-nowrap">
            BakeryPOS
          </span>
        </Link>
      </div>

      {/* Center: Live Station Clock */}
      <div className="hidden md:flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs sm:text-sm font-mono shadow-2xs shrink-0">
        <Clock className="w-4 h-4 text-slate-800 dark:text-slate-300 shrink-0" />
        <span className="font-medium whitespace-nowrap">
          {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-slate-900 dark:text-white font-bold tracking-tight whitespace-nowrap">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Right: Actions, Theme, Cart Pill, Identity */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 transition-colors shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          ) : (
            <Moon className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          )}
        </button>

        {/* Quick Cart Pill (Active when navigating outside POS screen) */}
        {location.pathname !== '/pos' && (
          <Link
            to="/pos"
            className="flex items-center space-x-1.5 sm:space-x-2 h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-slate-900 dark:border-slate-700 text-slate-950 dark:text-white transition-colors shadow-2xs shrink-0"
            title="Open POS Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-slate-950 dark:text-slate-200 stroke-[2.5]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="font-mono font-black text-xs sm:text-sm whitespace-nowrap">₹{grandTotal}</span>
          </Link>
        )}

        {/* Vertical Divider */}
        <div className="h-6 w-[2px] bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0" />

        {/* Staff User Identity & Control */}
        <div
          onClick={() => setShowPasswordModal(true)}
          className="flex flex-col items-end leading-none cursor-pointer group select-none"
          title="Click to Change Password"
        >
          <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white truncate max-w-[75px] xs:max-w-[100px] sm:max-w-[150px] md:max-w-[180px] group-hover:underline">
            {user?.fullName || user?.username}
          </span>
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-200 border border-slate-900 dark:border-slate-600">
            {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Cashier'}
          </span>
        </div>

        {/* Change Password Button (visible on tablet/laptop, on mobile accessible via clicking user profile) */}
        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          title="Change Account Password"
          className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-2 border-transparent hover:border-slate-900 dark:hover:border-slate-700 items-center justify-center cursor-pointer shrink-0"
          aria-label="Change Password"
        >
          <KeyRound className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          title="Sign Out"
          className="w-8 h-8 sm:w-9 sm:h-9 text-slate-800 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors border-2 border-transparent hover:border-rose-600 dark:hover:border-rose-900 flex items-center justify-center cursor-pointer shrink-0"
          aria-label="Log Out"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
        user={user}
      />
    </header>
  );
};

export default Header;
