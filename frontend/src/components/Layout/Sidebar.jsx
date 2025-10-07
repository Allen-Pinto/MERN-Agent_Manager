import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiUsers, FiUpload, FiHome, FiMenu, FiX, FiChevronRight } from 'react-icons/fi';

const Sidebar = ({ collapsed = false, onToggle }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'bg-primary text-white' : 'text-secondary hover:text-primary';

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/agents', icon: FiUsers, label: 'Agents' },
    { path: '/leads', icon: FiUpload, label: 'Leads' },
  ];

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  // Sidebar width classes
  const sidebarWidth = collapsed ? 'w-16' : 'w-64';
  const navPadding = collapsed ? 'px-2' : 'px-4';
  const itemPadding = collapsed ? 'p-2 justify-center' : 'p-3 space-x-3';
  const showLabels = !collapsed;
  const showChevron = collapsed && !isMobileOpen;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white shadow-lg border-r border-borderLight
          transform transition-transform duration-300 ease-in-out
          ${sidebarWidth}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${collapsed ? 'md:-translate-x-full md:hover:translate-x-0' : ''}  // Desktop: Hidden by default, hover to show (or toggle via prop)
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-borderLight">
          {showLabels ? (
            <h2 className="text-xl font-semibold text-textDark">Menu</h2>
          ) : (
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <FiMenu className="w-4 h-4 text-white" />
            </div>
          )}
          <button onClick={toggleMobile} className="md:hidden">
            <FiX className="w-6 h-6 text-secondary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`mt-6 ${navPadding} space-y-2`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center ${itemPadding} rounded-lg font-medium transition-colors
                  ${isActive(item.path)}
                `}
                onClick={closeMobile}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {showLabels && <span className="whitespace-nowrap">{item.label}</span>}
                {showChevron && <FiChevronRight className="w-4 h-4 ml-auto text-secondary" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
