import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { BookOpen, Users, CalendarCheck, Award, AlertTriangle, PlusCircle, Megaphone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [classesList, setClassesList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [testsList, setTestsList] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [attentionStudents, setAttentionStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [clsRes, stuRes, testRes, annRes, attRes] = await Promise.all([
        apiRequest('/classes'),
        apiRequest('/students'),
        apiRequest('/tests'),
        apiRequest('/announcements'),
        apiRequest('/students?requires_attention=true')
      ]);

      setClassesList(clsRes.classes || []);
      setStudentsList(stuRes.students || []);
      setTestsList(testRes.tests || []);
      setAnnouncements((annRes.announcements || []).slice(0, 3));
      setAttentionStudents(attRes.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading teacher control dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xs border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Faculty Portal — Welcome, {user?.name}</h1>
          <p className="text-xs text-gray-300 mt-1">Manage attendance, assessments, student progress, and announcements.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/teacher/attendance" className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4" /> Mark Attendance
          </Link>
          <Link to="/teacher/tests" className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" /> Create Test
          </Link>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Classes Handled"
          value={classesList.length > 0 ? classesList.length : null}
          emptyLabel="No classes created yet"
          icon={BookOpen}
          color="amber"
        />
        <StatCard
          title="Total Registered Students"
          value={studentsList.length > 0 ? studentsList.length : null}
          emptyLabel="No students enrolled yet"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Tests & Exams"
          value={testsList.length > 0 ? testsList.length : null}
          emptyLabel="No active tests yet"
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Students Needing Attention"
          value={attentionStudents.length > 0 ? attentionStudents.length : null}
          emptyLabel="0 Students requiring attention"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Students Requiring Attention */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-gray-900">Students Requiring Attention</h3>
              </div>
              <Link to="/teacher/students?requires_attention=true" className="text-xs text-amber-700 font-semibold hover:underline">
                View All Students
              </Link>
            </div>

            {attentionStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Attendance</th>
                      <th className="p-3">Avg Score</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attentionStudents.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{s.name}</td>
                        <td className="p-3 text-gray-600">{s.class_name} ({s.section})</td>
                        <td className="p-3 font-semibold text-rose-700">
                          {s.attendance_percentage !== null ? `${s.attendance_percentage}%` : 'No records'}
                        </td>
                        <td className="p-3 font-semibold text-amber-700">
                          {s.avg_performance !== null ? `${s.avg_performance}%` : 'No tests'}
                        </td>
                        <td className="p-3">
                          <Link to="/teacher/recommendations" className="text-[11px] font-bold text-amber-700 hover:underline">
                            Add Rec
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="All students performing well"
                description="There are currently no students with low attendance (<75%) or poor academic performance (<50%)."
              />
            )}
          </div>
        </div>

        {/* Right Col: Announcements & Upcoming Tests */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Recent Announcements</h3>
              <Link to="/teacher/announcements" className="text-xs text-amber-700 font-semibold hover:underline">Manage</Link>
            </div>

            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((a: any) => (
                  <div key={a.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900 truncate">{a.title}</span>
                      <StatusBadge status={a.priority} />
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{a.description}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{a.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No announcements posted"
                description="Post announcements to communicate updates to students and parents."
                actionText="Create Announcement"
                onAction={() => window.location.href = '/teacher/announcements'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
