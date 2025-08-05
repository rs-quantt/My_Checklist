import Link from 'next/link';
import { FaHome, FaUsers, FaCog, FaList } from 'react-icons/fa'; // Example icons, you may need to install react-icons

const AdminSidebar: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white w-64 flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <Link href="/admin">
          <div className="flex items-center px-2 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition duration-200">
            <FaHome className="mr-3" />
            Dashboard
          </div>
        </Link>
        <Link href="/admin/users">
          <div className="flex items-center px-2 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition duration-200">
            <FaUsers className="mr-3" />
            User Management
          </div>
        </Link>
        <Link href="/admin/checklists">
          <div className="flex items-center px-2 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition duration-200">
            <FaList className="mr-3" />
            Checklist Management
          </div>
        </Link>
        <Link href="/studio">
          <div className="flex items-center px-2 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition duration-200">
            <FaCog className="mr-3" />
            Sanity Studio
          </div>
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
