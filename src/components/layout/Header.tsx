'use client';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import firebase_app from '@/firebase/config';
import { useState } from 'react';
import UserCoins from '@/components/UserCoins';

const auth = getAuth(firebase_app);

export default function Header() {
  const { user } = useAuthContext() as { user: any };
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                DeepLuv
              </Link>
            </div>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Home
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Dashboard
                </Link>
                
                {/* User Coins Display */}
                <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <UserCoins showLabel={true} className="text-sm" />
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="btn btn-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/signin" 
                  className="btn btn-secondary"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {user && (
              <div className="mr-4">
                <UserCoins showLabel={false} className="text-sm" />
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Home
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Dashboard
                </Link>
                
                {/* User Coins in Mobile Menu */}
                <div className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 bg-gray-50">
                  <UserCoins showLabel={true} />
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Sign In
                </Link>
                <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 