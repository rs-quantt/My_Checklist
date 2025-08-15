'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BackButton from '@/app/components/BackButton';
import { AdminCategoryListItem } from '@/services/categoryService'; // Import the new interface

export default function AdminCategorySummaryPage() {
  const [categorySummaries, setCategorySummaries] = useState<AdminCategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategorySummaries() {
      setLoading(true);
      setError(null);
      try {
        // Fetch data from the new API route for all individual category summaries
        const response = await fetch(`/api/admin/category-summaries`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error: ${response.statusText} - ${errorData.error || 'Unknown'}`);
        }
        const data = await response.json();
        setCategorySummaries(data);
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

  if (loading) {
    return <LoadingSpinner text="Loading all category summaries..." />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900">All Category Summaries</h1>
        <div className="w-10"></div> {/* Placeholder to balance BackButton */}
      </div>

      {categorySummaries.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No category summaries found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorySummaries.map((summary) => (
            <Link
              key={summary._id}
              href={`/admin/category-summary/${summary._id}`}
              className="block"
            >
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer"
                whileHover={{ translateY: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-2">{summary.title}</h2>
                <p className="text-gray-500 text-sm mb-1">User: <span className="font-medium">{summary.userName}</span></p>
                {summary.taskCode && (
                  <p className="text-gray-500 text-sm mb-2">Task Code: <span className="font-medium">{summary.taskCode}</span></p>
                )}
                <p className="text-gray-600">Total Checklists: <span className="font-medium">{summary.totalChecklists}</span></p>
                <p className="text-gray-600">Completed: <span className="font-medium">{summary.completedChecklists}</span></p>
                <div className="mt-4 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${summary.completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{summary.completionPercentage.toFixed(0)}% Complete</p>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
