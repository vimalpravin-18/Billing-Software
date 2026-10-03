import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, LayoutDashboard, Receipt, Menu, Package } from 'lucide-react';

const MobileNav = ({ onOpenMenu }) => {
  const { isAdmin } = useAuth();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111622]/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors select-none"
    >
      <NavLink
        to="/pos"
        className={({ isActive }) => `
          flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            isActive
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }
        `}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">POS</span>
      </NavLink>

      <NavLink
        to="/orders"
        className={({ isActive }) => `
          flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            isActive
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }
        `}
      >
        <Receipt className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] mt-0.5 tracking-tight">Bills</span>
      </NavLink>

      <NavLink
        to="/"
        end
        className={({ isActive }) => `
          flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            isActive
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }
        `}
      >
        <LayoutDashboard className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] mt-0.5 tracking-tight">Analytics</span>
      </NavLink>

      {isAdmin() && (
        <NavLink
          to="/products"
          className={({ isActive }) => `
            flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              isActive
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }
          `}
        >
          <Package className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Products</span>
        </NavLink>
      )}

      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
      </button>
    </nav>
  );
};

export default MobileNav;
