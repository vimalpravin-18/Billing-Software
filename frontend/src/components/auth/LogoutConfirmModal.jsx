import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, user }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl transition-all scale-100 select-none relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Center Rose Icon Emblem */}
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <LogOut className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Modal Heading & Description */}
        <div className="text-center">
          <h3 id="logout-modal-title" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
            Confirm Sign Out
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
            Are you sure you want to end your cashier or admin session?
          </p>
        </div>

        {/* Active User Information Box */}
        <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-950 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center text-white text-xs font-black shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block leading-tight truncate">
                {user?.fullName || user?.username || 'Staff User'}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold block truncate">
                @{user?.username || 'user'}
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-600 shrink-0 ml-2">
            {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Cashier'}
          </span>
        </div>

        {/* Action Buttons: Cancel and Log Out */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer text-center active:scale-95 shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl border-2 border-rose-600 dark:border-rose-500 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black transition-all cursor-pointer text-center active:scale-95 shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
