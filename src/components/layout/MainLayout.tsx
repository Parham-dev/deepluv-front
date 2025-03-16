'use client';
import { useAuthContext } from '@/context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext() as { user: any };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Sidebar and main content */}
      <div className="flex">
        <Sidebar />
        
        {/* Main content */}
        <div className={`flex-1 ${user ? 'md:ml-64' : ''}`}>
          <main className="py-6 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
} 