
'use client';

import CompletionCircle from '@/app/components/CompletionCircle';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Import AnimatePresence
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CategorySummary {
  _id: string;
  title: string;
  totalChecklists: number;
  completedChecklists: number;
  completionPercentage: number;
  taskCode?: string;
  updatedAt: string;
}

interface GroupedCategorySummaries {
  [date: string]: CategorySummary[];
}

const CACHE_KEY = 'adminCategorySummariesCache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const itemVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function AdminCategorySummaryPage() {
  const router = useRouter();
  const [groupedCategorySummaries, setGroupedCategorySummaries] =
    useState<GroupedCategorySummaries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchCategorySummaries() {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          const groupedData = groupSummaries(data);
          setGroupedCategorySummaries(groupedData);
          const initialExpandedState: Record<string, boolean> = {};
          Object.keys(groupedData).forEach(date => {
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
        const data: CategorySummary[] = await response.json();
        const groupedData = groupSummaries(data);
        setGroupedCategorySummaries(groupedData);
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() }),
        );
        const initialExpandedState: Record<string, boolean> = {};
        Object.keys(groupedData).forEach(date => {
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

  const groupSummaries = (summaries: CategorySummary[]) => {
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

  const handleEditClick = (e: React.MouseEvent, summaryId: string) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/admin/checklists?categorySummaryId=${summaryId}`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-blue-900">
            Admin Category Summary
          </h1>
          <p className="text-gray-600 mb-6 pt-2">
            Overview of checklist progress across different categories for all users.
          </p>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No category summaries found.</p>
          <p className="mt-2">
            Check back later for user progress!
          </p>
        </div>
      ) : (
        dates.map((date) => (
          <div key={date} className="mb-8 last:mb-0">
            <div className="bg-white p-4 rounded-lg backdrop-blur-md">
              <div
                className="flex items-center justify-between cursor-pointer"
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
                    key={date} // Key is important for AnimatePresence to track items
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {groupedCategorySummaries[date].map((summary) => (
                      <Link
                        key={summary._id}
                        href={`/admin/category-summary/${summary._id}`}
                        className="block"
                      >
                        <motion.div
                          className="bg-[#edf8ff] rounded-lg shadow-sm p-4 border border-gray-200 cursor-pointer flex flex-col h-full relative"
                          whileHover={{
                            translateY: -3,
                            boxShadow:
                              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderColor: '#3b82f6',
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.button
                            className="absolute top-4 right-4 p-3 rounded-full bg-transparent text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer"
                            onClick={(e) => handleEditClick(e, summary._id)}
                            aria-label="Edit Checklist"
                            whileHover={{ backgroundColor: '#1c398e', color: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
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
                              <path d="M18.5 2.5a2.121 2 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </motion.button>

                          <h2 className="text-lg font-bold text-blue-900 mb-1 pr-8">
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
                              <p className="text-sm font-semibold text-blue-900 mt-1">
                                {summary.completionPercentage.toFixed(0)}% Complete
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mt-auto text-right">
                            Last Updated:{' '}
                            {new Date(summary.updatedAt).toLocaleDateString()}{' '}
                            {new Date(summary.updatedAt).toLocaleTimeString()}
                          </p>
                        </motion.div>
                      </Link>
                    ))}
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
