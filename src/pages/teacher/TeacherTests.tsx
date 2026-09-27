import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { Award, PlusCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

export const TeacherTests: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [testName, setTestName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [section, setSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([
        apiRequest('/tests'),
        apiRequest('/classes')
      ]);

      setTests(tRes.tests || []);
      setClassesList(cRes.classes || []);
      setSubjectsList(cRes.subjects || []);

      if (cRes.classes && cRes.classes.length > 0 && !classId) {
        setClassId(cRes.classes[0].id);
      }
      if (cRes.subjects && cRes.subjects.length > 0 && !subjectId) {
        setSubjectId(cRes.subjects[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !subjectId || !classId || !date || !maxMarks) return;

    try {
      await apiRequest('/tests/create', {
        method: 'POST',
        body: JSON.stringify({
          test_name: testName,
          subject_id: subjectId,
          class_id: classId,
          section,
          date,
          max_marks: maxMarks,
          description
        })
      });

      setMsg(`Test "${testName}" created successfully.`);
      setTestName('');
      setDescription('');
      setTimeout(() => setMsg(null), 3000);
      fetchTests();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading tests & assessments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tests & Examinations Management</h1>
        <p className="text-xs text-gray-500">Create tests, manage assessment schedules, and enter student marks</p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Create Test Form */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <PlusCircle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900">Schedule New Test</h3>
        </div>

        <form onSubmit={handleCreateTest} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Test Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Mid-Term Algebra Examination"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
              >
                <option value="">Select Subject...</option>
                {subjectsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Class</label>
              <select
                required
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
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
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Test Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                required
                min="1"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Syllabus Notes</label>
              <input
                type="text"
                placeholder="e.g. Unit 1 to Unit 4 concepts"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Create & Schedule Test
          </button>
        </form>
      </div>

      {/* Tests List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Scheduled & Completed Tests</h3>
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map(t => (
              <div key={t.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">{t.subject_name}</span>
                    <span className="text-xs text-gray-500 font-semibold">{t.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mt-2">{t.test_name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{t.class_name} • Section {t.section}</p>
                  <p className="text-xs text-gray-700 mt-1 italic">{t.description || 'Standard test'}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">Max Marks: {t.max_marks}</span>
                  <Link
                    to={`/teacher/results?test_id=${t.id}`}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Enter Student Marks
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No tests scheduled" description="Use the form above to schedule your first test or exam." />
        )}
      </div>
    </div>
  );
};
