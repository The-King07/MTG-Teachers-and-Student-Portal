import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Award, Clock } from 'lucide-react';

export const ParentTests: React.FC = () => {
  const { activeChild } = useAuth();
  const [data, setData] = useState<{ upcomingTests: any[]; completedTests: any[] }>({ upcomingTests: [], completedTests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChild) return;
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/tests/student/${activeChild.id}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [activeChild]);

  if (!activeChild) {
    return <EmptyState title="No active child selected" description="Select a child account to view tests and examination marks." />;
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading child test results...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tests & Exam Results — {activeChild.name}</h1>
        <p className="text-xs text-gray-500">Monitor test scores, subject performance, and upcoming examinations</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" /> Upcoming Tests
        </h2>
        {data.upcomingTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.upcomingTests.map((t: any) => (
              <div key={t.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">{t.subject_name}</span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1">{t.test_name}</h3>
                  <p className="text-xs text-gray-500">{t.description || 'Standard assessment'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-900">{t.date}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Max Marks: {t.max_marks}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No upcoming tests" description="No upcoming tests currently scheduled for your child's class." />
        )}
      </div>

      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" /> Exam Results & Evaluation
        </h2>
        {data.completedTests.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Test Name</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Marks Obtained</th>
                    <th className="p-3.5">Percentage</th>
                    <th className="p-3.5">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.completedTests.map((ct: any) => (
                    <tr key={ct.id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold text-gray-900">{ct.test_name}</td>
                      <td className="p-3.5 font-medium text-gray-700">{ct.subject_name}</td>
                      <td className="p-3.5 text-gray-500">{ct.date}</td>
                      <td className="p-3.5 font-semibold text-gray-900">
                        {ct.marks_obtained !== null ? `${ct.marks_obtained} / ${ct.max_marks}` : <span className="text-gray-400 italic">Pending</span>}
                      </td>
                      <td className="p-3.5">
                        {ct.percentage !== null ? <StatusBadge status={`${ct.percentage}%`} /> : <span className="text-gray-400 italic">Awaiting evaluation</span>}
                      </td>
                      <td className="p-3.5 text-gray-600 italic max-w-xs truncate">{ct.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState title="No test results" description="No completed or evaluated test records available yet." />
        )}
      </div>
    </div>
  );
};
