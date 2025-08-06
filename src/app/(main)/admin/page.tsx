'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaChartBar, FaUsers, FaClipboardList } from 'react-icons/fa';

interface Counts {
  userCount: number | null;
  checklistCount: number | null;
}

const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = useState<Counts>({
    userCount: null,
    checklistCount: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const userResponse = await fetch('/api/users/count');
        const checklistResponse = await fetch('/api/checklists/count');

        if (!userResponse.ok || !checklistResponse.ok) {
          throw new Error('Failed to fetch counts');
        }

        const userData = await userResponse.json();
        const checklistData = await checklistResponse.json();

        setCounts({
          userCount: userData.count,
          checklistCount: checklistData.count,
        });
      } catch (err: unknown) {
        console.error('Error fetching counts for admin dashboard:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setCounts({ userCount: 0, checklistCount: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner text="Loading Admin Dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Failed to load data: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <FaChartBar className="text-blue-600 text-4xl" />
        </div>
      </div>

      {/* Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
          {/* Card: Users */}
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-blue-800 mb-2">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {counts.userCount}
              </p>
            </div>
            <FaUsers className="text-blue-600 text-4xl opacity-75" />
          </div>

          {/* Card: Checklists */}
          <div className="bg-green-50 border-l-4 border-green-600 rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-green-800 mb-2">
                Total Checklists
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {counts.checklistCount}
              </p>
            </div>
            <FaClipboardList className="text-green-600 text-4xl opacity-75" />
          </div>
        </div>
      </div>

      {/* System Management */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
          System Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <Link
            href="/admin/users"
            className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out"
          >
            <FaUsers className="text-gray-600 text-3xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                User Management
              </h2>
              <p className="text-gray-600 text-sm">
                View, add, edit, and delete user information.
              </p>
            </div>
          </Link>

          {/* Checklist Management */}
          <Link
            href="/admin/checklists"
            className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out"
          >
            <FaClipboardList className="text-gray-600 text-3xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                Checklist Management
              </h2>
              <p className="text-gray-600 text-sm">
                Manage checklists and checklist items.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
