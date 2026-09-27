import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { MessageSquareQuote, User, Calendar } from 'lucide-react';

export const StudentFeedback: React.FC = () => {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/feedback/student/${user.id}`);
        setFeedbackList(res.feedback || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading teacher feedback...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Teacher Feedback & Comments</h1>
        <p className="text-xs text-gray-500">Direct evaluations and progress observations submitted by your teachers</p>
      </div>

      {feedbackList.length > 0 ? (
        <div className="space-y-4">
          {feedbackList.map((f: any) => (
            <div key={f.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{f.category}</span>
                  <StatusBadge status={f.subject_name || 'General'} variant="info" />
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {f.date}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                "{f.comment}"
              </p>
              <div className="text-[11px] text-gray-500 pt-1 flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-amber-700" /> By {f.teacher_name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No feedback records" description="Your teachers have not submitted any individual feedback notes for your account yet." />
      )}
    </div>
  );
};
