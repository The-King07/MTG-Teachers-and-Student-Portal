import React, { useState, useEffect } from 'react';
import { Menu, Bell, User as UserIcon, ChevronDown, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';
import { apiRequest } from '../api/client';

interface HeaderProps {
  onMobileMenuOpen: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuOpen, title }) => {
  const { user, children, activeChild, setActiveChild } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await apiRequest<{ unreadCount: number }>('/notifications');
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        {/* Left: Mobile Menu & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
              {title || 'Make The Grade'}
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">Academic Portal</p>
          </div>
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Parent Child Switcher Dropdown */}
          {user.role === 'PARENT' && children.length > 0 && (
            <div className="relative flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs">
              <GraduationCap className="w-4 h-4 text-amber-700" />
              <span className="text-gray-600 font-medium hidden sm:inline">Active Child:</span>
              <select
                value={activeChild?.id || ''}
                onChange={(e) => {
                  const selected = children.find(c => c.id === e.target.value);
                  if (selected) setActiveChild(selected);
                }}
                className="bg-transparent font-semibold text-amber-900 border-none outline-none cursor-pointer pr-2"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({child.class_name || 'Student'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-900 leading-none">{user.name}</p>
              <p className="text-[10px] font-medium text-amber-700 mt-0.5 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />
    </>
  );
};
