'use client';

import Link from 'next/link';
import { FaHome, FaUsers, FaClipboardList } from 'react-icons/fa'; // Example icons, you may need to install react-icons
import { usePathname } from 'next/navigation';

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-gray-800 text-white w-64 flex flex-col min-h-screen fixed top-0 left-0 h-full z-10 pt-16"> {/* Added pt-16 for padding-top */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <Link
          href="/admin"
          className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
          <div className="flex items-center">
            <FaHome className="mr-3" />
            Dashboard
          </div>
        </Link>
        <Link
          href="/admin/users"
          className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin/users') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
          <div className="flex items-center">
            <FaUsers className="mr-3" />
            User Management
          </div>
        </Link>
        <Link
          href="/admin/checklists"
          className={`flex items-center px-2 py-2 rounded-md transition duration-200 ${isActive('/admin/checklists') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
          <div className="flex items-center">
            <FaClipboardList className="mr-3" />
            Checklist Summary
          </div>
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
