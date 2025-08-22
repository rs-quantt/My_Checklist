'use client';

import CompletionCircle from '@/app/components/CompletionCircle'; // Import CompletionCircle
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useEffect, useState } from 'react';

interface CategorySummary {
  _id: string;
  title: string;
  totalChecklists: number;
  completedChecklists: number;
  completionPercentage: number;
  taskCode?: string;
  updatedAt: string; // Add updatedAt to the interface
}

interface GroupedCategorySummaries {
  [date: string]: CategorySummary[];
}

const CACHE_KEY = 'myCategorySummariesCache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function MyCategorySummaryPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter(); // Initialize router
  const [groupedCategorySummaries, setGroupedCategorySummaries] =
    useState<GroupedCategorySummaries>({});
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
          const groupedData = groupSummaries(data);
          setGroupedCategorySummaries(groupedData);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/my-category-summary?userId=${user.id}`,
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error: ${response.statusText} - ${errorData.error || 'Unknown'}`,
          );
        }
        const data: CategorySummary[] = await response.json();
        const groupedData = groupSummaries(data);
        setGroupedCategorySummaries(groupedData);
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() }),
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error(
          'MyCategorySummaryPage Debug: Fetch error:',
          errorMessage,
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategorySummaries();
  }, [isAuthenticated, user, authLoading]);

  const groupSummaries = (summaries: CategorySummary[]) => {
    // Group by date (YYYY-MM-DD) based on local time
    const grouped: GroupedCategorySummaries = {};
    summaries.forEach((summary) => {
      // Get the date string in the local timezone (e.g., "8/15/2025")
      const date = new Date(summary.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(summary);
    });
    return grouped;
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center mt-8">
        <p className="text-lg text-gray-700">
          Please log in to view your category summaries.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Sort dates in descending order
  const dates = Object.keys(groupedCategorySummaries).sort((a, b) => {
    const [monthA, dayA, yearA] = a.split('/').map(Number);
    const [monthB, dayB, yearB] = b.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  });

  const handleEditClick = (e: React.MouseEvent, summaryId: string) => {
    e.stopPropagation(); // Prevent parent Link from triggering
    e.preventDefault(); // Prevent default link behavior
    router.push(`/my-checklist?categorySummaryId=${summaryId}`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900">
            My Category Summary
          </h1>
          <p className="text-gray-600 mb-6 pt-2">
            Overview of your progress across different checklist categories.
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-gray-600 text-sm mb-2">
            <strong>Looking to create your own checklist?</strong>
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Link
              href="/my-checklist"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold !text-white shadow-md transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Create a new task
              <svg
                className="-mr-1 ml-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No category summaries found for your account.</p>
          <p className="mt-2">
            Start completing checklists to see your progress here!
          </p>
        </div>
      ) : (
        dates.map((date) => (
          <div key={date} className="mb-8 last:mb-0">
            <div className="bg-blue-50 rounded-md px-4 py-2 mb-4 border-l-4 border-blue-500 flex items-center justify-between shadow-sm">
              <h2 className="text-lg font-bold text-blue-800">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <span className="text-sm text-blue-900 font-medium">
                ({groupedCategorySummaries[date].length} Summaries)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedCategorySummaries[date].map((summary) => (
                <Link
                  key={summary._id}
                  href={`/my-category-summary/${summary._id}`}
                  className="block"
                >
                  <motion.div
                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 cursor-pointer flex flex-col h-full relative"
                    whileHover={{
                      translateY: -3,
                      boxShadow:
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      borderColor: '#3b82f6', // blue-500
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Edit icon at top right - Updated with specific hover background, more margin, and cursor pointer */}
                    <motion.button
                      className="absolute top-4 right-4 p-3 rounded-full bg-transparent text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer"
                      onClick={(e) => handleEditClick(e, summary._id)}
                      aria-label="Edit Checklist"
                      whileHover={{ backgroundColor: '#2b7fff', color: 'white' }} // Change to blue-500
                      whileTap={{ scale: 0.9, backgroundColor: '#bfdbfe' }} // blue-200
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </motion.button>

                    <h2 className="text-lg font-bold text-blue-700 mb-1 pr-8">
                      {summary.title}
                    </h2>
                    {summary.taskCode && (
                      <p className="text-gray-600 text-sm mb-1">
                        Task Code:{' '}
                        <span className="font-medium text-gray-700">
                          {summary.taskCode}
                        </span>
                      </p>
                    )}

                    {/* Horizontal layout for completion circle and details */}
                    <div className="flex items-center mt-3 mb-3">
                      <div className="flex-shrink-0 mr-4">
                        <CompletionCircle
                          percentage={summary.completionPercentage}
                        />
                      </div>
                      <div>
                        <p className="text-gray-700 text-sm">
                          Total Checklists:{' '}
                          <span className="font-semibold">
                            {summary.totalChecklists}
                          </span>
                        </p>
                        <p className="text-gray-700 text-sm">
                          Completed:{' '}
                          <span className="font-semibold">
                            {summary.completedChecklists}
                          </span>
                        </p>
                        <p className="text-sm font-semibold text-blue-700 mt-1">
                          {summary.completionPercentage.toFixed(0)}% Complete
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-auto text-right">
                      Last Updated:{' '}
                      {new Date(summary.updatedAt).toLocaleDateString()}{' '}
                      {new Date(summary.updatedAt).toLocaleTimeString()}
                    </p>

                    {/* Removed the old button */}
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