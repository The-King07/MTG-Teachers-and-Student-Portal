import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, GraduationCap, Copy, Check } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, roleDetails } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleCopyCode = () => {
    if (roleDetails?.student_code) {
      navigator.clipboard.writeText(roleDetails.student_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Student Profile</h1>
        <p className="text-xs text-gray-500">Your registered academic details and parent link code</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        {/* Top Avatar Banner */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500 text-gray-950 font-bold text-2xl flex items-center justify-center border-2 border-amber-300 shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-xs text-gray-500">@{user.username} • Student Account</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300 uppercase">
              STUDENT
            </span>
          </div>
        </div>

        {/* Student Code Box for Parent Link */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-900">Student Link Code for Parent Account</p>
            <p className="text-[11px] text-gray-600 mt-0.5">Share this code with your parent to link their parent portal to your academic record.</p>
            <p className="text-sm font-extrabold text-amber-900 tracking-wider mt-2 font-mono">{roleDetails?.student_code || 'STU-123456'}</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500">Email Address</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{user.email}</p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500">Phone Number</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{user.phone || 'Not provided'}</p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500">Class & Grade</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{roleDetails?.class_name || 'Unassigned'}</p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500">Section</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{roleDetails?.section || 'Section A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
