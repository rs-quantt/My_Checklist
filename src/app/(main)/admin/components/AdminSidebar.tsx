'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FaHome, FaListAlt, FaUsers, FaBars } from 'react-icons/fa'; // Added FaBars icon

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true); // State to manage collapse/expand

  const isActive = (path: string) => pathname === path;

  const sidebarVariants: Variants = {
    expanded: { width: 256, transition: { type: 'spring', stiffness: 50, damping: 15 } }, // Adjusted stiffness and damping
    collapsed: { width: 80, transition: { type: 'spring', stiffness: 50, damping: 15 } }, // Adjusted stiffness and damping
  };

  const itemTextVariants: Variants = {
    expanded: { opacity: 1, x: 0, display: 'block', transition: { duration: 0.2 } }, // Added duration
    collapsed: { opacity: 0, x: -20, transition: { duration: 0.2 }, transitionEnd: { display: 'none' } }, // Added duration and transitionEnd
  };

  return (
    <motion.div
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className="bg-gray-800 text-white flex flex-col min-h-screen fixed top-0 left-0 h-full z-10 pt-16 shadow-lg"
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="p-4 border-b border-gray-700 overflow-hidden flex items-center"
      >
        {/* Fixed width and height container for the title icon */}
        <div className="w-8 h-8 flex justify-center items-center flex-shrink-0">
          <FaBars className="text-2xl" />
        </div>
        <motion.span
          variants={itemTextVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          className={isCollapsed ? 'sr-only' : 'text-2xl font-semibold whitespace-nowrap leading-8'} // Added leading-8 to explicitly set line-height
        >
          Admin Panel
        </motion.span>
      </motion.div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <motion.div
          whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link
            href="/admin"
            className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            {/* Fixed width and height container for the icon */}
            <div className="w-8 h-8 flex justify-center items-center flex-shrink-0">
              <FaHome />
            </div>
            <motion.span
              variants={itemTextVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className={isCollapsed ? 'sr-only' : 'whitespace-nowrap leading-8'} // Added leading-8
            >
              Dashboard
            </motion.span>
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link
            href="/admin/users"
            className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin/users') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            {/* Fixed width and height container for the icon */}
            <div className="w-8 h-8 flex justify-center items-center flex-shrink-0">
              <FaUsers />
            </div>
            <motion.span
              variants={itemTextVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className={isCollapsed ? 'sr-only' : 'whitespace-nowrap leading-8'}
            >
              User Management
            </motion.span>
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link
            href="/admin/category-summary"
            className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin/category-summary') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            {/* Fixed width and height container for the icon */}
            <div className="w-8 h-8 flex justify-center items-center flex-shrink-0">
              <FaListAlt />
            </div>
            <motion.span
              variants={itemTextVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className={isCollapsed ? 'sr-only' : 'whitespace-nowrap leading-8'}
            >
              Category Summary
            </motion.span>
          </Link>
        </motion.div>
      </nav>
    </motion.div>
  );
};

export default AdminSidebar;
