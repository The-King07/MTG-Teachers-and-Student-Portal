import { Router, Response } from 'express';
import { db } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get aggregated academic timeline history for a student
router.get('/student/:studentUserId', authenticate, (req: AuthRequest, res: Response): void => {
  const { studentUserId } = req.params;
  const { subject_id, start_date, end_date, category } = req.query;

  // Authorization check
  if (req.user!.role === 'STUDENT' && req.user!.id !== studentUserId) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }
  if (req.user!.role === 'PARENT') {
    const isLinked = db.get('parent_student_links').some(l => l.parent_user_id === req.user!.id && l.student_user_id === studentUserId);
    if (!isLinked) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }
  }

  const studentProfile = db.get('student_profiles').find(sp => sp.user_id === studentUserId);
  const subjects = db.get('subjects');
  const teachers = db.get('users');

  const timelineEvents: Array<{
    id: string;
    type: 'ATTENDANCE' | 'TEST_RESULT' | 'FEEDBACK' | 'RECOMMENDATION' | 'ANNOUNCEMENT';
    title: string;
    description: string;
    date: string;
    timestamp: string;
    subject_id?: string;
    subject_name?: string;
    author_name?: string;
    status_badge?: string;
    badge_variant?: 'success' | 'warning' | 'danger' | 'info';
    meta?: any;
  }> = [];

  // 1. Attendance Events
  const attendance = db.get('attendance').filter(a => a.student_user_id === studentUserId);
  attendance.forEach(a => {
    const subObj = subjects.find(s => s.id === a.subject_id);
    timelineEvents.push({
      id: a.id,
      type: 'ATTENDANCE',
      title: a.status === 'PRESENT' ? 'Marked Present' : 'Absence Recorded',
      description: `Attendance logged for ${subObj ? subObj.name : 'Class'} on ${a.date}`,
      date: a.date,
      timestamp: a.created_at,
      subject_id: a.subject_id,
      subject_name: subObj?.name || 'General',
      status_badge: a.status,
      badge_variant: a.status === 'PRESENT' ? 'success' : 'danger'
    });
  });

  // 2. Test Results Events
  const testResults = db.get('test_results').filter(tr => tr.student_user_id === studentUserId);
  const tests = db.get('tests');
  testResults.forEach(tr => {
    const testObj = tests.find(t => t.id === tr.test_id);
    const subObj = subjects.find(s => s.id === testObj?.subject_id);
    timelineEvents.push({
      id: tr.id,
      type: 'TEST_RESULT',
      title: `Test Score: ${testObj?.test_name || 'Exam'}`,
      description: `Scored ${tr.marks_obtained}/${testObj?.max_marks || 100} (${tr.percentage}%). ${tr.remarks ? 'Remarks: ' + tr.remarks : ''}`,
      date: testObj?.date || tr.created_at.split('T')[0],
      timestamp: tr.created_at,
      subject_id: testObj?.subject_id,
      subject_name: subObj?.name || 'Subject',
      status_badge: `${tr.percentage}%`,
      badge_variant: tr.percentage >= 75 ? 'success' : tr.percentage >= 50 ? 'warning' : 'danger',
      meta: { marks: tr.marks_obtained, max_marks: testObj?.max_marks, percentage: tr.percentage }
    });
  });

  // 3. Teacher Feedback Events
  const feedback = db.get('feedback').filter(f => f.student_user_id === studentUserId);
  feedback.forEach(f => {
    const teacher = teachers.find(u => u.id === f.teacher_user_id);
    const subObj = subjects.find(s => s.id === f.subject_id);
    timelineEvents.push({
      id: f.id,
      type: 'FEEDBACK',
      title: `Teacher Feedback (${f.category})`,
      description: f.comment,
      date: f.date,
      timestamp: f.created_at,
      subject_id: f.subject_id,
      subject_name: subObj?.name || 'General',
      author_name: teacher?.name || 'Teacher',
      status_badge: f.category,
      badge_variant: 'info'
    });
  });

  // 4. Recommendations
  const recommendations = db.get('recommendations').filter(r => r.student_user_id === studentUserId);
  recommendations.forEach(r => {
    const teacher = teachers.find(u => u.id === r.teacher_user_id);
    timelineEvents.push({
      id: r.id,
      type: 'RECOMMENDATION',
      title: `Recommendation: ${r.category}`,
      description: r.recommendation,
      date: r.date,
      timestamp: r.created_at,
      author_name: teacher?.name || 'Teacher',
      status_badge: r.status,
      badge_variant: r.status === 'COMPLETED' ? 'success' : r.status === 'IN_PROGRESS' ? 'warning' : 'info'
    });
  });

  // 5. Announcements applicable to student
  const announcements = db.get('announcements').filter(a => {
    const matchClass = !a.target_class_id || a.target_class_id === studentProfile?.class_id;
    const matchSection = !a.target_section || a.target_section.toLowerCase() === (studentProfile?.section || '').toLowerCase();
    return matchClass && matchSection;
  });
  announcements.forEach(a => {
    const author = teachers.find(u => u.id === a.created_by_teacher_id);
    const subObj = subjects.find(s => s.id === a.subject_id);
    timelineEvents.push({
      id: a.id,
      type: 'ANNOUNCEMENT',
      title: `Announcement: ${a.title}`,
      description: a.description,
      date: a.date,
      timestamp: a.created_at,
      subject_id: a.subject_id,
      subject_name: subObj?.name,
      author_name: author?.name || 'School',
      status_badge: a.priority,
      badge_variant: a.priority === 'IMPORTANT' ? 'danger' : 'info'
    });
  });

  // Apply filters
  let filtered = timelineEvents;

  if (subject_id) {
    filtered = filtered.filter(e => e.subject_id === String(subject_id));
  }

  if (start_date) {
    filtered = filtered.filter(e => e.date >= String(start_date));
  }

  if (end_date) {
    filtered = filtered.filter(e => e.date <= String(end_date));
  }

  if (category) {
    filtered = filtered.filter(e => e.type.toLowerCase() === String(category).toLowerCase());
  }

  // Sort chronologically (newest first)
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({ events: filtered });
});

export default router;
