import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiFileText, 
  FiHelpCircle, 
  FiLayers,
  FiLogOut,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';


const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: FiHome },
    { path: '/summarizer', name: 'Summarizer', icon: FiFileText },
    { path: '/quiz', name: 'Quiz Generator', icon: FiHelpCircle },
    { path: '/flashcards', name: 'Flashcards', icon: FiLayers },
  ];

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  return (
    <motion.aside
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed lg:relative w-64 h-full bg-white shadow-xl z-20 flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
        >
          Study Assistant
        </motion.h1>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <FiX size={24} />
        </button>
      </div>

      <nav className="flex-1 py-6">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-6 py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="p-6 border-t">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center space-x-3 text-red-600 hover:text-red-700 w-full"
        >
          <FiLogOut size={20} />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
