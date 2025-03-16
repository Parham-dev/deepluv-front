'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

export default function Profile() {
  const { user } = useAuthContext() as { user: any };
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push('/signin');
    }
  }, [user, router]);

  // Show loading while checking authentication
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    // For now, we'll just log the values
    console.log({ name, bio });
    alert('Profile updated successfully!');
  };

  return (
    <MainLayout>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your personal information and preferences.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{user?.email}</h2>
                  <p className="text-sm text-gray-500">Member since {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 