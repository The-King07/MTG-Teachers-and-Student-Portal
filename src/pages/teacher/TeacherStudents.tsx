import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Users, Search, Filter, AlertTriangle, UserPlus, GraduationCap, CheckCircle2 } from 'lucide-react';

export const TeacherStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [requiresAttention, setRequiresAttention] = useState(false);

  // Enroll modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollClassId, setEnrollClassId] = useState('');
  const [enrollSection, setEnrollSection] = useState('A');
  const [enrollRollNo, setEnrollRollNo] = useState('');
  const [enrollMsg, setEnrollMsg] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedClass) params.append('class_id', selectedClass);
      if (selectedSection) params.append('section', selectedSection);
      if (requiresAttention) params.append('requires_attention', 'true');

      const [stuRes, clsRes] = await Promise.all([
        apiRequest(`/students?${params.toString()}`),
        apiRequest('/classes')
      ]);

      setStudents(stuRes.students || []);
      setClassesList(clsRes.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedClass, selectedSection, requiresAttention]);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollStudentId || !enrollClassId) return;

    try {
      await apiRequest('/classes/enroll-student', {
        method: 'POST',
        body: JSON.stringify({
          student_user_id: enrollStudentId,
          class_id: enrollClassId,
          section: enrollSection,
          roll_number: enrollRollNo
        })
      });
      setEnrollMsg('Student enrolled in class successfully.');
      setTimeout(() => setEnrollMsg(null), 3000);
      setShowEnrollModal(false);
      fetchStudents();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading student directory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-xs text-gray-500">View enrolled students, profiles, and attendance/performance metrics</p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" /> Enroll Student to Class
        </button>
      </div>

      {enrollMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{enrollMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white outline-none"
        >
          <option value="">All Classes</option>
          {classesList.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Section (e.g. A)"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-24 text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white outline-none"
        />

        <button
          onClick={() => setRequiresAttention(!requiresAttention)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border ${
            requiresAttention
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Requires Attention Only
        </button>
      </div>

      {/* Student List Table */}
      {students.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Student Code</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Class & Section</th>
                  <th className="p-3.5">Attendance %</th>
                  <th className="p-3.5">Avg Score %</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s: any) => {
                  const needsAttention =
                    (s.attendance_percentage !== null && s.attendance_percentage < 75) ||
                    (s.avg_performance !== null && s.avg_performance < 50);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-mono font-bold text-amber-900">{s.profile?.student_code || 'STU-NEW'}</td>
                      <td className="p-3.5 font-bold text-gray-900">{s.name}</td>
                      <td className="p-3.5 text-gray-600">{s.class_name} ({s.section || 'A'})</td>
                      <td className="p-3.5 font-semibold text-gray-900">
                        {s.attendance_percentage !== null ? `${s.attendance_percentage}%` : <span className="text-gray-400 italic">No records</span>}
                      </td>
                      <td className="p-3.5 font-semibold text-gray-900">
                        {s.avg_performance !== null ? `${s.avg_performance}%` : <span className="text-gray-400 italic">No tests</span>}
                      </td>
                      <td className="p-3.5">
                        {needsAttention ? (
                          <StatusBadge status="Requires Attention" variant="danger" />
                        ) : (
                          <StatusBadge status="Normal" variant="success" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No students found" description="No student records match the active search and filter criteria." />
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Enroll Student to Class</h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEnrollSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Student</label>
                <select
                  required
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                >
                  <option value="">Select Student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.profile?.student_code || s.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Class</label>
                  <select
                    required
                    value={enrollClassId}
                    onChange={(e) => setEnrollClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="">Select Class...</option>
                    {classesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={enrollSection}
                    onChange={(e) => setEnrollSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Roll Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 101"
                  value={enrollRollNo}
                  onChange={(e) => setEnrollRollNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Enrollment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
