import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { GraduationCap, UserPlus, CheckCircle2, ShieldAlert, Copy } from 'lucide-react';

export const ParentChildren: React.FC = () => {
  const { children, refreshChildren, setActiveChild } = useAuth();
  const [studentCode, setStudentCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) return;
    setError(null);
    setSuccess(null);
    setLinking(true);

    try {
      const res = await apiRequest<{ message: string; student: any }>('/classes/link-child', {
        method: 'POST',
        body: JSON.stringify({ student_code: studentCode.trim() })
      });
      setSuccess(res.message);
      setStudentCode('');
      await refreshChildren();
    } catch (err: any) {
      setError(err.message || 'Failed to link child. Check student code.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Linked Children Accounts</h1>
        <p className="text-xs text-gray-500">Manage and link your children's student profiles to your parent account</p>
      </div>

      {/* Link New Child Form */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 max-w-lg">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <UserPlus className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900">Link Child Account</h3>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleLinkChild} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Enter Student Code (e.g. STU-123456)</label>
            <input
              type="text"
              required
              placeholder="e.g. STU-123456"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">Your child can find their Student Code on their Student Profile page.</p>
          </div>

          <button
            type="submit"
            disabled={linking}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {linking ? 'Linking Account...' : 'Link Child to Account'}
          </button>
        </form>
      </div>

      {/* Linked Children List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Your Linked Children ({children.length})</h3>
        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map(child => (
              <div key={child.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-base flex items-center justify-center">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{child.name}</h4>
                    <p className="text-xs text-gray-500">Class: {child.class_name} ({child.section || 'A'})</p>
                    <p className="text-[10px] text-amber-800 font-mono font-bold mt-1">Code: {child.profile?.student_code}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveChild(child)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg border border-amber-300 transition-colors cursor-pointer"
                >
                  Select Active
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No linked children" description="Link your child's student account using the form above." />
        )}
      </div>
    </div>
  );
};
