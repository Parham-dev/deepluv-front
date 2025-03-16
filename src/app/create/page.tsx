'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

export default function Create() {
  const { user } = useAuthContext() as { user: any };
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
    console.log({ title, description });
    alert('Creation successful!');
    // Reset form
    setTitle('');
    setDescription('');
  };

  return (
    <MainLayout>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Item</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Fill out the form below to create a new item.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 