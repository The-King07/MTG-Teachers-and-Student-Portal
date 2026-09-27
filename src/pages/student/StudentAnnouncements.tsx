import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Megaphone, Calendar, User, CheckCircle2 } from 'lucide-react';

export const StudentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/announcements');
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await apiRequest(`/announcements/${id}/read`, { method: 'POST' });
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">School & Class Announcements</h1>
        <p className="text-xs text-gray-500">Important notices and updates from your teachers and institution</p>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a: any) => (
            <div
              key={a.id}
              className={`p-5 rounded-xl border transition-all ${
                a.is_read
                  ? 'bg-white border-gray-200'
                  : 'bg-amber-50/40 border-amber-300 shadow-xs'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">{a.title}</h3>
                  <StatusBadge status={a.priority} />
                  {!a.is_read && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white rounded-full">New</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> {a.date}
                </span>
              </div>

              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed mb-3">{a.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <User className="w-3.5 h-3.5 text-amber-700" /> Posted by {a.author_name}
                </span>
                {!a.is_read && (
                  <button
                    onClick={() => handleMarkRead(a.id)}
                    className="text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No announcements available" description="There are no active announcements published for your class at this time." />
      )}
    </div>
  );
};
