'use client';

import CompletionCircle from '@/app/components/CompletionCircle'; // Import CompletionCircle
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { AdminCategoryListItem } from '@/services/categoryService';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Import AnimatePresence
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'; // Import icons

interface GroupedAdminCategorySummaries {
  [date: string]: AdminCategoryListItem[];
}

export default function AdminCategorySummaryPage() {
  const [groupedCategorySummaries, setGroupedCategorySummaries] = useState<GroupedAdminCategorySummaries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to manage expanded dates, initially all expanded
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

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
        // Initially expand all dates
        setExpandedDates(new Set(Object.keys(groupedData)));
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
      // Get the date string in the local timezone (e.g., "8/15/2025")
      const date = new Date(summary.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(summary);
    });
    return grouped;
  };

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading all category summaries..." />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  // Sort dates in descending order
  const dates = Object.keys(groupedCategorySummaries).sort((a, b) => {
    const [monthA, dayA, yearA] = a.split('/').map(Number);
    const [monthB, dayB, yearB] = b.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: {
        staggerChildren: 0.05 // Stagger the children cards for a nice entry effect
      }
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-900">All Category Summaries</h1> {/* Accent color for main title */}
      </div>
      <p className="text-gray-600 mb-6">View and manage all category completion summaries across all users, grouped by their last update date.</p>

      {dates.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No category summaries found.</p>
        </div>
      ) : (
        dates.map(date => {
          const isExpanded = expandedDates.has(date);
          return (
            <div key={date} className="mb-4 last:mb-0 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleDateExpansion(date)}
                className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-200"
              > {/* Accent color for accordion header background, hover, and focus ring */}
                <div className="flex items-center">
                  <h2 className="text-lg font-bold text-blue-800 mr-2"> {/* Accent color for date header text */}
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h2>
                  <span className="text-sm text-blue-600 font-medium"> {/* Accent color for summary count */}
                    ({groupedCategorySummaries[date].length} Summaries)
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="h-5 w-5 text-blue-500" /> {/* Accent color for chevron icon */}
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="content"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={containerVariants}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
                  >
                    {groupedCategorySummaries[date].map((summary) => (
                      <motion.div key={summary._id} variants={itemVariants}>
                        <Link
                          href={`/admin/category-summary/${summary._id}`}
                          className="block"
                        >
                          <motion.div
                            className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 cursor-pointer flex flex-col h-full hover:border-indigo-500"
                            whileHover={{
                              translateY: -2,
                              boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <h3 className="text-md font-semibold text-blue-900 mb-1 leading-tight">{summary.title}</h3> {/* Accent color for card title */}
                            <p className="text-gray-600 text-xs mb-1">User: <span className="font-medium text-gray-700">{summary.userName}</span></p>
                            {summary.taskCode && (
                              <p className="text-gray-600 text-xs mb-1">Task Code: <span className="font-medium text-gray-700">{summary.taskCode}</span></p>
                            )}
                            
                            <div className="flex items-center mt-2 mb-2">
                              <div className="flex-shrink-0 mr-3">
                                <CompletionCircle percentage={summary.completionPercentage} />
                              </div>
                              <div>
                                <p className="text-gray-700 text-xs">Total: <span className="font-semibold">{summary.totalChecklists}</span></p>
                                <p className="text-gray-700 text-xs">Completed: <span className="font-semibold">{summary.completedChecklists}</span></p>
                                <p className="text-xs font-semibold text-blue-900 mt-1">{summary.completionPercentage.toFixed(0)}% Complete</p> {/* Accent color for completion percentage */}
                              </div>
                            </div>

                            <p className="text-right text-xs text-gray-500 mt-auto">Updated: {new Date(summary.updatedAt).toLocaleDateString()} {new Date(summary.updatedAt).toLocaleTimeString()}</p>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
}
