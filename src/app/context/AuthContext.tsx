'use client';

import React from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { User } from '@/types/user'; // Assuming your User type is correctly defined

// The shape of the user object in the NextAuth session
interface SessionUser extends User {
  id: string;
}

interface AuthContextType {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AuthProviderContent = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const loading = status === 'loading';
  const user = session?.user as SessionUser | null;
  const isAuthenticated = !!user;

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        logout: handleLogout,
      }}
    >
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner text="" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // The SessionProvider is required for `useSession` to work.
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
