import { Router, Response } from 'express';
import { db } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get students list with search and filters (Teacher / Admin)
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const { class_id, section, subject_id, search, requires_attention } = req.query;

  const users = db.get('users').filter(u => u.role === 'STUDENT');
  const profiles = db.get('student_profiles');
  const classes = db.get('classes');
  const attendanceRecords = db.get('attendance');
  const testResults = db.get('test_results');

  let list = users.map(user => {
    const profile = profiles.find(sp => sp.user_id === user.id);
    const classObj = classes.find(c => c.id === profile?.class_id);

    // Calculate attendance % for this student
    const studentAttendance = attendanceRecords.filter(a => a.student_user_id === user.id);
    const totalAtt = studentAttendance.length;
    const presentAtt = studentAttendance.filter(a => a.status === 'PRESENT').length;
    const attendancePercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : null;

    // Calculate academic performance % for this student
    const studentResults = testResults.filter(tr => tr.student_user_id === user.id);
    const avgPerformance = studentResults.length > 0
      ? Math.round(studentResults.reduce((acc, r) => acc + r.percentage, 0) / studentResults.length)
      : null;

    const { password, ...userWithoutPass } = user;
    return {
      ...userWithoutPass,
      profile,
      class_name: classObj?.name || 'Unassigned',
      class_id: profile?.class_id || '',
      section: profile?.section || '',
      attendance_percentage: attendancePercentage,
      attendance_total: totalAtt,
      avg_performance: avgPerformance,
      total_tests: studentResults.length
    };
  });

  // Apply filters
  if (class_id) {
    list = list.filter(s => s.class_id === String(class_id));
  }

  if (section) {
    list = list.filter(s => s.section.toLowerCase() === String(section).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      (s.profile?.student_code && s.profile.student_code.toLowerCase().includes(q))
    );
  }

  // Filter students requiring attention (attendance < 75% OR performance < 50%)
  if (requires_attention === 'true') {
    list = list.filter(s =>
      (s.attendance_percentage !== null && s.attendance_percentage < 75) ||
      (s.avg_performance !== null && s.avg_performance < 50)
    );
  }

  res.json({ students: list });
});

// Get detailed student profile and performance summary
router.get('/:studentUserId/summary', authenticate, (req: AuthRequest, res: Response): void => {
  const { studentUserId } = req.params;

  // Authorization check: Student can view own summary; Parent can view linked child summary; Teacher can view any student summary
  if (req.user!.role === 'STUDENT' && req.user!.id !== studentUserId) {
    res.status(403).json({ error: 'Unauthorized to view another student\'s record.' });
    return;
  }
  if (req.user!.role === 'PARENT') {
    const links = db.get('parent_student_links');
    const isLinked = links.some(l => l.parent_user_id === req.user!.id && l.student_user_id === studentUserId);
    if (!isLinked) {
      res.status(403).json({ error: 'Unauthorized to view unlinked student record.' });
      return;
    }
  }

  const studentUser = db.get('users').find(u => u.id === studentUserId);
  if (!studentUser || studentUser.role !== 'STUDENT') {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const profile = db.get('student_profiles').find(sp => sp.user_id === studentUserId);
  const classObj = db.get('classes').find(c => c.id === profile?.class_id);

  // Attendance stats
  const attendance = db.get('attendance').filter(a => a.student_user_id === studentUserId);
  const totalAtt = attendance.length;
  const presentAtt = attendance.filter(a => a.status === 'PRESENT').length;
  const absentAtt = attendance.filter(a => a.status === 'ABSENT').length;
  const attendancePercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : null;

  // Test stats
  const results = db.get('test_results').filter(tr => tr.student_user_id === studentUserId);
  const tests = db.get('tests');
  const subjects = db.get('subjects');

  const detailedResults = results.map(r => {
    const testObj = tests.find(t => t.id === r.test_id);
    const subObj = subjects.find(s => s.id === testObj?.subject_id);
    return {
      ...r,
      test_name: testObj?.test_name || 'Test',
      max_marks: testObj?.max_marks || 100,
      test_date: testObj?.date || '',
      subject_name: subObj?.name || 'Subject'
    };
  });

  const avgPerformance = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
    : null;

  // Feedback & Recommendations
  const feedback = db.get('feedback').filter(f => f.student_user_id === studentUserId);
  const recommendations = db.get('recommendations').filter(r => r.student_user_id === studentUserId);

  const { password, ...userWithoutPass } = studentUser;

  res.json({
    student: {
      ...userWithoutPass,
      profile,
      class_name: classObj?.name || 'Unassigned',
      section: profile?.section || ''
    },
    stats: {
      attendance_percentage: attendancePercentage,
      total_attendance: totalAtt,
      present_count: presentAtt,
      absent_count: absentAtt,
      avg_performance: avgPerformance,
      total_tests: results.length,
      feedback_count: feedback.length,
      recommendation_count: recommendations.length
    },
    test_results: detailedResults,
    feedback,
    recommendations
  });
});

export default router;
