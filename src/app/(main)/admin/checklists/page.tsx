'use client';

import ButtonLoadingSpinner from '@/app/components/ButtonLoadingSpinner';
import CompletionCircle from '@/app/components/CompletionCircle';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; // useMemo might be removed if data is pre-grouped

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

export default function ChecklistsSummaryPage() {
  const router = useRouter();
  // Change state type to hold grouped summaries
  const [groupedSummaries, setGroupedSummaries] = useState<
    GroupedChecklistSummary[]
  >([]);
  // const [totalCount, setTotalCount] = useState(0); // No longer directly used for flat pagination
  // const [currentPage, setCurrentPage] = useState(1); // No longer directly used for flat pagination
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');

  useEffect(() => {
    const fetchGroupedChecklistData = async () => {
      if (submittedSearchQuery) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        if (submittedSearchQuery) {
          params.append('search', submittedSearchQuery);
        }

        // Call the new grouped API route
        const response = await fetch(
          `/api/admin/grouped-checklists-summary?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch grouped checklist data: ${response.status} ${response.statusText}`,
          );
        }

        const data: GroupedChecklistSummary[] = await response.json();
        setGroupedSummaries(data);
      } catch (err: unknown) {
        console.error('Error fetching grouped checklist summary data:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    };

    fetchGroupedChecklistData();
  }, [submittedSearchQuery]); // Dependency only on search query for re-fetch

  // totalPages and handlePageChange will be removed as flat pagination is not directly applicable
  // For now, I'll remove these. If pagination is still desired, it would need a different approach (e.g., pagination within categories or task code groups).
  // const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  // const handlePageChange = (newPage: number) => {
  //   if (newPage > 0 && newPage <= totalPages) {
  //     setCurrentPage(newPage);
  //   }
  // };

  const handleSearch = () => {
    // setCurrentPage(1); // No longer needed
    setSubmittedSearchQuery(searchQuery);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading grouped checklist summary data..." />;
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Checklist Summary
          </h1>
        </div>

        <div className="flex items-center space-x-2 mb-8 max-w-lg">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by task code..."
              className="block w-full h-10 rounded-md border-gray-300 bg-white pl-10 pr-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="inline-flex h-10 w-32 items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSearching ? (
              <ButtonLoadingSpinner />
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {groupedSummaries.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-10">
            {submittedSearchQuery
              ? 'No checklists found for the entered task code.'
              : 'No checklist summary data available.'}
          </div>
        ) : (
          <div className="space-y-8">
            {groupedSummaries.map((categoryGroup) => (
              <div
                key={categoryGroup.categoryId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b pb-3">
                  Category: {categoryGroup.categoryTitle}
                </h2>

                {categoryGroup.taskCodeGroups.map((taskGroup) => (
                  <div key={taskGroup.taskCode} className="mb-8 last:mb-0">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 pl-4 border-l-4 border-blue-500">
                      Task Code: {taskGroup.taskCode}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <colgroup>
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '25%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '15%' }} />
                        </colgroup>
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
                              Checklist Title
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
                            <tr
                              key={summary._id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() =>
                                router.push(`/admin/checklists/${summary._id}`)
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {summary.user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {summary.checklist.title}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
