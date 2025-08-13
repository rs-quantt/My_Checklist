'use client';

import Avatar from '@/app/components/Avatar';
import ButtonLoadingSpinner from '@/app/components/ButtonLoadingSpinner';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import PaginationControls from '@/app/components/PaginationControls';
import { User } from '@/types/user'; // Import the User type
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

const ITEMS_PER_PAGE = 5; // Changed to 5

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [adminCode, setAdminCode] = useState<string[]>(Array(6).fill(''));
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    currentRole: 'admin' | 'user';
  } | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

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

        const usersData: User[] = await usersResponse.json();
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

  const handleToggleClick = (userId: string, currentRole: 'admin' | 'user') => {
    setSelectedUser({ id: userId, currentRole: currentRole });
    setShowCodeModal(true);
    setAdminCode(Array(6).fill('')); // Reset code when opening modal
    // Focus on the first input when the modal opens
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleAdminCodeChange = (index: number, value: string) => {
    const newAdminCode = [...adminCode];
    // Only allow single digit and numbers
    const digit = value.replace(/[^0-9]/g, '');
    newAdminCode[index] = digit.slice(-1); // Take only the last entered digit
    setAdminCode(newAdminCode);

    // Auto-focus to the next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (value === '' && index > 0) {
      // Allow backspace to clear and move to previous input
      inputRefs.current[index - 1]?.focus();
    }
  };

  const confirmToggleAdminStatus = async () => {
    if (!selectedUser) return;

    const fullAdminCode = adminCode.join('');
    if (fullAdminCode.length !== 6) {
      alert('Please enter a 6-digit code.');
      return;
    }

    const { id: userId, currentRole } = selectedUser;
    const newIsAdmin = currentRole === 'user'; // If current role is user, new will be admin

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAdmin: newIsAdmin,
          adminCode: fullAdminCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update admin status');
      }

      setUsers(
        users.map((user) =>
          user._id === userId
            ? {
                ...user,
                role: newIsAdmin ? 'admin' : 'user',
              }
            : user,
        ),
      );
      setShowCodeModal(false);
      setAdminCode(Array(6).fill(''));
      setSelectedUser(null);
    } catch (err: unknown) {
      console.error('Error toggling admin status:', err);
      alert(
        err instanceof Error ? err.message : 'Failed to update admin status.',
      );
    }
  };

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
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
                      ></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Avatar
                                src={user.image}
                                name={user.name}
                                alt={user.name}
                              />
                            </div>
                            <div className="ml-4 flex items-center">
                              {user.name}
                              {user.role === 'admin' && (
                                <AcademicCapIcon className="ml-2 h-5 w-5 text-yellow-500" />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getLocalDate(user._createdAt ?? '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            {status === 'authenticated' &&
                            session?.user?.id !== user._id && (
                              <button
                                onClick={() =>
                                  handleToggleClick(user._id, user.role)
                                }
                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  user.role === 'admin'
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                                type="button"
                              >
                                {user.role === 'admin'
                                  ? 'Revoke Authority'
                                  : 'Grant Authority'}
                              </button>
                            )}
                          </div>
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

      {showCodeModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Enter Authorization Code</h3>
            <p className="mb-4">
              Please enter the 6-digit code to{' '}
              {selectedUser.currentRole === 'admin' ? 'revoke' : 'grant'} authority.
            </p>
            <div className="flex justify-center space-x-2 mb-4">
              {adminCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleAdminCodeChange(index, e.target.value)}
                  onFocus={(e) => e.target.select()} // Select text on focus
                  className="w-10 h-10 text-xl font-bold text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                />
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setAdminCode(Array(6).fill(''));
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleAdminStatus}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={adminCode.join('').length !== 6}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
