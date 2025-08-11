'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { motion, Variants } from 'framer-motion';
import {
  HomeIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Avatar from '../components/Avatar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
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
                <Popover className="relative">
                  <Popover.Button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                    <Bars3Icon className="h-6 w-6 text-gray-500" />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Popover.Panel className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      <div className="p-2">
                        <div className="px-4 py-2 border-b border-gray-200 mb-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white"
                        >
                          <ArrowRightOnRectangleIcon
                            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white"
                            aria-hidden="true"
                          />
                          Logout
                        </button>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </Popover>
              </div>
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
