'use client';

import { useEffect, useState } from 'react';
import {
  FaPlus,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPaperPlane,
  FaTrash,
  FaPencilAlt,
} from 'react-icons/fa';
import { User } from '@/types/user';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Avatar from '@/app/components/Avatar';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: { name: string; email: string }) => Promise<void>;
  isProcessing: boolean;
  userToEdit?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
  userToEdit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isOpen && userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
    } else if (!isOpen) {
      setName('');
      setEmail('');
    }
  }, [isOpen, userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, email });
  };

  if (!isOpen) return null;

  const isEditMode = !!userToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl transform transition-all -translate-y-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={22} />
        </button>
        <div className="text-center mb-6">
          <div className="inline-block bg-blue-100 p-3 rounded-full mb-4">
            <FaUser className="text-blue-600" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit User' : 'Add a New User'}
          </h3>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? 'Update the details for the user.'
              : 'Enter the details below to create a new user profile.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition read-only:bg-gray-100 read-only:cursor-not-allowed"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={isEditMode}
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
              disabled={isProcessing || !name || !email}
            >
              {isProcessing ? (
                isEditMode ? 'Saving...' : 'Adding...'
              ) : (
                <>
                  <FaPaperPlane />
                  {isEditMode ? 'Save Changes' : 'Add User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  const handleCreateUser = async (userData: {
    name: string;
    email: string;
  }) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`Error creating user: ${response.statusText}`);
      }
      const createdUser: User = await response.json();
      setUsers((prevUsers) => [...prevUsers, createdUser]);
      closeModal();
    } catch (err: unknown) {
      console.error('Failed to create user:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateUser = async (userData: {
    name: string;
    email: string;
  }) => {
    if (!editingUser) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
      }
      const updatedUser: User = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user,
        ),
      );
      closeModal();
    } catch (err: unknown) {
      console.error('Failed to update user:', err);
    } finally {
      setIsProcessing(false);
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
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (err: unknown) {
      console.error('Failed to delete user:', err);
    }
  };

  const openModalToAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openModalToEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl py-10">
        <FaTimes className="text-red-500 mr-2 text-6xl mb-3" /> Error: {error}
      </div>
    );
  }
  return (
    <div className="relative min-h-screen">
      <LoadingOverlay isLoading={isProcessing} text="Processing..." />
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              User Management
            </h1>
            <button
              onClick={openModalToAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" /> Add New User
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Existing Users
            </h2>
            {users.length === 0 ? (
              <div className="text-center text-gray-500 text-xl py-10">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Avatar name={user.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => openModalToEdit(user)}
                              className="text-blue-400 hover:text-blue-500 p-3 rounded-full hover:bg-blue-100 transition-all"
                              aria-label={`Edit ${user.name}`}
                            >
                              <FaPencilAlt size={18} />
                            </button>
                            <div className="w-px h-5 bg-gray-200 mx-2"></div>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-400 hover:text-red-500 p-3 rounded-full hover:bg-red-100 transition-all"
                              aria-label={`Delete ${user.name}`}
                            >
                              <FaTrash size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <UserModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            isProcessing={isProcessing}
            userToEdit={editingUser}
          />
        </div>
      </div>
    </div>
  );
}
