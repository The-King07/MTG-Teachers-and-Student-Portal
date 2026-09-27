import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { CalendarCheck, CheckCircle, XCircle, BookOpen, AlertTriangle } from 'lucide-react';

export const ParentAttendance: React.FC = () => {
  const { activeChild } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChild) return;
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/attendance/student/${activeChild.id}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [activeChild]);

  if (!activeChild) {
    return <EmptyState title="No active child selected" description="Please link or select a child account first." />;
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading child attendance report...</div>;
  }

  const summary = data?.summary || { total: 0, present: 0, absent: 0, percentage: null };
  const subjectBreakdown = data?.subjectBreakdown || [];
  const absentRecords = data?.absentRecords || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Child Attendance Report — {activeChild.name}</h1>
        <p className="text-xs text-gray-500">View overall attendance percentage, subject logs, and absent dates</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={summary.percentage !== null ? `${summary.percentage}%` : null}
          emptyLabel="No records yet"
          icon={CalendarCheck}
          color={summary.percentage >= 75 ? 'emerald' : summary.percentage >= 50 ? 'amber' : 'rose'}
        />
        <StatCard title="Total Days" value={summary.total > 0 ? summary.total : null} icon={BookOpen} color="blue" />
        <StatCard title="Days Present" value={summary.total > 0 ? summary.present : null} icon={CheckCircle} color="emerald" />
        <StatCard title="Days Absent" value={summary.total > 0 ? summary.absent : null} icon={XCircle} color="rose" />
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Subject-Wise Attendance Breakdown</h3>
        {subjectBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjectBreakdown.map((sb: any) => (
              <div key={sb.subject_name} className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">{sb.subject_name}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Present: {sb.present} / Absent: {sb.absent}</p>
                </div>
                <p className="text-base font-bold text-amber-700">{sb.percentage !== null ? `${sb.percentage}%` : 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No subject attendance records" description="Subject-wise attendance breakdown will appear here once logged by teachers." />
        )}
      </div>

      {absentRecords.length > 0 && (
        <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-900">Absent Dates Log</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {absentRecords.map((ar: any) => (
              <span key={ar.id} className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-800">
                {ar.date}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
