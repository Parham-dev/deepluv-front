'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

// Mock data for items
const mockItems = [
  { id: 1, title: 'Project Alpha', description: 'A cutting-edge AI project', status: 'In Progress' },
  { id: 2, title: 'Project Beta', description: 'Machine learning implementation', status: 'Completed' },
  { id: 3, title: 'Project Gamma', description: 'Data analysis and visualization', status: 'Planning' },
];

export default function Dashboard() {
  const { user } = useAuthContext() as { user: any };
  const router = useRouter();
  const [items, setItems] = useState(mockItems);

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

  return (
    <MainLayout>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Welcome to your personal dashboard, {user?.email}
            </p>
          </div>
          <Link href="/create" className="btn btn-primary">
            Create New
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Items</h2>
            
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'In Progress' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No items found. Create your first item!</p>
                <Link href="/create" className="btn btn-primary mt-4">
                  Create New Item
                </Link>
              </div>
            )}
            
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Dashboard cards */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Statistics</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Total Items: {items.length}</p>
                    <p>Completed: {items.filter(item => item.status === 'Completed').length}</p>
                    <p>In Progress: {items.filter(item => item.status === 'In Progress').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Last login: {new Date().toLocaleDateString()}</p>
                    <p>Items created this month: 3</p>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                  <div className="mt-2 space-y-2">
                    <Link href="/create" className="block text-sm text-indigo-600 hover:text-indigo-900">
                      Create New Item
                    </Link>
                    <Link href="/profile" className="block text-sm text-indigo-600 hover:text-indigo-900">
                      Update Profile
                    </Link>
                    <Link href="/settings" className="block text-sm text-indigo-600 hover:text-indigo-900">
                      Manage Settings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 