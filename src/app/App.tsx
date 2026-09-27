import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { RoleGuard } from '../components/RoleGuard';

// Pages
import { AuthPage } from '../pages/AuthPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentAttendance } from '../pages/student/StudentAttendance';
import { StudentTests } from '../pages/student/StudentTests';
import { StudentChat } from '../pages/student/StudentChat';
import { StudentAnnouncements } from '../pages/student/StudentAnnouncements';
import { StudentHistory } from '../pages/student/StudentHistory';
import { StudentFeedback } from '../pages/student/StudentFeedback';
import { StudentRecommendations } from '../pages/student/StudentRecommendations';
import { StudentNotifications } from '../pages/student/StudentNotifications';
import { StudentProfile } from '../pages/student/StudentProfile';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { TeacherClasses } from '../pages/teacher/TeacherClasses';
import { TeacherStudents } from '../pages/teacher/TeacherStudents';
import { TeacherAttendance } from '../pages/teacher/TeacherAttendance';
import { TeacherTests } from '../pages/teacher/TeacherTests';
import { TeacherResults } from '../pages/teacher/TeacherResults';
import { TeacherChat } from '../pages/teacher/TeacherChat';
import { TeacherAnnouncements } from '../pages/teacher/TeacherAnnouncements';
import { TeacherFeedback } from '../pages/teacher/TeacherFeedback';
import { TeacherRecommendations } from '../pages/teacher/TeacherRecommendations';
import { TeacherNotifications } from '../pages/teacher/TeacherNotifications';
import { TeacherProfile } from '../pages/teacher/TeacherProfile';

// Parent Pages
import { ParentDashboard } from '../pages/parent/ParentDashboard';
import { ParentChildren } from '../pages/parent/ParentChildren';
import { ParentAttendance } from '../pages/parent/ParentAttendance';
import { ParentTests } from '../pages/parent/ParentTests';
import { ParentHistory } from '../pages/parent/ParentHistory';
import { ParentFeedback } from '../pages/parent/ParentFeedback';
import { ParentRecommendations } from '../pages/parent/ParentRecommendations';
import { ParentAnnouncements } from '../pages/parent/ParentAnnouncements';
import { ParentNotifications } from '../pages/parent/ParentNotifications';
import { ParentProfile } from '../pages/parent/ParentProfile';

const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (!user) {
    return <>{children}</>;
  }

  // Derive human readable page title from current path
  const path = location.pathname;
  let title = 'Make The Grade';
  if (path.includes('dashboard')) title = 'Dashboard';
  else if (path.includes('attendance')) title = 'Attendance Management';
  else if (path.includes('tests')) title = 'Tests & Examinations';
  else if (path.includes('results')) title = 'Enter Test Results';
  else if (path.includes('classes')) title = 'Classes & Subjects';
  else if (path.includes('students')) title = 'Student Directory';
  else if (path.includes('children')) title = 'My Children';
  else if (path.includes('chat')) title = 'Academic Communication';
  else if (path.includes('announcements')) title = 'Announcements';
  else if (path.includes('history')) title = 'Academic History';
  else if (path.includes('feedback')) title = 'Teacher Feedback';
  else if (path.includes('recommendations')) title = 'Action Recommendations';
  else if (path.includes('notifications')) title = 'Notifications';
  else if (path.includes('profile')) title = 'User Profile';

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900">
      <Sidebar isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} title={title} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutShell>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<RoleGuard allowedRoles={['STUDENT']}><StudentDashboard /></RoleGuard>} />
            <Route path="/student/attendance" element={<RoleGuard allowedRoles={['STUDENT']}><StudentAttendance /></RoleGuard>} />
            <Route path="/student/tests" element={<RoleGuard allowedRoles={['STUDENT']}><StudentTests /></RoleGuard>} />
            <Route path="/student/chat" element={<RoleGuard allowedRoles={['STUDENT']}><StudentChat /></RoleGuard>} />
            <Route path="/student/announcements" element={<RoleGuard allowedRoles={['STUDENT']}><StudentAnnouncements /></RoleGuard>} />
            <Route path="/student/history" element={<RoleGuard allowedRoles={['STUDENT']}><StudentHistory /></RoleGuard>} />
            <Route path="/student/feedback" element={<RoleGuard allowedRoles={['STUDENT']}><StudentFeedback /></RoleGuard>} />
            <Route path="/student/recommendations" element={<RoleGuard allowedRoles={['STUDENT']}><StudentRecommendations /></RoleGuard>} />
            <Route path="/student/notifications" element={<RoleGuard allowedRoles={['STUDENT']}><StudentNotifications /></RoleGuard>} />
            <Route path="/student/profile" element={<RoleGuard allowedRoles={['STUDENT']}><StudentProfile /></RoleGuard>} />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherDashboard /></RoleGuard>} />
            <Route path="/teacher/classes" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherClasses /></RoleGuard>} />
            <Route path="/teacher/students" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherStudents /></RoleGuard>} />
            <Route path="/teacher/attendance" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherAttendance /></RoleGuard>} />
            <Route path="/teacher/tests" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherTests /></RoleGuard>} />
            <Route path="/teacher/results" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherResults /></RoleGuard>} />
            <Route path="/teacher/chat" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherChat /></RoleGuard>} />
            <Route path="/teacher/announcements" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherAnnouncements /></RoleGuard>} />
            <Route path="/teacher/feedback" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherFeedback /></RoleGuard>} />
            <Route path="/teacher/recommendations" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherRecommendations /></RoleGuard>} />
            <Route path="/teacher/notifications" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherNotifications /></RoleGuard>} />
            <Route path="/teacher/profile" element={<RoleGuard allowedRoles={['TEACHER']}><TeacherProfile /></RoleGuard>} />

            {/* Parent Routes */}
            <Route path="/parent/dashboard" element={<RoleGuard allowedRoles={['PARENT']}><ParentDashboard /></RoleGuard>} />
            <Route path="/parent/children" element={<RoleGuard allowedRoles={['PARENT']}><ParentChildren /></RoleGuard>} />
            <Route path="/parent/attendance" element={<RoleGuard allowedRoles={['PARENT']}><ParentAttendance /></RoleGuard>} />
            <Route path="/parent/tests" element={<RoleGuard allowedRoles={['PARENT']}><ParentTests /></RoleGuard>} />
            <Route path="/parent/history" element={<RoleGuard allowedRoles={['PARENT']}><ParentHistory /></RoleGuard>} />
            <Route path="/parent/feedback" element={<RoleGuard allowedRoles={['PARENT']}><ParentFeedback /></RoleGuard>} />
            <Route path="/parent/recommendations" element={<RoleGuard allowedRoles={['PARENT']}><ParentRecommendations /></RoleGuard>} />
            <Route path="/parent/announcements" element={<RoleGuard allowedRoles={['PARENT']}><ParentAnnouncements /></RoleGuard>} />
            <Route path="/parent/notifications" element={<RoleGuard allowedRoles={['PARENT']}><ParentNotifications /></RoleGuard>} />
            <Route path="/parent/profile" element={<RoleGuard allowedRoles={['PARENT']}><ParentProfile /></RoleGuard>} />

            {/* Default Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </LayoutShell>
      </AuthProvider>
    </BrowserRouter>
  );
}
