import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { CalendarCheck, Award, Calendar, Megaphone, Lightbulb, MessageSquareQuote, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user, roleDetails } = useAuth();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoading(true);
        const [sumRes, annRes] = await Promise.all([
          apiRequest(`/students/${user.id}/summary`),
          apiRequest('/announcements')
        ]);
        setSummaryData(sumRes);
        setAnnouncements((annRes.announcements || []).slice(0, 3));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading student dashboard...</div>;
  }

  const stats = summaryData?.stats || {};
  const testResults = summaryData?.test_results || [];
  const feedbackList = (summaryData?.feedback || []).slice(0, 3);
  const recommendationsList = (summaryData?.recommendations || []).slice(0, 3);

  // Prepare chart data for test results if available
  const chartData = testResults.map((r: any) => ({
    name: r.subject_name.length > 10 ? r.subject_name.substring(0, 10) + '...' : r.subject_name,
    score: r.percentage
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-sm border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-xs text-gray-300 mt-1">
            Class: <span className="font-semibold text-amber-400">{summaryData?.student?.class_name || 'Unassigned'}</span> | Section: <span className="font-semibold text-amber-400">{summaryData?.student?.section || 'N/A'}</span> | Student ID: <span className="font-semibold text-amber-400">{roleDetails?.student_code || 'STU-NEW'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/student/chat" className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs rounded-lg transition-colors cursor-pointer">
            Message Teacher
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={stats.attendance_percentage !== null ? `${stats.attendance_percentage}%` : null}
          emptyLabel="No attendance records yet"
          icon={CalendarCheck}
          subtext={stats.total_attendance > 0 ? `${stats.present_count} Present / ${stats.absent_count} Absent` : ''}
          color="emerald"
        />
        <StatCard
          title="Academic Performance"
          value={stats.avg_performance !== null ? `${stats.avg_performance}%` : null}
          emptyLabel="No test results yet"
          icon={Award}
          subtext={stats.total_tests > 0 ? `Based on ${stats.total_tests} test(s)` : ''}
          color="amber"
        />
        <StatCard
          title="Teacher Feedback"
          value={stats.feedback_count > 0 ? stats.feedback_count : null}
          emptyLabel="No feedback yet"
          icon={MessageSquareQuote}
          color="blue"
        />
        <StatCard
          title="Action Recommendations"
          value={stats.recommendation_count > 0 ? stats.recommendation_count : null}
          emptyLabel="No recommendations yet"
          icon={Lightbulb}
          color="purple"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Performance Chart & Recent Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Academic Performance Breakdown</h3>
                <p className="text-xs text-gray-500">Test percentage scores by subject</p>
              </div>
              <Link to="/student/tests" className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1">
                View All Tests <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val}%`, 'Score']}
                    />
                    <Bar dataKey="score" fill="#D97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No test results available"
                description="Test scores will automatically appear here once your teachers grade and publish your test marks."
              />
            )}
          </div>

          {/* Teacher Feedback Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Recent Teacher Feedback</h3>
              <Link to="/student/feedback" className="text-xs text-amber-700 font-semibold hover:underline">View All</Link>
            </div>

            {feedbackList.length > 0 ? (
              <div className="space-y-3">
                {feedbackList.map((item: any) => (
                  <div key={item.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-900">{item.category}</span>
                      <span className="text-[10px] text-gray-500">{item.date}</span>
                    </div>
                    <p className="text-xs text-gray-700 italic">"{item.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No feedback available"
                description="Your teachers have not added any feedback notes yet."
              />
            )}
          </div>
        </div>

        {/* Right Col: Announcements & Recommendations */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Recent Announcements</h3>
              </div>
              <Link to="/student/announcements" className="text-xs text-amber-700 font-semibold hover:underline">View All</Link>
            </div>

            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((a: any) => (
                  <div key={a.id} className="p-3 rounded-lg border border-gray-200 bg-amber-50/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900 truncate">{a.title}</span>
                      <StatusBadge status={a.priority} />
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{a.description}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{a.date} • {a.author_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No announcements yet"
                description="Class and school announcements will be listed here."
              />
            )}
          </div>

          {/* Recommendations Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Teacher Recommendations</h3>
              </div>
              <Link to="/student/recommendations" className="text-xs text-amber-700 font-semibold hover:underline">View All</Link>
            </div>

            {recommendationsList.length > 0 ? (
              <div className="space-y-3">
                {recommendationsList.map((rec: any) => (
                  <div key={rec.id} className="p-3 rounded-lg border border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-900">{rec.category}</span>
                      <StatusBadge status={rec.status} />
                    </div>
                    <p className="text-xs text-gray-700">{rec.recommendation}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{rec.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recommendations available"
                description="Personalized study recommendations from teachers will appear here."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
