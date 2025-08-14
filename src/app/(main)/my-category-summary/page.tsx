"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CategorySummary {
  _id: string;
  title: string;
  totalChecklists: number;
  completedChecklists: number;
  completionPercentage: number;
  taskCode?: string;
}

const CACHE_KEY = 'myCategorySummariesCache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function MyCategorySummaryPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategorySummaries() {
      if (authLoading || !isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setCategorySummaries(data);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/my-category-summary?userId=${user.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error: ${response.statusText} - ${errorData.error || 'Unknown'}`);
        }
        const data = await response.json();
        setCategorySummaries(data);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error("MyCategorySummaryPage Debug: Fetch error:", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCategorySummaries();
  }, [isAuthenticated, user, authLoading]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center mt-8">
        <p className="text-lg text-gray-700">Please log in to view your category summaries.</p>
        <Link href="/login" className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Category Summaries</h1>

      {categorySummaries.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No category summaries found for your account.</p>
          <p className="mt-2">Start completing checklists to see your progress here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorySummaries.map((summary) => (
            <Link
              key={summary._id}
              href={`/my-category-summary/${summary._id}`}
              className="block"
            >
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer"
                whileHover={{ translateY: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-2">{summary.title}</h2>
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