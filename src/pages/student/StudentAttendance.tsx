import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { CalendarCheck, AlertTriangle, BookOpen, CheckCircle, XCircle } from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/attendance/student/${user.id}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading attendance data...</div>;
  }

  const summary = data?.summary || { total: 0, present: 0, absent: 0, percentage: null };
  const subjectBreakdown = data?.subjectBreakdown || [];
  const absentRecords = data?.absentRecords || [];
  const history = data?.history || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Attendance Report</h1>
          <p className="text-xs text-gray-500">Real-time attendance record and subject-wise logs</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Overall Percentage"
          value={summary.percentage !== null ? `${summary.percentage}%` : null}
          emptyLabel="No records yet"
          icon={CalendarCheck}
          color={summary.percentage >= 75 ? 'emerald' : summary.percentage >= 50 ? 'amber' : 'rose'}
        />
        <StatCard title="Total Days" value={summary.total > 0 ? summary.total : null} icon={BookOpen} color="blue" />
        <StatCard title="Days Present" value={summary.total > 0 ? summary.present : null} icon={CheckCircle} color="emerald" />
        <StatCard title="Days Absent" value={summary.total > 0 ? summary.absent : null} icon={XCircle} color="rose" />
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Subject-Wise Attendance</h3>
        {subjectBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectBreakdown.map((sb: any) => (
              <div key={sb.subject_name} className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">{sb.subject_name}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Present: <span className="font-semibold text-emerald-700">{sb.present}</span> / Absent: <span className="font-semibold text-rose-700">{sb.absent}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-700">{sb.percentage !== null ? `${sb.percentage}%` : 'N/A'}</p>
                  <span className="text-[10px] text-gray-400">Total: {sb.total}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No subject-wise attendance recorded" description="Subject specific attendance will be grouped here once marked by teachers." />
        )}
      </div>

      {/* Absent Dates Log */}
      {absentRecords.length > 0 && (
        <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-900">Absent Dates Log</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {absentRecords.map((ar: any) => (
              <span key={ar.id} className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-800 shadow-2xs">
                {ar.date}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Complete Attendance History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">Attendance Log History</h3>
        </div>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Class & Section</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h: any) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{h.date}</td>
                    <td className="p-3 text-gray-600">{h.section}</td>
                    <td className="p-3 text-gray-600">{h.subject_id || 'General'}</td>
                    <td className="p-3">
                      <StatusBadge status={h.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No attendance history available" description="No daily attendance entries have been submitted for your account yet." />
        )}
      </div>
    </div>
  );
};
