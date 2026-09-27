import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { Bell, CheckCheck, Megaphone, Calendar, CheckCircle2, MessageSquare, FileText } from 'lucide-react';

export const StudentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/notifications');
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-xs text-gray-500">Real-time alerts for tests, results, announcements, and messages</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3 transition-colors ${
                n.is_read ? 'bg-white' : 'bg-amber-50/40 border-l-4 border-amber-500'
              }`}
            >
              <div className="p-2 bg-gray-100 rounded-lg shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900">{n.title}</h3>
                  <span className="text-[10px] text-gray-400">{new Date(n.date).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No notifications" description="You have no notifications or event alerts at this time." />
      )}
    </div>
  );
};
