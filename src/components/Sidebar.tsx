import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  MessageSquare,
  Megaphone,
  History,
  MessageSquareQuote,
  Lightbulb,
  Bell,
  User,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { label: 'Tests & Results', path: '/student/tests', icon: FileCheck2 },
    { label: 'Chat', path: '/student/chat', icon: MessageSquare },
    { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
    { label: 'Academic History', path: '/student/history', icon: History },
    { label: 'Teacher Feedback', path: '/student/feedback', icon: MessageSquareQuote },
    { label: 'Recommendations', path: '/student/recommendations', icon: Lightbulb },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'Profile', path: '/student/profile', icon: User },
  ];

  const teacherLinks = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Classes & Subjects', path: '/teacher/classes', icon: BookOpen },
    { label: 'Students', path: '/teacher/students', icon: Users },
    { label: 'Mark Attendance', path: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Create Tests', path: '/teacher/tests', icon: FileCheck2 },
    { label: 'Enter Results', path: '/teacher/results', icon: Award },
    { label: 'Chat Messages', path: '/teacher/chat', icon: MessageSquare },
    { label: 'Announcements', path: '/teacher/announcements', icon: Megaphone },
    { label: 'Add Feedback', path: '/teacher/feedback', icon: MessageSquareQuote },
    { label: 'Recommendations', path: '/teacher/recommendations', icon: Lightbulb },
    { label: 'Notifications', path: '/teacher/notifications', icon: Bell },
    { label: 'Profile', path: '/teacher/profile', icon: User },
  ];

  const parentLinks = [
    { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'My Children', path: '/parent/children', icon: GraduationCap },
    { label: 'Attendance', path: '/parent/attendance', icon: CalendarCheck },
    { label: 'Tests & Results', path: '/parent/tests', icon: FileCheck2 },
    { label: 'Academic History', path: '/parent/history', icon: History },
    { label: 'Teacher Feedback', path: '/parent/feedback', icon: MessageSquareQuote },
    { label: 'Recommendations', path: '/parent/recommendations', icon: Lightbulb },
    { label: 'Announcements', path: '/parent/announcements', icon: Megaphone },
    { label: 'Notifications', path: '/parent/notifications', icon: Bell },
    { label: 'Profile', path: '/parent/profile', icon: User },
  ];

  const links = role === 'TEACHER' ? teacherLinks : role === 'PARENT' ? parentLinks : studentLinks;

  const roleBadgeColor = {
    STUDENT: 'bg-blue-100 text-blue-800 border-blue-200',
    TEACHER: 'bg-amber-100 text-amber-900 border-amber-300',
    PARENT: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const navContent = (
    <div className="h-full flex flex-col justify-between bg-gray-900 text-white w-64 border-r border-gray-800">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Make The Grade Logo"
              className="w-10 h-10 rounded-full border border-amber-400 object-cover shadow-sm"
              onError={(e) => {
                // Fallback if logo png path differs
                (e.target as HTMLImageElement).src = '/logo.jpg';
              }}
            />
            <div>
              <h1 className="font-bold text-sm tracking-wide text-amber-400 uppercase">Make The Grade</h1>
              <p className="text-[10px] text-gray-400 tracking-wider">LEARNING MADE SIMPLE</p>
            </div>
          </div>
          {onMobileClose && (
            <button onClick={onMobileClose} className="md:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Role Pill */}
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-200 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor[user.role]}`}>
            {user.role}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => onMobileClose && onMobileClose()}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-gray-950 font-semibold shadow-xs'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gray-950' : 'text-gray-400'}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-gray-950" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Logout */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="relative z-10">{navContent}</div>
        </div>
      )}
    </>
  );
};
