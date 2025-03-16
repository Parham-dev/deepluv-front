import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function Home() {
  return (
    <MainLayout>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900">Hello World!</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Welcome to DeepLuv, your AI-powered application.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-base text-gray-700">
              This is a Next.js 13 application with Firebase authentication. You can sign in or sign up to access more features.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link
                href="/signin"
                className="btn btn-primary"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn btn-secondary"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
