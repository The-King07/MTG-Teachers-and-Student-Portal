import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Megaphone, Calendar, User } from 'lucide-react';

export const ParentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/announcements').then(res => {
      setAnnouncements(res.announcements || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading school announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">School & Class Announcements</h1>
        <p className="text-xs text-gray-500">Official circulars, class notices, and event updates</p>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a: any) => (
            <div key={a.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">{a.title}</h3>
                  <StatusBadge status={a.priority} />
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {a.date}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{a.description}</p>
              <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">Posted by {a.author_name}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No active announcements" description="There are currently no announcements published." />
      )}
    </div>
  );
};
