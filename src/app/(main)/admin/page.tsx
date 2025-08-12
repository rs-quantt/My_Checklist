'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaChartBar, FaUsers, FaClipboardList } from 'react-icons/fa';
import ChecklistPieChart from './components/ChecklistPieChart';
import { motion, Variants } from 'framer-motion';

interface Counts {
  userCount: number | null;
  checklistCount: number | null;
}

interface DistributionDataItem {
  name: string;
  value: number;
}

const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = useState<Counts>({
    userCount: null,
    checklistCount: null,
  });
  const [distributionData, setDistributionData] = useState<
    DistributionDataItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [userResponse, distributionResponse, checklistCountResponse] =
          await Promise.all([
            fetch('/api/users/count'),
            fetch('/api/checklists-summary/distribution'),
            fetch('/api/checklists-summary/count'),
          ]);

        if (
          !userResponse.ok ||
          !distributionResponse.ok ||
          !checklistCountResponse.ok
        ) {
          throw new Error('Failed to fetch all admin data');
        }

        const userData = await userResponse.json();
        const distributionData = await distributionResponse.json();
        const checklistCountData = await checklistCountResponse.json();

        setCounts({
          userCount: userData.count,
          checklistCount: checklistCountData.count,
        });
        setDistributionData(distributionData);
      } catch (err: unknown) {
        console.error('Error fetching data for admin dashboard:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setCounts({ userCount: 0, checklistCount: 0 });
        setDistributionData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <FaChartBar className="text-blue-600 text-4xl" />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 pb-3 border-b border-gray-200">
          Overview
        </h2>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 pr-50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stat Cards Column */}
          <div className="flex flex-col gap-8">
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 flex items-center justify-between border border-blue-100 transform transition-transform duration-300 hover:scale-105"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Users
                </h3>
                <p className="text-4xl font-extrabold text-blue-600 mt-2">
                  {counts.userCount}
                </p>
              </div>
              <FaUsers className="text-blue-300 text-5xl" />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 flex items-center justify-between border border-green-100 transform transition-transform duration-300 hover:scale-105"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Completed Checklists
                </h3>
                <p className="text-4xl font-extrabold text-green-600 mt-2">
                  {counts.checklistCount}
                </p>
              </div>
              <FaClipboardList className="text-green-300 text-5xl" />
            </motion.div>
          </div>

          {/* Pie Chart Card */}
          <motion.div variants={itemVariants}>
            <ChecklistPieChart data={distributionData} />
          </motion.div>
        </motion.div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 pb-3 border-b border-gray-200">
          System Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/users"
            className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow hover:shadow-xl transition duration-300 ease-in-out border border-gray-200"
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

          <Link
            href="/admin/checklists"
            className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow hover:shadow-xl transition duration-300 ease-in-out border border-gray-200"
          >
            <FaClipboardList className="text-gray-600 text-3xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                Checklist Summary
              </h2>
              <p className="text-gray-600 text-sm">
                View summary of completed checklists.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
