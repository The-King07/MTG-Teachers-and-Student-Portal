import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { GraduationCap, CalendarCheck, Award, MessageSquareQuote, Lightbulb, Megaphone, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router';

export const ParentDashboard: React.FC = () => {
  const { user, children, activeChild, setActiveChild } = useAuth();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChildSummary = async () => {
    if (!activeChild) {
      setSummaryData(null);
      return;
    }

    try {
      setLoading(true);
      const [sumRes, annRes] = await Promise.all([
        apiRequest(`/students/${activeChild.id}/summary`),
        apiRequest('/announcements')
      ]);
      setSummaryData(sumRes);
      setAnnouncements((annRes.announcements || []).slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildSummary();
  }, [activeChild]);

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-xs text-gray-500">Academic monitoring and communication platform</p>
        </div>
        <EmptyState
          title="No children linked to your account"
          description="To view academic performance, attendance, and feedback, please link your child using their unique Student Code."
          actionText="Link Child Account"
          onAction={() => window.location.href = '/parent/children'}
        />
      </div>
    );
  }

  const stats = summaryData?.stats || {};
  const feedbackList = (summaryData?.feedback || []).slice(0, 3);
  const recommendationsList = (summaryData?.recommendations || []).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner & Child Selector */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xs border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold">Parent Portal — Monitoring {activeChild?.name}</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Class: <span className="font-semibold text-amber-400">{activeChild?.class_name || 'Unassigned'}</span> | Student Code: <span className="font-semibold text-amber-400">{activeChild?.profile?.student_code || 'STU-1001'}</span>
          </p>
        </div>

        {children.length > 1 && (
          <div className="bg-gray-800 border border-gray-700 p-2 rounded-xl text-xs flex items-center gap-2">
            <span className="text-gray-300 font-semibold">Switch Child:</span>
            <select
              value={activeChild?.id || ''}
              onChange={(e) => {
                const c = children.find(ch => ch.id === e.target.value);
                if (c) setActiveChild(c);
              }}
              className="bg-gray-900 text-amber-400 font-bold border border-gray-700 rounded-lg px-2.5 py-1 outline-none cursor-pointer"
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">Loading child summary records...</div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Attendance Percentage"
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
              subtext={stats.total_tests > 0 ? `Evaluated on ${stats.total_tests} test(s)` : ''}
              color="amber"
            />
            <StatCard
              title="Teacher Feedback Notes"
              value={stats.feedback_count > 0 ? stats.feedback_count : null}
              emptyLabel="No feedback notes yet"
              icon={MessageSquareQuote}
              color="blue"
            />
            <StatCard
              title="Recommendations"
              value={stats.recommendation_count > 0 ? stats.recommendation_count : null}
              emptyLabel="No recommendations yet"
              icon={Lightbulb}
              color="purple"
            />
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Feedback */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Teacher Observations & Feedback</h3>
                  <Link to="/parent/feedback" className="text-xs text-amber-700 font-semibold hover:underline">View All</Link>
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
                  <EmptyState title="No feedback notes available" description="Teachers have not added feedback for your child yet." />
                )}
              </div>
            </div>

            {/* Right Col: Recommendations & Announcements */}
            <div className="space-y-6">
              {/* Recommendations Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-gray-900">Academic Recommendations</h3>
                  </div>
                  <Link to="/parent/recommendations" className="text-xs text-amber-700 font-semibold hover:underline">View All</Link>
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No recommendations available" description="Academic guidance notes from teachers will appear here." />
                )}
              </div>

              {/* Announcements Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-gray-900">School Announcements</h3>
                  </div>
                  <Link to="/parent/announcements" className="text-xs text-amber-700 font-semibold hover:underline">View All</Link>
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
                        <p className="text-[10px] text-gray-400 mt-2">{a.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No announcements" description="School announcements will be listed here." />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
