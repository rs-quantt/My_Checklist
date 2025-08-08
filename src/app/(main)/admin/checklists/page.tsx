'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import CompletionCircle from '@/app/components/CompletionCircle';

interface User {
  _id: string;
  name: string;
}

interface Summary {
  _id: string;
  taskCode: string;
  totalItems: number;
  passedItems: number;
  user: User;
}

interface GroupedChecklistSummary {
  _id: string;
  title: string;
  summaries: Summary[];
}

export default function ChecklistsSummaryPage() {
  const [groupedSummaries, setGroupedSummaries] = useState<
    GroupedChecklistSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch('/api/checklists-summary');
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.statusText}`);
        }
        const data: GroupedChecklistSummary[] = await res.json();
        setGroupedSummaries(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        console.error('Error fetching checklist summary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  const filteredSummaries = groupedSummaries
    .map((group) => ({
      ...group,
      summaries: group.summaries.filter((summary) =>
        summary.taskCode.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((group) => group.summaries.length > 0);

  if (isLoading) {
    return <LoadingSpinner text="Loading checklist summary data..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl py-10">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Checklist Summary
        </h1>

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by task code..."
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-10">
            {searchQuery
              ? 'No checklists found for the entered task code.'
              : 'No checklist summary data available.'}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredSummaries.map((checklistGroup) => (
              <div
                key={checklistGroup._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  Checklist: {checklistGroup.title}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                          Task Code
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total Items
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Passed Items
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Completion Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {checklistGroup.summaries.map((summary) => (
                        <tr
                          key={summary._id}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <Link
                              href={`/admin/checklists/${summary._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {summary.user.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link
                              href={`/admin/checklists/${summary._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {summary.taskCode}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {summary.totalItems}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {summary.passedItems}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <CompletionCircle
                              percentage={
                                summary.totalItems > 0
                                  ? (summary.passedItems /
                                      summary.totalItems) *
                                    100
                                  : 0
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
