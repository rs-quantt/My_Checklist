'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import PaginationControls from '@/app/components/PaginationControls';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import ButtonLoadingSpinner from '@/app/components/ButtonLoadingSpinner';
import Avatar from '@/app/components/Avatar';

const ITEMS_PER_PAGE = 10;

interface User {
  _id: string;
  name: string;
  email: string;
  _createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
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

        const [usersResponse, countResponse] = await Promise.all([
          fetch(`/api/users?${params.toString()}`),
          fetch(`/api/users/count?${params.toString()}`),
        ]);

        if (!usersResponse.ok || !countResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const usersData = await usersResponse.json();
        const countData = await countResponse.json();

        setUsers(usersData);
        setTotalCount(countData.count);
      } catch (err: unknown) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    };

    fetchUserData();
  }, [currentPage, submittedSearchQuery]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getLocalDate = (utcDate: string) => {
    const date = new Date(utcDate);
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: clientTimeZone,
    });
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

  if (isLoading) {
    return <LoadingSpinner text="Loading user data..." />;
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
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <Link href="/admin/users/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <PlusIcon className="mr-2 h-5 w-5" /> Add New User
            </button>
          </Link>
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
              placeholder="Search by name or email..."
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

        {users.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-10">
            {submittedSearchQuery
              ? 'No users found for your search.'
              : 'No user data available.'}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
                All Users
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
                      >
                        Date Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Avatar name={user.name} />
                            </div>
                            <div className="ml-4">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getLocalDate(user._createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
