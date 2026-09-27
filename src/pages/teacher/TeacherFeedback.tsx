import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { MessageSquareQuote, PlusCircle, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

export const TeacherFeedback: React.FC = () => {
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  const [studentUserId, setStudentUserId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [category, setCategory] = useState('Academic Performance');
  const [comment, setComment] = useState('');

  const [selectedStudentFeedback, setSelectedStudentFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiRequest('/students'),
      apiRequest('/classes')
    ]).then(([stuRes, clsRes]) => {
      setStudentsList(stuRes.students || []);
      setSubjectsList(clsRes.subjects || []);
      if (stuRes.students && stuRes.students.length > 0) {
        setStudentUserId(stuRes.students[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchStudentFeedback = async (studentId: string) => {
    if (!studentId) return;
    try {
      const res = await apiRequest(`/feedback/student/${studentId}`);
      setSelectedStudentFeedback(res.feedback || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (studentUserId) {
      fetchStudentFeedback(studentUserId);
    }
  }, [studentUserId]);

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUserId || !comment.trim()) return;

    try {
      await apiRequest('/feedback/create', {
        method: 'POST',
        body: JSON.stringify({
          student_user_id: studentUserId,
          subject_id: subjectId,
          category,
          comment
        })
      });

      setMsg('Feedback saved and shared with student & parent.');
      setComment('');
      setTimeout(() => setMsg(null), 3000);
      fetchStudentFeedback(studentUserId);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await apiRequest(`/feedback/${id}`, { method: 'DELETE' });
      fetchStudentFeedback(studentUserId);
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading feedback portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Student Feedback & Evaluations</h1>
        <p className="text-xs text-gray-500">Submit individual feedback notes viewable by students and their parents</p>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Add Feedback Form */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <MessageSquareQuote className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900">Add Student Feedback</h3>
        </div>

        <form onSubmit={handleAddFeedback} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Select Student</label>
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
                <option value="Academic Performance">Academic Performance</option>
                <option value="Attendance & Punctuality">Attendance & Punctuality</option>
                <option value="Class Participation">Class Participation</option>
                <option value="Behavior & Discipline">Behavior & Discipline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject (Optional)</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
              >
                <option value="">General</option>
                {subjectsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback Comment</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Shows great analytical skills in Mathematics, but needs consistent attendance..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Submit Feedback Note
          </button>
        </form>
      </div>

      {/* Selected Student's Feedback History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900">
          Existing Feedback for {studentsList.find(s => s.id === studentUserId)?.name || 'Selected Student'}
        </h3>
        {selectedStudentFeedback.length > 0 ? (
          <div className="space-y-3">
            {selectedStudentFeedback.map(f => (
              <div key={f.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{f.category}</span>
                    <span className="text-[10px] text-gray-500">Subject: {f.subject_name || 'General'}</span>
                  </div>
                  <p className="text-xs text-gray-700 italic">"{f.comment}"</p>
                  <p className="text-[10px] text-gray-400">Date: {f.date} • By {f.teacher_name}</p>
                </div>
                <button
                  onClick={() => handleDeleteFeedback(f.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Feedback"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No feedback entries" description="No feedback entries found for the selected student." />
        )}
      </div>
    </div>
  );
};
