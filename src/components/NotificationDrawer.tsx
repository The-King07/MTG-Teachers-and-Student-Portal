import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, AlertCircle, FileText, CheckCircle2, MessageSquare, Megaphone, Calendar } from 'lucide-react';
import { apiRequest } from '../api/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  is_read: boolean;
  reference_id?: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ unreadCount: number; notifications: Notification[] }>('/notifications');
      setNotifications(res.notifications || []);
      if (onUnreadCountChange) {
        onUnreadCountChange(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      const remainingUnread = notifications.filter(n => n.id !== id && !n.is_read).length;
      if (onUnreadCountChange) onUnreadCountChange(remainingUnread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return <Megaphone className="w-4 h-4 text-amber-600" />;
      case 'TEST_SCHEDULED': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'RESULT_PUBLISHED': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'CHAT_MESSAGE': return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'FEEDBACK': return <FileText className="w-4 h-4 text-indigo-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No notifications yet.</div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`p-3 rounded-lg transition-colors cursor-pointer text-left ${
                  n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-amber-50/50 hover:bg-amber-50 border-l-2 border-amber-500'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-gray-100 rounded-md mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
