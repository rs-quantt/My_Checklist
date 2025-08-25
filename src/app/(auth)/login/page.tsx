'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ButtonLoadingSpinner from '@/app/components/ButtonLoadingSpinner';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'InvalidEmailDomain') {
      setError('Please log in with your company account');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else if (result?.ok) {
      // We need to get the user's role to redirect correctly.
      // A simple way is to push to a generic page and let the middleware or another component handle role-based redirect.
      // Or, we can do a quick fetch to our own API to get user data after sign-in.
      // For now, let's just redirect to the callbackUrl, which is often the intended destination.
      router.push(callbackUrl);
    } else {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Let next-auth handle the redirect after sign-in
    signIn('google', { callbackUrl });
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/background/login-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-md"
        >
          <div className="text-center">
            <img
              src="/check.png"
              alt="My Checklist Logo"
              className="mx-auto h-12 w-12 mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your account to keep your tasks organized anywhere
            </p>
          </div>
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <img
                src="/google-logo.svg"
                alt="Google"
                className="h-5 w-5 mr-2"
              />
              Sign in with Google
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or sign in with email
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-t-lg relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-lg relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 tracking-wide transition-all duration-200"
                disabled={loading}
              >
                {loading ? <ButtonLoadingSpinner /> : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="text-center pt-4 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
