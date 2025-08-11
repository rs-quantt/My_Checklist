'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import CompletionCircle from '@/app/components/CompletionCircle';
import PaginationControls from '@/app/components/PaginationControls';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ButtonLoadingSpinner from '@/app/components/ButtonLoadingSpinner';

const ITEMS_PER_PAGE = 5;

interface User {
  _id: string;
  name: string;
}

interface Checklist {
  _id: string;
  title: string;
}

interface Summary {
  _id: string;
  taskCode: string;
  totalItems: number;
  passedItems: number;
  user: User;
  checklist: Checklist;
  _updatedAt: string;
}

interface GroupedChecklistSummary {
  date: string;
  summaries: Summary[];
}

export default function ChecklistsSummaryPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');

  useEffect(() => {
    const fetchChecklistData = async () => {
      if (submittedSearchQuery) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const params = new URLSearchParams({
          offset: String(offset),
          limit: String(ITEMS_PER_PAGE),
        });
        if (submittedSearchQuery) {
          params.append('search', submittedSearchQuery);
        }

        const [summariesResponse, countResponse] = await Promise.all([
          fetch(`/api/checklists-summary?${params.toString()}`),
          fetch(`/api/checklists-summary/count?${params.toString()}`),
        ]);

        if (!summariesResponse.ok || !countResponse.ok) {
          throw new Error('Failed to fetch checklist data');
        }

        const summariesData = await summariesResponse.json();
        const countData = await countResponse.json();

        setSummaries(summariesData);
        setTotalCount(countData.count);
      } catch (err: unknown) {
        console.error('Error fetching checklist summary data:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    };

    fetchChecklistData();
  }, [currentPage, submittedSearchQuery]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const groupedSummaries = useMemo(() => {
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const grouped = summaries.reduce(
      (acc: Record<string, Summary[]>, summary: Summary) => {
        const localDate = new Date(summary._updatedAt).toLocaleDateString(
          'en-CA',
          { timeZone: clientTimeZone },
        );

        if (!acc[localDate]) {
          acc[localDate] = [];
        }
        acc[localDate].push(summary);
        return acc;
      },
      {},
    );

    return Object.entries(grouped)
      .map(([date, summaries]) => ({
        date,
        summaries,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [summaries]);

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

  const getGroupTitle = (utcDate: string) => {
    const date = new Date(utcDate);
    const adjustedDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12,
    );

    return `Date: ${adjustedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setSubmittedSearchQuery(searchQuery);
  };

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Checklist Summary
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
          <>
            <div className="space-y-8">
              {groupedSummaries.map((checklistGroup) => (
                <div
                  key={checklistGroup.date}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
                    {getGroupTitle(checklistGroup.date)}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <colgroup>
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '20%' }} />
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
                            Checklist
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
                              {summary.checklist.title}
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

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
