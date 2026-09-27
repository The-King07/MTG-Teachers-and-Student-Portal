import { Router, Response } from 'express';
import { db, AttendanceRecord } from '../db';
import { authenticate, requireRoles, AuthRequest } from '../middleware/auth';
import { generateId } from './auth';

const router = Router();

// Mark or bulk update attendance for a class & section on a date (Teacher)
router.post('/mark', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { class_id, section, subject_id, date, records } = req.body;
  // records: Array of { student_user_id: string, status: 'PRESENT' | 'ABSENT' }

  if (!class_id || !section || !date || !Array.isArray(records)) {
    res.status(400).json({ error: 'Class, section, date, and student attendance records are required.' });
    return;
  }

  const attendance = db.get('attendance');
  const now = new Date().toISOString();

  records.forEach((rec: { student_user_id: string; status: 'PRESENT' | 'ABSENT' }) => {
    // Check if record exists for this student, class, section, subject, date
    const existingIndex = attendance.findIndex(
      a => a.student_user_id === rec.student_user_id &&
           a.class_id === class_id &&
           a.section.toLowerCase() === section.toLowerCase() &&
           a.date === date &&
           (subject_id ? a.subject_id === subject_id : true)
    );

    if (existingIndex !== -1) {
      attendance[existingIndex].status = rec.status;
      attendance[existingIndex].updated_at = now;
      attendance[existingIndex].marked_by_teacher_id = req.user!.id;
    } else {
      attendance.push({
        id: generateId(),
        student_user_id: rec.student_user_id,
        class_id,
        section,
        subject_id: subject_id || '',
        date,
        status: rec.status,
        marked_by_teacher_id: req.user!.id,
        created_at: now,
        updated_at: now
      });
    }
  });

  db.set('attendance', attendance);
  res.json({ message: 'Attendance records saved successfully.' });
});

// Get attendance for a class, section, subject on a specific date (for Teacher UI grid)
router.get('/class-date', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { class_id, section, subject_id, date } = req.query;
  if (!class_id || !section || !date) {
    res.status(400).json({ error: 'Class, section, and date are required.' });
    return;
  }

  const attendance = db.get('attendance').filter(
    a => a.class_id === String(class_id) &&
         a.section.toLowerCase() === String(section).toLowerCase() &&
         a.date === String(date) &&
         (subject_id ? a.subject_id === String(subject_id) : true)
  );

  res.json({ attendance });
});

// Get detailed attendance report for a student (Student / Parent / Teacher)
router.get('/student/:studentUserId', authenticate, (req: AuthRequest, res: Response): void => {
  const { studentUserId } = req.params;

  // Authorization check
  if (req.user!.role === 'STUDENT' && req.user!.id !== studentUserId) {
    res.status(403).json({ error: 'Access denied to another student\'s attendance.' });
    return;
  }
  if (req.user!.role === 'PARENT') {
    const isLinked = db.get('parent_student_links').some(l => l.parent_user_id === req.user!.id && l.student_user_id === studentUserId);
    if (!isLinked) {
      res.status(403).json({ error: 'Access denied to unlinked child\'s attendance.' });
      return;
    }
  }

  const studentAttendance = db.get('attendance').filter(a => a.student_user_id === studentUserId);
  const total = studentAttendance.length;
  const present = studentAttendance.filter(a => a.status === 'PRESENT').length;
  const absent = studentAttendance.filter(a => a.status === 'ABSENT').length;
  const overallPercentage = total > 0 ? Math.round((present / total) * 100) : null;

  // Subject-wise attendance calculation
  const subjects = db.get('subjects');
  const subjectBreakdownMap: Record<string, { subject_name: string; subject_code: string; present: number; absent: number; total: number; percentage: number | null }> = {};

  studentAttendance.forEach(rec => {
    const subId = rec.subject_id || 'general';
    const subObj = subjects.find(s => s.id === subId);
    const subName = subObj ? subObj.name : (rec.subject_id ? 'Subject' : 'General');
    const subCode = subObj ? subObj.code : 'GEN';

    if (!subjectBreakdownMap[subId]) {
      subjectBreakdownMap[subId] = {
        subject_name: subName,
        subject_code: subCode,
        present: 0,
        absent: 0,
        total: 0,
        percentage: null
      };
    }

    subjectBreakdownMap[subId].total += 1;
    if (rec.status === 'PRESENT') {
      subjectBreakdownMap[subId].present += 1;
    } else {
      subjectBreakdownMap[subId].absent += 1;
    }
  });

  const subjectBreakdown = Object.values(subjectBreakdownMap).map(item => ({
    ...item,
    percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : null
  }));

  // Absent dates list
  const absentRecords = studentAttendance
    .filter(a => a.status === 'ABSENT')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    summary: {
      total,
      present,
      absent,
      percentage: overallPercentage
    },
    subjectBreakdown,
    absentRecords,
    history: studentAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  });
});

export default router;
