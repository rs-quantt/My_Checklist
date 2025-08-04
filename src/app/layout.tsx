import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from 'react';
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Checklist",
  description: "My Checklist",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* Header Bar - Modern Design */}
        <header className="bg-white shadow-md py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-extrabold text-blue-700">
              <Link href="/" className="flex items-center">
                <img
                  src="/company-logo.jpg"
                  alt="Company Logo"
                  style={{ height: '40px', marginRight: '10px' }}
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hidden md:block"
              >
                Log in
              </a>
              <a
                href="#"
                className="bg-blue-700 hover:bg-blue-800 !text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-sm"
              >
                Sign up
              </a>
            </div>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
