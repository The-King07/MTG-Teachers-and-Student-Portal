import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Filter, Calendar, BookOpen } from 'lucide-react';

export const StudentHistory: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject_id', selectedSubject);
      if (selectedCategory) params.append('category', selectedCategory);

      const [histRes, subRes] = await Promise.all([
        apiRequest(`/history/student/${user.id}?${params.toString()}`),
        apiRequest('/classes')
      ]);

      setEvents(histRes.events || []);
      setSubjects(subRes.subjects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, selectedSubject, selectedCategory]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading academic history timeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Academic History Timeline</h1>
          <p className="text-xs text-gray-500">Chronological log of attendance, test results, feedback, and milestones</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold px-2">
            <Filter className="w-3.5 h-3.5 text-amber-600" /> Filter:
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white outline-none"
          >
            <option value="">All Categories</option>
            <option value="attendance">Attendance</option>
            <option value="test_result">Test Results</option>
            <option value="feedback">Feedback</option>
            <option value="recommendation">Recommendations</option>
            <option value="announcement">Announcements</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      {events.length > 0 ? (
        <div className="relative pl-6 border-l-2 border-amber-200 space-y-6 my-4">
          {events.map((ev: any) => (
            <div key={ev.id} className="relative group">
              {/* Dot */}
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
        <EmptyState title="No academic history records" description="No timeline events matching the selected filters were found." />
      )}
    </div>
  );
};
