'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BackButton from '@/app/components/BackButton';
import { AdminCategoryListItem } from '@/services/categoryService';

interface GroupedAdminCategorySummaries {
  [date: string]: AdminCategoryListItem[];
}

export default function AdminCategorySummaryPage() {
  const [groupedCategorySummaries, setGroupedCategorySummaries] = useState<GroupedAdminCategorySummaries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategorySummaries() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/category-summaries`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error: ${response.statusText} - ${errorData.error || 'Unknown'}`);
        }
        const data: AdminCategoryListItem[] = await response.json();
        const groupedData = groupSummaries(data);
        setGroupedCategorySummaries(groupedData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error("AdminCategorySummaryPage Debug: Fetch error:", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCategorySummaries();
  }, []);

  const groupSummaries = (summaries: AdminCategoryListItem[]) => {
    const grouped: GroupedAdminCategorySummaries = {};
    summaries.forEach(summary => {
      const date = new Date(summary.updatedAt).toISOString().split('T')[0]; // Get YYYY-MM-DD
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(summary);
    });
    return grouped;
  };

  if (loading) {
    return <LoadingSpinner text="Loading all category summaries..." />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  const dates = Object.keys(groupedCategorySummaries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-2">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900">All Category Summaries</h1>
        <div className="w-10"></div> {/* Placeholder to balance BackButton */}
      </div>
      <p className="text-gray-600 mb-6">View and manage all category completion summaries across all users, grouped by their last update date.</p>

      {dates.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No category summaries found.</p>
        </div>
      ) : (
        dates.map(date => (
          <div key={date} className="mb-8 last:mb-0">
            <div className="bg-blue-50 rounded-md px-4 py-2 mb-4 border-l-4 border-blue-500 flex items-center justify-between shadow-sm">
              <h2 className="text-lg font-bold text-blue-800">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <span className="text-sm text-blue-600 font-medium">
                ({groupedCategorySummaries[date].length} Summaries)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedCategorySummaries[date].map((summary) => (
                <Link
                  key={summary._id}
                  href={`/admin/category-summary/${summary._id}`}
                  className="block"
                >
                  <motion.div
                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 cursor-pointer"
                    whileHover={{
                      translateY: -3,
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      borderColor: "#3b82f6" // blue-500
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-lg font-bold text-blue-700 mb-1">{summary.title}</h2>
                    <p className="text-gray-600 text-sm mb-1">User: <span className="font-medium text-gray-700">{summary.userName}</span></p>
                    {summary.taskCode && (
                      <p className="text-gray-600 text-sm mb-1">Task Code: <span className="font-medium text-gray-700">{summary.taskCode}</span></p>
                    )}
                    <p className="text-gray-700 text-sm">Total Checklists: <span className="font-semibold">{summary.totalChecklists}</span></p>
                    <p className="text-gray-700 text-sm mb-3">Completed: <span className="font-semibold">{summary.completedChecklists}</span></p>
                    <div className="mt-auto bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${summary.completionPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-semibold text-blue-700 mt-1">{summary.completionPercentage.toFixed(0)}% Complete</p>
                    <p className="text-xs text-gray-500 mt-1">Last Updated: {new Date(summary.updatedAt).toLocaleString()}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
