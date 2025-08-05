'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { User } from '@/types/user';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      console.error('Failed to fetch users:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load users. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error(`Error creating user: ${response.statusText}`);
      }
      setNewUser({ name: '', email: '' });
      const createdUser: User = await response.json();
      // Update the users state with the newly created user
      setUsers((prevUsers) => [...prevUsers, createdUser]);
      // No need to call fetchUsers() as we updated the state directly
      // fetchUsers();
    } catch (err: unknown) {
      console.error('Failed to create user:', err);
      // Optionally set an error state to display a message to the user
      // setError(err instanceof Error ? err.message : 'Failed to create user. Please try again.');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting user: ${response.statusText}`);
      }
      // Update the users state by filtering out the deleted user
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      // No need to call fetchUsers() as we updated the state directly
    } catch (err: unknown) {
      console.error('Failed to delete user:', err);
      // Optionally set an error state to display a message to the user
      // setError(err instanceof Error ? err.message : 'Failed to delete user. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải danh sách users ..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-3xl text-red-600">
        <FaTimes className="text-red-500 mr-2 text-6xl mb-3" /> Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-4 lg:px-8 xl:px-16">
      <div className="container mx-auto max-w-4xl bg-white text-gray-800 rounded-lg shadow-sm p-4 md:p-6 space-y-6 border border-gray-200">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4 text-center">
          User Management
        </h1>

        <div className="mb-6 p-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-lg font-bold mb-3">Add New User</h2>
          <form
            onSubmit={handleCreateUser}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              aria-label="User Name"
              type="text"
              placeholder="User Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              required
            />
            <input
              aria-label="User Email"
              type="email"
              placeholder="User Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAddingUser || !newUser.name || !newUser.email}
            >
              <FaPlus className="mr-2" />{' '}
              {isAddingUser ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-3">Existing Users</h2>
          {users.length === 0 ? (
            <p className="text-center text-gray-500">
              No users found. Add a new user above!
            </p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user._id}
                  className="flex justify-between items-center p-2 border border-gray-200 rounded-lg bg-white shadow-sm text-sm"
                >
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                  >
                    <FaTrash className="text-base" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
