'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaListAlt, FaUsers } from 'react-icons/fa'; // Added FaListAlt

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-gray-800 text-white w-64 flex flex-col min-h-screen fixed top-0 left-0 h-full z-10 pt-16">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="p-4 border-b border-gray-700"
      >
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
      </motion.div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <motion.div
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link
            href="/admin"
            className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <div className="flex items-center">
              <FaHome className="mr-3" />
              Dashboard
            </div>
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link
            href="/admin/users"
            className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin/users') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <div className="flex items-center">
              <FaUsers className="mr-3" />
              User Management
            </div>
          </Link>
        </motion.div>
        {/* New link for Admin Category Summaries */}
        <motion.div
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link
            href="/admin/category-summary"
            className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin/category-summary') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <div className="flex items-center">
              <FaListAlt className="mr-3" />
              Category Summary
            </div>
          </Link>
        </motion.div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
