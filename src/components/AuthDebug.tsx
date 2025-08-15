import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthDebug() {
  const { user, loading, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50 hover:bg-gray-700"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs z-50 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Auth Debug</span>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>Loading: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>{loading ? 'YES' : 'NO'}</span></div>
        <div>User: <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? 'EXISTS' : 'NULL'}</span></div>
        <div>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'YES' : 'NO'}</span></div>
        {user && (
          <>
            <div>ID: {user.id.substring(0, 8)}...</div>
            <div>Email: {user.email}</div>
            <div>Name: {user.displayName || 'N/A'}</div>
          </>
        )}
      </div>
    </div>
  );
}
