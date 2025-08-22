'use client';
import { clearUserChecklistItems } from '@/services/adminService';
import {
    ArrowLeftEndOnRectangleIcon,
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    Cog6ToothIcon,
    DocumentCheckIcon,
    HomeIcon,
    InformationCircleIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import * as Popover from '@radix-ui/react-popover';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';
import Avatar from '../components/Avatar';
import ButtonLoadingSpinner from '../components/ButtonLoadingSpinner';
import { useAuth } from '../context/AuthContext';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteUserChecklistData = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete all data? This action cannot be undone.',
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await clearUserChecklistItems();
      alert('Successfully deleted all item data.');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setDeleteError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const linkVariants: Variants = {
    hover: {
      scale: 1.05,
      transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
  };

  return (
    <>
      <header className="bg-white shadow-md py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-extrabold text-blue-700 cursor-pointer"
          >
            <Link
              href={isAuthenticated && user?.role === 'admin' ? '/admin' : '/'}
              className="flex items-center"
            >
              <motion.img
                src="/company-logo.jpg"
                alt="Company Logo"
                className="h-9"
              />
              {isAuthenticated && user?.role === 'admin' && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-base font-bold text-blue-900"
                >
                  ADMIN
                </motion.span>
              )}
            </Link>
          </motion.div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6 text-base font-medium text-gray-500">
              <motion.div variants={linkVariants} whileHover="hover">
                <Link
                  href="/"
                  className="flex items-center hover:text-blue-900 transition-colors duration-200 cursor-pointer"
                >
                  <HomeIcon className="h-5 w-5 mr-1" />
                  Home
                </Link>
              </motion.div>
              <motion.div variants={linkVariants} whileHover="hover">
                <a
                  href="https://runsystem.net/vi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-900 transition-colors duration-200 cursor-pointer"
                >
                  <InformationCircleIcon className="h-5 w-5 mr-1" />
                  About us
                </a>
              </motion.div>
              {isAuthenticated && user?.role === 'admin' && (
                <motion.div variants={linkVariants} whileHover="hover">
                  <Link
                    href="/admin"
                    className="flex items-center hover:text-blue-900 transition-colors duration-200 cursor-pointer"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-1" />
                    Admin
                  </Link>
                </motion.div>
              )}
            </nav>

            <div className="hidden md:block h-6 w-px bg-gray-200"></div>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  Welcome, {user.name}
                </span>
                <Avatar
                  src={user.image}
                  name={user.name}
                  alt={user.name}
                  width={32}
                  height={32}
                />
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none cursor-pointer">
                      <Bars3Icon className="h-6 w-6 text-gray-500" />
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="z-10 mt-2 w-64 rounded-xl bg-white p-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                      align="end"
                      sideOffset={5}
                    >
                      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 mb-2">
                        <Avatar
                          src={user.image}
                          name={user.name}
                          alt={user.name}
                          width={48}
                          height={48}
                        />
                        <div className="flex flex-col">
                          <p className="text-lg font-bold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="p-2">
                        {isAuthenticated && (
                          <Link
                            href="/my-category-summary"
                            className="flex w-full items-center rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer"
                          >
                            <DocumentCheckIcon className="mr-3 h-5 w-5" />
                            My Checklists
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center rounded-lg px-3 py-2 text-base font-medium text-red-700 hover:bg-red-50 hover:text-red-900 transition-all duration-200 cursor-pointer"
                        >
                          <ArrowRightStartOnRectangleIcon className="mr-3 h-5 w-5" />
                          Logout
                        </button>
                      </div>
                      {user.email === 'quantt@runsystem.net' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 p-2">
                          <div className="px-3 mb-2">
                            <h3 className="text-sm font-bold uppercase text-red-700">
                              Danger Zone
                            </h3>
                          </div>
                          {deleteError && (
                            <p className="px-3 text-xs text-red-500 mb-2">
                              Error: {deleteError}
                            </p>
                          )}
                          <button
                            onClick={handleDeleteUserChecklistData}
                            disabled={isDeleting}
                            className="group flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {isDeleting ? (
                              <ButtonLoadingSpinner />
                            ) : (
                              <TrashIcon className="mr-2 h-4 w-4" />
                            )}
                            {isDeleting
                              ? 'Deleting Data...'
                              : 'Delete All My Data'}
                          </button>
                        </div>
                      )}
                      <Popover.Arrow className="fill-current text-white" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            ) : (
              <motion.div variants={linkVariants} whileHover="hover">
                <Link
                  href="/login"
                  className="flex items-center px-3 py-2 rounded-full text-base font-medium !text-gray-600 hover:text-blue-900 transition-colors duration-200 cursor-pointer"
                >
                  <ArrowLeftEndOnRectangleIcon className="h-5 w-5 mr-1" />
                  Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
