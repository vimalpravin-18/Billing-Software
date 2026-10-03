import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isPosRoute = location.pathname === '/pos';

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden transition-colors duration-150">
      {/* Fixed Header */}
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Main Workspace Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Stationary Fixed Sidebar */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Content Viewport: 100% full-bleed on POS counter, comfortably padded on management pages */}
        <main
          className={`flex-1 min-w-0 min-h-0 bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-150 ${
            isPosRoute
              ? 'p-0 overflow-hidden pb-14 md:pb-0'
              : 'overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 pb-20 md:pb-6'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileNav onOpenMenu={() => setMobileMenuOpen(true)} />
    </div>
  );
};

export default Layout;
