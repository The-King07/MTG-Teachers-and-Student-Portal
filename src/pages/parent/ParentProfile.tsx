import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users } from 'lucide-react';

export const ParentProfile: React.FC = () => {
  const { user, children } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Parent Profile</h1>
        <p className="text-xs text-gray-500">Your account parameters and linked child count</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center border-2 border-emerald-400 shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-xs text-gray-500">@{user.username} • Parent Account</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300 uppercase">
              PARENT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500">Email Address</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{user.email}</p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500">Phone Number</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{user.phone || 'Not provided'}</p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 md:col-span-2">
            <p className="text-[11px] font-semibold text-gray-500">Linked Children Count</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{children.length} Child/Children Linked</p>
          </div>
        </div>
      </div>
    </div>
  );
};
