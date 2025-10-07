import React from 'react';
import { logout } from '../../utils/auth';
import { FiLogOut, FiMenu } from 'react-icons/fi';

const Header = ({ onSidebarToggle }) => (
  <header className="bg-white shadow-sm border-b border-borderLight px-6 py-4 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <button
        onClick={onSidebarToggle}
        className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-gray-100 transition-colors md:hidden"  // Mobile: Always show
      >
        <FiMenu className="w-6 h-6" />
      </button>
      {/* Desktop Toggle: Hidden on mobile, but can be styled as a collapse button */}
      <button
        onClick={onSidebarToggle}
        className="hidden md:flex p-2 text-secondary hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FiMenu className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-semibold text-textDark">Agent Manager Dashboard</h1>
    </div>
    
    <button
      onClick={logout}
      className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors"
    >
      <FiLogOut />
      <span>Logout</span>
    </button>
  </header>
);

export default Header;
