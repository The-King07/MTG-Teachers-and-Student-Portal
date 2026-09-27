import { Router, Response } from 'express';
import { db, TestRecord, TestResultRecord, NotificationRecord } from '../db';
import { authenticate, requireRoles, AuthRequest } from '../middleware/auth';
import { generateId } from './auth';

const router = Router();

// Create test (Teacher)
router.post('/create', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { test_name, subject_id, class_id, section, date, max_marks, description } = req.body;
  if (!test_name || !subject_id || !class_id || !section || !date || !max_marks) {
    res.status(400).json({ error: 'Test name, subject, class, section, date, and max marks are required.' });
    return;
  }

  const newTest: TestRecord = {
    id: generateId(),
    test_name,
    subject_id,
    class_id,
    section,
    date,
    max_marks: Number(max_marks),
    description: description || '',
    created_by_teacher_id: req.user!.id,
    created_at: new Date().toISOString()
  };

  const tests = db.get('tests');
  tests.push(newTest);
  db.set('tests', tests);

  // Send notification to students in this class/section
  const students = db.get('student_profiles').filter(sp => sp.class_id === class_id && sp.section.toLowerCase() === section.toLowerCase());
  const notifications = db.get('notifications');
  const subjectObj = db.get('subjects').find(s => s.id === subject_id);

  students.forEach(sp => {
    notifications.push({
      id: generateId(),
      user_id: sp.user_id,
      title: 'New Test Scheduled',
      message: `${test_name} for ${subjectObj?.name || 'Subject'} is scheduled on ${date}.`,
      type: 'TEST_SCHEDULED',
      date: new Date().toISOString(),
      is_read: false,
      reference_id: newTest.id
    });
  });
  db.set('notifications', notifications);

  res.status(201).json({ message: 'Test created successfully.', test: newTest });
});

// List tests (filtered by class, section, subject, teacher)
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const { class_id, section, subject_id } = req.query;

  let tests = db.get('tests');
  const subjects = db.get('subjects');
  const classes = db.get('classes');

  if (class_id) {
    tests = tests.filter(t => t.class_id === String(class_id));
  }
  if (section) {
    tests = tests.filter(t => t.section.toLowerCase() === String(section).toLowerCase());
  }
  if (subject_id) {
    tests = tests.filter(t => t.subject_id === String(subject_id));
  }

  const enriched = tests.map(t => {
    const subObj = subjects.find(s => s.id === t.subject_id);
    const classObj = classes.find(c => c.id === t.class_id);
    return {
      ...t,
      subject_name: subObj?.name || 'Subject',
      class_name: classObj?.name || 'Class'
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ tests: enriched });
});

// Get results for a test (Teacher view)
router.get('/:testId/results', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { testId } = req.params;
  const testObj = db.get('tests').find(t => t.id === testId);
  if (!testObj) {
    res.status(404).json({ error: 'Test not found.' });
    return;
  }

  const results = db.get('test_results').filter(tr => tr.test_id === testId);
  const studentsInClass = db.get('student_profiles').filter(
    sp => sp.class_id === testObj.class_id && sp.section.toLowerCase() === testObj.section.toLowerCase()
  );
  const users = db.get('users');

  const studentResultsList = studentsInClass.map(sp => {
    const userObj = users.find(u => u.id === sp.user_id);
    const existingResult = results.find(r => r.student_user_id === sp.user_id);
    return {
      student_user_id: sp.user_id,
      student_name: userObj?.name || 'Student',
      student_code: sp.student_code,
      roll_number: sp.roll_number || '',
      marks_obtained: existingResult ? existingResult.marks_obtained : null,
      percentage: existingResult ? existingResult.percentage : null,
      remarks: existingResult ? existingResult.remarks : ''
    };
  });

  res.json({ test: testObj, studentResults: studentResultsList });
});

// Save/Update student test results (Teacher)
router.post('/:testId/results', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { testId } = req.params;
  const { results } = req.body; // Array of { student_user_id, marks_obtained, remarks }

  const testObj = db.get('tests').find(t => t.id === testId);
  if (!testObj) {
    res.status(404).json({ error: 'Test not found.' });
    return;
  }

  if (!Array.isArray(results)) {
    res.status(400).json({ error: 'Results array is required.' });
    return;
  }

  const allResults = db.get('test_results');
  const notifications = db.get('notifications');
  const links = db.get('parent_student_links');
  const now = new Date().toISOString();

  results.forEach((item: { student_user_id: string; marks_obtained: number; remarks?: string }) => {
    if (item.marks_obtained !== null && item.marks_obtained !== undefined) {
      const percentage = Math.round((Number(item.marks_obtained) / testObj.max_marks) * 100);
      const existingIndex = allResults.findIndex(r => r.test_id === testId && r.student_user_id === item.student_user_id);

      if (existingIndex !== -1) {
        allResults[existingIndex].marks_obtained = Number(item.marks_obtained);
        allResults[existingIndex].percentage = percentage;
        allResults[existingIndex].remarks = item.remarks || '';
        allResults[existingIndex].updated_at = now;
      } else {
        allResults.push({
          id: generateId(),
          test_id: testId,
          student_user_id: item.student_user_id,
          marks_obtained: Number(item.marks_obtained),
          percentage,
          remarks: item.remarks || '',
          created_at: now,
          updated_at: now
        });

        // Notify student & linked parents
        notifications.push({
          id: generateId(),
          user_id: item.student_user_id,
          title: 'Test Marks Published',
          message: `Your score for ${testObj.test_name} is ${item.marks_obtained}/${testObj.max_marks} (${percentage}%).`,
          type: 'RESULT_PUBLISHED',
          date: now,
          is_read: false,
          reference_id: testId
        });

        const parentLinks = links.filter(l => l.student_user_id === item.student_user_id);
        parentLinks.forEach(pl => {
          notifications.push({
            id: generateId(),
            user_id: pl.parent_user_id,
            title: 'Child Test Result Published',
            message: `Result for ${testObj.test_name}: ${item.marks_obtained}/${testObj.max_marks} (${percentage}%).`,
            type: 'RESULT_PUBLISHED',
            date: now,
            is_read: false,
            reference_id: testId
          });
        });
      }
    }
  });

  db.set('test_results', allResults);
  db.set('notifications', notifications);

  res.json({ message: 'Test results saved successfully.' });
});

// Get student's test history (Student / Parent)
router.get('/student/:studentUserId', authenticate, (req: AuthRequest, res: Response): void => {
  const { studentUserId } = req.params;

  // Security check
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
  const tests = db.get('tests');
  const results = db.get('test_results').filter(tr => tr.student_user_id === studentUserId);
  const subjects = db.get('subjects');

  // Filter tests applicable for this student's class & section
  const studentTests = tests.filter(
    t => t.class_id === studentProfile?.class_id && t.section.toLowerCase() === (studentProfile?.section || '').toLowerCase()
  );

  const today = new Date().toISOString().split('T')[0];
  const upcomingTests: any[] = [];
  const completedTests: any[] = [];

  studentTests.forEach(t => {
    const subObj = subjects.find(s => s.id === t.subject_id);
    const result = results.find(r => r.test_id === t.id);

    const testItem = {
      ...t,
      subject_name: subObj?.name || 'Subject',
      marks_obtained: result ? result.marks_obtained : null,
      percentage: result ? result.percentage : null,
      remarks: result ? result.remarks : ''
    };

    if (t.date >= today && !result) {
      upcomingTests.push(testItem);
    } else {
      completedTests.push(testItem);
    }
  });

  res.json({
    upcomingTests: upcomingTests.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    completedTests: completedTests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  });
});

export default router;
