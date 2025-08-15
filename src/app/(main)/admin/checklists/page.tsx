'use client';

import BackButton from '@/app/components/BackButton';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define types based on checklistSummaryService.ts
interface User {
  _id: string;
  name: string;
}

interface Checklist {
  _id: string;
  title: string;
  description?: string;
  category?: {
    // Category info is now nested
    _id: string;
    title: string;
  };
}

interface Summary {
  _id: string;
  taskCode: string;
  totalItems: number;
  passedItems: number;
  user: User;
  checklist: Checklist;
  updatedAt: string;
}

interface TaskCodeGroup {
  taskCode: string;
  summaries: Summary[];
}

interface GroupedChecklistSummary {
  categoryId: string;
  categoryTitle: string;
  taskCodeGroups: TaskCodeGroup[];
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function AdminChecklistsPage() {
  const router = useRouter();
  const [groupedSummaries, setGroupedSummaries] = useState<
    GroupedChecklistSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch(`/api/admin/grouped-checklists-summary`); // Call the new grouped API route for admin
        if (!res.ok) {
          throw new Error(
            `Failed to fetch grouped checklist summaries: ${res.status} ${res.statusText}`,
          );
        }
        const data: GroupedChecklistSummary[] = await res.json();
        setGroupedSummaries(data);
      } catch (err: unknown) {
        console.error('Error fetching grouped checklist summaries:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading all checklists..." />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  // Flatten the taskCodeGroups from all categories into a single array
  const allTaskCodeGroups: TaskCodeGroup[] = groupedSummaries.flatMap(
    (categoryGroup) => categoryGroup.taskCodeGroups
  );

  // Optionally, sort allTaskCodeGroups by taskCode if they are not already sorted consistently after flattening
  allTaskCodeGroups.sort((a, b) => a.taskCode.localeCompare(b.taskCode));

  return (
    <div className="antialiased bg-gray-50 min-h-screen relative">
      <div className="min-h-screen py-8 px-2 sm:px-4 lg:px-6">
        <motion.div
          className="container mx-auto max-w-5xl bg-white text-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-8 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <BackButton />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              All Saved Checklists
            </h1>
            <p className="mt-2 text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Here are all the checklists saved by all users, grouped by task code.
            </p>
          </div>

          {allTaskCodeGroups.length === 0 ? (
            <div className="text-center text-gray-600 py-10">
              <p className="text-lg">
                No checklists have been saved yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {allTaskCodeGroups.map((taskGroup) => (
                <div key={taskGroup.taskCode} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 border-b pb-3">
                    Task Code: {taskGroup.taskCode}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <colgroup>
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Checklist Title
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            User
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Last Updated
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Passed
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Completion
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {taskGroup.summaries.map((summary) => (
                          <motion.tr
                            key={summary._id}
                            variants={itemVariants}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() =>
                              router.push(
                                `/admin/checklists/${summary._id}`,
                              )
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {summary.checklist.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {summary.user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                summary.updatedAt,
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {summary.totalItems}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {summary.passedItems}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {summary.totalItems > 0
                                ? `${~~((summary.passedItems / summary.totalItems) * 100)}%`
                                : '0%'}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
