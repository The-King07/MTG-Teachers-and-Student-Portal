import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Lightbulb, CheckCircle2, Clock } from 'lucide-react';

export const StudentRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiRequest(`/recommendations/student/${user.id}`);
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/recommendations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading recommendations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Academic Action Recommendations</h1>
        <p className="text-xs text-gray-500">Teacher-assigned study goals, practice tasks, and attendance advice</p>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((r: any) => (
            <div key={r.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{r.category}</span>
                  <StatusBadge status={r.status} />
                </div>
                <span className="text-[11px] text-gray-400">Assigned {r.date} • By {r.teacher_name}</span>
              </div>

              <p className="text-xs text-gray-800 font-medium">{r.recommendation}</p>

              {/* Status Update Action Controls */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                {r.status !== 'IN_PROGRESS' && r.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'IN_PROGRESS')}
                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> Mark In Progress
                  </button>
                )}
                {r.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No recommendations assigned" description="Your teachers have not added any recommendations for your account yet." />
      )}
    </div>
  );
};
