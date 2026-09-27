import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Filter } from 'lucide-react';

export const ParentHistory: React.FC = () => {
  const { activeChild } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChild) return;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/history/student/${activeChild.id}`);
        setEvents(res.events || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [activeChild]);

  if (!activeChild) {
    return <EmptyState title="No active child selected" description="Select a child account to view academic history timeline." />;
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading child history timeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Academic History Timeline — {activeChild.name}</h1>
        <p className="text-xs text-gray-500">Chronological history of attendance logs, test results, and teacher evaluations</p>
      </div>

      {events.length > 0 ? (
        <div className="relative pl-6 border-l-2 border-amber-200 space-y-6 my-4">
          {events.map((ev: any) => (
            <div key={ev.id} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-xs" />
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{ev.title}</span>
                  <div className="flex items-center gap-2">
                    {ev.status_badge && <StatusBadge status={ev.status_badge} variant={ev.badge_variant} />}
                    <span className="text-[10px] text-gray-400">{ev.date}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-700">{ev.description}</p>
                {ev.author_name && (
                  <p className="text-[10px] text-gray-500">By: {ev.author_name} {ev.subject_name ? `• ${ev.subject_name}` : ''}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No timeline records" description="No timeline events recorded for your child yet." />
      )}
    </div>
  );
};
