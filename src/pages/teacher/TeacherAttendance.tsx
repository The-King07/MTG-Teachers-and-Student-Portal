import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { CalendarCheck, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  // Selection controls
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Attendance states map: { [student_user_id]: 'PRESENT' | 'ABSENT' }
  const [attendanceState, setAttendanceState] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    apiRequest('/classes').then(res => {
      setClassesList(res.classes || []);
      setSubjectsList(res.subjects || []);
      if (res.classes && res.classes.length > 0) {
        setSelectedClassId(res.classes[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch students for selected class & section
  useEffect(() => {
    if (!selectedClassId) return;
    const loadClassStudents = async () => {
      try {
        const res = await apiRequest(`/students?class_id=${selectedClassId}&section=${selectedSection}`);
        const fetchedStudents = res.students || [];
        setStudentsList(fetchedStudents);

        // Fetch existing attendance records for this date
        const attRes = await apiRequest(`/attendance/class-date?class_id=${selectedClassId}&section=${selectedSection}&date=${selectedDate}&subject_id=${selectedSubjectId}`);
        const existingRecords: any[] = attRes.attendance || [];

        const initialMap: Record<string, 'PRESENT' | 'ABSENT'> = {};
        fetchedStudents.forEach((st: any) => {
          const match = existingRecords.find(a => a.student_user_id === st.id);
          initialMap[st.id] = match ? match.status : 'PRESENT'; // default Present
        });
        setAttendanceState(initialMap);
      } catch (err) {
        console.error(err);
      }
    };
    loadClassStudents();
  }, [selectedClassId, selectedSection, selectedSubjectId, selectedDate]);

  const handleStatusToggle = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, 'PRESENT' | 'ABSENT'> = {};
    studentsList.forEach(st => { updated[st.id] = status; });
    setAttendanceState(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || studentsList.length === 0) return;
    setSaving(true);
    setSuccessMsg(null);

    try {
      const records = Object.entries(attendanceState).map(([student_user_id, status]) => ({
        student_user_id,
        status
      }));

      await apiRequest('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          class_id: selectedClassId,
          section: selectedSection,
          subject_id: selectedSubjectId,
          date: selectedDate,
          records
        })
      });

      setSuccessMsg(`Attendance for ${selectedDate} saved successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading attendance portal...</div>;
  }

  const selectedClass = classesList.find(c => c.id === selectedClassId);
  const sections = selectedClass?.sections || ['A'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mark Class Attendance</h1>
          <p className="text-xs text-gray-500">Record daily student attendance by class, section, and subject</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Selector Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
          >
            {classesList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
          >
            {sections.map((sec: string) => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Subject (Optional)</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
          >
            <option value="">General Attendance</option>
            {subjectsList.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none font-medium"
          />
        </div>
      </div>

      {/* Attendance Student Sheet */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Enrolled Students ({studentsList.length})</h3>
            <p className="text-[11px] text-gray-500">Toggle Present or Absent status for each student</p>
          </div>
          {studentsList.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkAll('PRESENT')}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('ABSENT')}
                className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-md cursor-pointer"
              >
                Mark All Absent
              </button>
            </div>
          )}
        </div>

        {studentsList.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {studentsList.map((st: any) => {
              const currentStatus = attendanceState[st.id] || 'PRESENT';
              return (
                <div key={st.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{st.name}</p>
                    <p className="text-[10px] text-gray-500">ID: {st.profile?.student_code || st.username}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(st.id, 'PRESENT')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        currentStatus === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(st.id, 'ABSENT')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        currentStatus === 'ABSENT'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No students enrolled in this class" description="Enroll students into this class and section to mark daily attendance." />
        )}

        {studentsList.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Attendance Records'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
