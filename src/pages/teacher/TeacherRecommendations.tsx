import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Lightbulb, PlusCircle, CheckCircle2 } from 'lucide-react';

export const TeacherRecommendations: React.FC = () => {
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [studentUserId, setStudentUserId] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  const [category, setCategory] = useState('Practice & Homework');

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    apiRequest('/students').then(res => {
      const students = res.students || [];
      setStudentsList(students);
      if (students.length > 0) {
        setStudentUserId(students[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchRecommendations = async (studentId: string) => {
    if (!studentId) return;
    try {
      const res = await apiRequest(`/recommendations/student/${studentId}`);
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (studentUserId) {
      fetchRecommendations(studentUserId);
    }
  }, [studentUserId]);

  const handleAddRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUserId || !recommendationText.trim()) return;

    try {
      await apiRequest('/recommendations/create', {
        method: 'POST',
        body: JSON.stringify({
          student_user_id: studentUserId,
          recommendation: recommendationText,
          category
        })
      });

      setMsg('Recommendation assigned to student.');
      setRecommendationText('');
      setTimeout(() => setMsg(null), 3000);
      fetchRecommendations(studentUserId);
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading recommendations portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Academic Action Recommendations</h1>
        <p className="text-xs text-gray-500">Assign specific study recommendations (e.g. "Practice more DSA problems", "Improve attendance", "Revise Unit 3")</p>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900">Assign Recommendation</h3>
        </div>

        <form onSubmit={handleAddRecommendation} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Student</label>
              <select
                required
                value={studentUserId}
                onChange={(e) => setStudentUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-semibold text-gray-900"
              >
                {studentsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
              >
                <option value="Practice & Homework">Practice & Homework</option>
                <option value="Attendance Focus">Attendance Focus</option>
                <option value="Syllabus Revision">Syllabus Revision</option>
                <option value="Exam Preparation">Exam Preparation</option>
                <option value="Numerical / Problem Solving">Numerical / Problem Solving</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Recommendation Text</label>
            <input
              type="text"
              required
              placeholder="e.g. Practice previous-year questions for Unit 3"
              value={recommendationText}
              onChange={(e) => setRecommendationText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Assign Recommendation
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900">
          Assigned Recommendations for {studentsList.find(s => s.id === studentUserId)?.name || 'Selected Student'}
        </h3>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map(r => (
              <div key={r.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-900">{r.category}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-gray-700">{r.recommendation}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Date: {r.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No recommendations assigned" description="No recommendations found for the selected student." />
        )}
      </div>
    </div>
  );
};
