'use client';

import CompletionCircle from '@/app/components/CompletionCircle';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Import AnimatePresence
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa'; // Import FaInfoCircle
import { AdminCategoryListItem } from '@/services/categoryService'; // Import AdminCategoryListItem

interface GroupedCategorySummaries {
  [date: string]: AdminCategoryListItem[];
}

const CACHE_KEY = 'adminCategorySummariesCache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const itemVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function AdminCategorySummaryPage() {
  const router = useRouter();
  const [groupedCategorySummaries, setGroupedCategorySummaries] =
    useState<GroupedCategorySummaries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    async function fetchCategorySummaries() {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          const groupedData = groupSummaries(data);
          setGroupedCategorySummaries(groupedData);
          const initialExpandedState: Record<string, boolean> = {};
          Object.keys(groupedData).forEach((date) => {
            initialExpandedState[date] = true;
          });
          setExpandedDates(initialExpandedState);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/category-summaries');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error: ${response.statusText} - ${errorData.error || 'Unknown'}`,
          );
        }
        const data: AdminCategoryListItem[] = await response.json();
        const groupedData = groupSummaries(data);
        setGroupedCategorySummaries(groupedData);
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() }),
        );
        const initialExpandedState: Record<string, boolean> = {};
        Object.keys(groupedData).forEach((date) => {
          initialExpandedState[date] = true;
        });
        setExpandedDates(initialExpandedState);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error(
          'AdminCategorySummaryPage Debug: Fetch error:',
          errorMessage,
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategorySummaries();
  }, []);

  const groupSummaries = (summaries: AdminCategoryListItem[]) => {
    const grouped: GroupedCategorySummaries = {};
    summaries.forEach((summary) => {
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

  const toggleDateExpansion = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  const dates = Object.keys(groupedCategorySummaries).sort((a, b) => {
    const [monthA, dayA, yearA] = a.split('/').map(Number);
    const [monthB, dayB, yearB] = b.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-blue-900">
            Admin Category Summary
          </h1>
          <p className="text-gray-600 mb-6 pt-2">
            Overview of checklist progress across different categories for all
            users.
          </p>
        </div>
      </div>
      {dates.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No category summaries found.</p>
          <p className="mt-2">Check back later for user progress!</p>
        </div>
      ) : (
        dates.map((date) => (
          <div key={date} className="mb-8 last:mb-0">
            <div className="bg-white p-4 rounded-lg backdrop-blur-md">
              <div
                className="flex items-center justify-between cursor-pointer py-2"
                onClick={() => toggleDateExpansion(date)}
              >
                <h2 className="text-lg font-bold text-blue-900 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 mt-0.5 transform transition-transform ${expandedDates[date] ? 'rotate-90' : 'rotate-0'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {groupedCategorySummaries[date].length} Summaries
                </span>
              </div>
              <AnimatePresence>
                {expandedDates[date] && (
                  <motion.div
                    key={date}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mt-4 overflow-x-auto" // Added overflow for responsiveness
                  >
                    <table className="min-w-full divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="w-2/12 px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Title
                          </th>
                          <th
                            scope="col"
                            className="w-2/12 px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Task Code
                          </th>
                          <th
                            scope="col"
                            className="w-2/12 px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            User
                          </th>
                          <th
                            scope="col"
                            className="w-1/12 px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total
                          </th>
                          <th
                            scope="col"
                            className="w-1/12 px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Completed
                          </th>
                          <th
                            scope="col"
                            className="w-1/12 px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Completion
                          </th>
                          <th
                            scope="col"
                            className="w-2/12 px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Last Updated
                          </th>
                          <th
                            scope="col"
                            className="w-1/12 px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupedCategorySummaries[date].map((summary) => (
                          <tr
                            key={summary._id}
                            className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                          >
                            <td className="w-2/12 px-6 py-4 text-base font-medium text-blue-900 text-center">
                              <Link
                                href={`/admin/category-summary/${summary._id}`}
                                className="hover:underline"
                              >
                                {summary.title}
                              </Link>
                            </td>
                            <td className="w-2/12 px-6 py-4 text-base text-gray-700 text-center">
                              {summary.taskCode || 'N/A'}
                            </td>
                            <td className="w-2/12 px-6 py-4 text-base text-gray-700 text-center">
                              {summary.userName || 'N/A'}
                            </td>
                            <td className="w-1/12 px-6 py-4 text-base text-gray-700 text-center">
                              {summary.totalChecklists}
                            </td>
                            <td className="w-1/12 px-6 py-4 text-base text-gray-700 text-center">
                              {summary.completedChecklists}
                            </td>
                            <td className="w-1/12 px-6 py-4 text-base text-gray-700 text-center">
                              <div className="flex items-center justify-center">
                                <CompletionCircle
                                  percentage={summary.completionPercentage}
                                />
                              </div>
                            </td>
                            <td className="w-2/12 px-6 py-4 text-base text-gray-500 text-center">
                              {new Date(summary.updatedAt).toLocaleDateString()}{' '}
                              {new Date(summary.updatedAt).toLocaleTimeString()}
                            </td>
                            <td className="w-1/12 px-6 py-4 text-center text-base font-medium text-gray-500">
                              <Link
                                href={`/admin/category-summary/${summary._id}`}
                                className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 inline-flex items-center justify-center"
                                aria-label="View Details"
                              >
                                <FaInfoCircle className="h-5.5 w-5.5" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
