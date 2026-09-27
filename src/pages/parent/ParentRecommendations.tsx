import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Lightbulb } from 'lucide-react';

export const ParentRecommendations: React.FC = () => {
  const { activeChild } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChild) return;
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/recommendations/student/${activeChild.id}`);
        setRecommendations(res.recommendations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [activeChild]);

  if (!activeChild) {
    return <EmptyState title="No active child selected" description="Select a child account to view academic recommendations." />;
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading recommendations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Academic Action Recommendations — {activeChild.name}</h1>
        <p className="text-xs text-gray-500">Targeted guidance and study recommendations assigned by teachers</p>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((r: any) => (
            <div key={r.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">{r.category}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-xs text-gray-800 font-medium">{r.recommendation}</p>
              <p className="text-[10px] text-gray-400">Assigned {r.date} • By {r.teacher_name}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No recommendations assigned" description="No academic recommendations have been assigned for your child yet." />
      )}
    </div>
  );
};
