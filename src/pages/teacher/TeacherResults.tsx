import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Award, Save, CheckCircle2 } from 'lucide-react';

export const TeacherResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTestId = searchParams.get('test_id') || '';

  const [testsList, setTestsList] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId);
  const [testData, setTestData] = useState<any>(null);
  const [studentResults, setStudentResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    apiRequest('/tests').then(res => {
      const tests = res.tests || [];
      setTestsList(tests);
      if (tests.length > 0 && !selectedTestId) {
        setSelectedTestId(tests[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchResults = async (testId: string) => {
    if (!testId) return;
    try {
      setLoading(true);
      const res = await apiRequest(`/tests/${testId}/results`);
      setTestData(res.test);
      setStudentResults(res.studentResults || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTestId) {
      fetchResults(selectedTestId);
    }
  }, [selectedTestId]);

  const handleMarkChange = (studentUserId: string, marks: string) => {
    setStudentResults(prev => prev.map(sr => {
      if (sr.student_user_id === studentUserId) {
        const num = marks === '' ? null : Number(marks);
        const max = testData?.max_marks || 100;
        const pct = num !== null ? Math.round((num / max) * 100) : null;
        return { ...sr, marks_obtained: num, percentage: pct };
      }
      return sr;
    }));
  };

  const handleRemarkChange = (studentUserId: string, remark: string) => {
    setStudentResults(prev => prev.map(sr => {
      if (sr.student_user_id === studentUserId) {
        return { ...sr, remarks: remark };
      }
      return sr;
    }));
  };

  const handleSaveResults = async () => {
    if (!selectedTestId) return;
    setSaving(true);
    setMsg(null);

    try {
      const payload = studentResults.map(sr => ({
        student_user_id: sr.student_user_id,
        marks_obtained: sr.marks_obtained,
        remarks: sr.remarks
      }));

      await apiRequest(`/tests/${selectedTestId}/results`, {
        method: 'POST',
        body: JSON.stringify({ results: payload })
      });

      setMsg('Test results saved and published to students & parents successfully.');
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading test results entry portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Enter & Update Test Results</h1>
          <p className="text-xs text-gray-500">Grade student test papers, record marks, and publish results</p>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Test Selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs max-w-md">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Select Test to Grade</label>
        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-bold text-gray-900"
        >
          {testsList.map(t => (
            <option key={t.id} value={t.id}>
              {t.test_name} ({t.subject_name} • Max Marks: {t.max_marks})
            </option>
          ))}
        </select>
      </div>

      {/* Marks Sheet Table */}
      {testData ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{testData.test_name}</h3>
              <p className="text-[11px] text-gray-500">Max Marks: {testData.max_marks} • Date: {testData.date}</p>
            </div>
            <button
              onClick={handleSaveResults}
              disabled={saving}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Publishing...' : 'Save & Publish Results'}
            </button>
          </div>

          {studentResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Student Code</th>
                    <th className="p-3.5">Marks Obtained (out of {testData.max_marks})</th>
                    <th className="p-3.5">Percentage</th>
                    <th className="p-3.5">Remarks / Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentResults.map((sr: any) => (
                    <tr key={sr.student_user_id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold text-gray-900">{sr.student_name}</td>
                      <td className="p-3.5 font-mono text-amber-900">{sr.student_code}</td>
                      <td className="p-3.5">
                        <input
                          type="number"
                          min="0"
                          max={testData.max_marks}
                          placeholder="Marks"
                          value={sr.marks_obtained !== null && sr.marks_obtained !== undefined ? sr.marks_obtained : ''}
                          onChange={(e) => handleMarkChange(sr.student_user_id, e.target.value)}
                          className="w-28 px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      <td className="p-3.5 font-bold">
                        {sr.percentage !== null ? <StatusBadge status={`${sr.percentage}%`} /> : <span className="text-gray-400 italic">Not graded</span>}
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          placeholder="Teacher comment..."
                          value={sr.remarks || ''}
                          onChange={(e) => handleRemarkChange(sr.student_user_id, e.target.value)}
                          className="w-full max-w-xs px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No students in this class" description="Enroll students into this class section to enter test scores." />
          )}
        </div>
      ) : (
        <EmptyState title="No test selected" description="Select a test from the dropdown above to manage test results." />
      )}
    </div>
  );
};
