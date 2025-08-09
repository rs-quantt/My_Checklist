'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
  HomeIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
                className="h-10"
              />
              {isAuthenticated && user?.role === 'admin' && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-base font-bold"
                  style={{ color: '#2196F3' }}
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
                  className="flex items-center hover:text-blue-600 transition-colors duration-200 cursor-pointer"
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
                  className="flex items-center hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  <InformationCircleIcon className="h-5 w-5 mr-1" />
                  About us
                </a>
              </motion.div>
              {isAuthenticated && user?.role === 'admin' && (
                <motion.div variants={linkVariants} whileHover="hover">
                  <Link
                    href="/admin"
                    className="flex items-center hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-1" />
                    Admin
                  </Link>
                </motion.div>
              )}
            </nav>

            <div className="hidden md:block h-6 w-px bg-gray-200"></div>

            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.05 }}>
                <button
                  onClick={handleLogout}
                  className="group inline-flex items-center justify-center whitespace-nowrap rounded-full bg-red-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center whitespace-nowrap rounded-full bg-blue-600 px-5 py-2.5 text-base font-semibold !text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                  Log in
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
