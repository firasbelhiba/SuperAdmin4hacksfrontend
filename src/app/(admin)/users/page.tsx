import { Suspense } from 'react';
import UsersClient from './UsersClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const metadata = {
  title: 'User Management | 4Hacks Admin',
  description: 'Manage users, roles, and permissions',
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Static Header - No JavaScript needed */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions
          </p>
        </div>
      </div>

      {/* Interactive Content */}
      <Suspense fallback={<LoadingSpinner text="Loading users..." />}>
        <UsersClient />
      </Suspense>
    </div>
  );
}
