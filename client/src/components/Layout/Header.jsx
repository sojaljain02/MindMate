import React from 'react';
import { motion } from 'framer-motion';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiMenu size={24} />
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Student'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'student@example.com'}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0) || 'S'}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
