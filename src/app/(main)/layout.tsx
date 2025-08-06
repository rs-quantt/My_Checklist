'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // Sửa ở đây: điều hướng về trang chủ '/'
    router.push('/');
  };

  return (
    <>
      {/* Header Bar - Modern Design */}
      <header className="bg-white shadow-md py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-extrabold text-blue-700">
            <Link
              href={isAuthenticated ? '/admin' : '/'}
              className="flex items-center"
            >
              <img
                src="/company-logo.jpg"
                alt="Company Logo"
                className="h-10"
              />
              {/* Add ADMIN text only after successful login */}
              {isAuthenticated && user?.role === 'admin' && (
                <span
                  className="text-base font-bold"
                  style={{ color: '#2196F3' }}
                >
                  ADMIN
                </span>
              )}
            </Link>
          </div>

          {/* Navigation and Action Button */}
          <div className="flex items-center space-x-4">
            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-500">
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                Home
              </Link>
              <a
                href="https://runsystem.net/vi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                About us
              </a>
              {/* Show Admin link if user is admin */}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Separator */}
            <div className="hidden md:block h-6 w-px bg-gray-200"></div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="group inline-flex items-center justify-center whitespace-nowrap rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="group inline-flex items-center justify-center whitespace-nowrap rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Log in
                <svg
                  className="relative ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  ></path>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
