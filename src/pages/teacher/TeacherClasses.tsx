import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { BookOpen, PlusCircle, Layers, CheckCircle2 } from 'lucide-react';

export const TeacherClasses: React.FC = () => {
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 10');
  const [sectionsText, setSectionsText] = useState('A, B');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/classes');
      setClassesList(res.classes || []);
      setSubjectsList(res.subjects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !gradeLevel) return;

    try {
      const sections = sectionsText.split(',').map(s => s.trim()).filter(Boolean);
      await apiRequest('/classes/create-class', {
        method: 'POST',
        body: JSON.stringify({ name: className, grade: gradeLevel, sections })
      });
      setMessage(`Class "${className}" created successfully.`);
      setClassName('');
      fetchData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !subjectCode) return;

    try {
      await apiRequest('/classes/create-subject', {
        method: 'POST',
        body: JSON.stringify({ name: subjectName, code: subjectCode })
      });
      setMessage(`Subject "${subjectName}" added successfully.`);
      setSubjectName('');
      setSubjectCode('');
      fetchData();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading academic classes & subjects...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Academic Classes & Subjects</h1>
        <p className="text-xs text-gray-500">Define classes, grade levels, sections, and curriculum subjects</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Action Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Class Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-gray-900">Add New Class</h3>
          </div>
          <form onSubmit={handleCreateClass} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Class Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Grade 10 Science & Math"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Grade Level</label>
                <input
                  type="text"
                  required
                  placeholder="Grade 10"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sections (comma separated)</label>
                <input
                  type="text"
                  placeholder="A, B, C"
                  value={sectionsText}
                  onChange={(e) => setSectionsText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Create Class
            </button>
          </form>
        </div>

        {/* Create Subject Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Layers className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-gray-900">Add New Subject</h3>
          </div>
          <form onSubmit={handleCreateSubject} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Code</label>
              <input
                type="text"
                required
                placeholder="e.g. MATH-101"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Add Subject
            </button>
          </form>
        </div>
      </div>

      {/* Classes & Subjects Display Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Existing Classes</h3>
          {classesList.length > 0 ? (
            <div className="space-y-2">
              {classesList.map(c => (
                <div key={c.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-[10px] text-gray-500">Grade: {c.grade}</p>
                  </div>
                  <div className="flex gap-1">
                    {(c.sections || ['A']).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[10px]">
                        Sec {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No classes created" description="Use the form above to add your school's classes." />
          )}
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Curriculum Subjects</h3>
          {subjectsList.length > 0 ? (
            <div className="space-y-2">
              {subjectsList.map(s => (
                <div key={s.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-md text-[10px]">{s.code}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No subjects added" description="Add curriculum subjects using the form above." />
          )}
        </div>
      </div>
    </div>
  );
};
