import { Router, Response } from 'express';
import { db, FeedbackRecord, NotificationRecord } from '../db';
import { authenticate, requireRoles, AuthRequest } from '../middleware/auth';
import { generateId } from './auth';

const router = Router();

// Create teacher feedback for student (Teacher)
router.post('/create', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { student_user_id, subject_id, category, comment } = req.body;
  if (!student_user_id || !comment || !comment.trim()) {
    res.status(400).json({ error: 'Student and comment are required.' });
    return;
  }

  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  const newFeedback: FeedbackRecord = {
    id: generateId(),
    student_user_id,
    teacher_user_id: req.user!.id,
    subject_id: subject_id || '',
    category: category || 'Academic',
    comment: comment.trim(),
    date: dateStr,
    created_at: now,
    updated_at: now
  };

  const feedbackList = db.get('feedback');
  feedbackList.push(newFeedback);
  db.set('feedback', feedbackList);

  // Send notification to student & linked parents
  const notifications = db.get('notifications');
  const links = db.get('parent_student_links');

  notifications.push({
    id: generateId(),
    user_id: student_user_id,
    title: 'New Feedback from Teacher',
    message: `${req.user!.name} added feedback: "${comment.length > 80 ? comment.substring(0, 80) + '...' : comment}"`,
    type: 'FEEDBACK',
    date: now,
    is_read: false,
    reference_id: newFeedback.id
  });

  const parentLinks = links.filter(l => l.student_user_id === student_user_id);
  parentLinks.forEach(pl => {
    notifications.push({
      id: generateId(),
      user_id: pl.parent_user_id,
      title: 'Teacher Feedback for Child',
      message: `${req.user!.name} added feedback: "${comment.length > 80 ? comment.substring(0, 80) + '...' : comment}"`,
      type: 'FEEDBACK',
      date: now,
      is_read: false,
      reference_id: newFeedback.id
    });
  });

  db.set('notifications', notifications);
  res.status(201).json({ message: 'Feedback saved successfully.', feedback: newFeedback });
});

// Edit feedback (Teacher who created it)
router.put('/:id', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { comment, category, subject_id } = req.body;

  const feedbackList = db.get('feedback');
  const index = feedbackList.findIndex(f => f.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Feedback record not found.' });
    return;
  }

  if (feedbackList[index].teacher_user_id !== req.user!.id) {
    res.status(403).json({ error: 'Unauthorized to edit another teacher\'s feedback.' });
    return;
  }

  if (comment) feedbackList[index].comment = comment.trim();
  if (category) feedbackList[index].category = category;
  if (subject_id !== undefined) feedbackList[index].subject_id = subject_id;
  feedbackList[index].updated_at = new Date().toISOString();

  db.set('feedback', feedbackList);
  res.json({ message: 'Feedback updated successfully.', feedback: feedbackList[index] });
});

// Delete feedback (Teacher who created it)
router.delete('/:id', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  let feedbackList = db.get('feedback');
  const target = feedbackList.find(f => f.id === id);

  if (!target) {
    res.status(404).json({ error: 'Feedback record not found.' });
    return;
  }

  if (target.teacher_user_id !== req.user!.id) {
    res.status(403).json({ error: 'Unauthorized to delete another teacher\'s feedback.' });
    return;
  }

  feedbackList = feedbackList.filter(f => f.id !== id);
  db.set('feedback', feedbackList);
  res.json({ message: 'Feedback deleted successfully.' });
});

// Get feedback for a student (Student / Parent / Teacher)
router.get('/student/:studentUserId', authenticate, (req: AuthRequest, res: Response): void => {
  const { studentUserId } = req.params;

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

  const feedbackList = db.get('feedback').filter(f => f.student_user_id === studentUserId);
  const teachers = db.get('users');
  const subjects = db.get('subjects');

  const enriched = feedbackList.map(f => {
    const teacher = teachers.find(u => u.id === f.teacher_user_id);
    const subject = subjects.find(s => s.id === f.subject_id);
    return {
      ...f,
      teacher_name: teacher?.name || 'Teacher',
      subject_name: subject?.name || 'General'
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ feedback: enriched });
});

export default router;
