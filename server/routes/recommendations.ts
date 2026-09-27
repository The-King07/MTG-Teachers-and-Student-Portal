import { Router, Response } from 'express';
import { db, RecommendationRecord, NotificationRecord } from '../db';
import { authenticate, requireRoles, AuthRequest } from '../middleware/auth';
import { generateId } from './auth';

const router = Router();

// Teacher creates recommendation for student
router.post('/create', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { student_user_id, recommendation, category } = req.body;
  if (!student_user_id || !recommendation || !recommendation.trim()) {
    res.status(400).json({ error: 'Student and recommendation text are required.' });
    return;
  }

  const now = new Date().toISOString();
  const newRec: RecommendationRecord = {
    id: generateId(),
    student_user_id,
    teacher_user_id: req.user!.id,
    recommendation: recommendation.trim(),
    category: category || 'Academic Practice',
    date: now.split('T')[0],
    status: 'NEW',
    created_at: now,
    updated_at: now
  };

  const list = db.get('recommendations');
  list.push(newRec);
  db.set('recommendations', list);

  // Send notifications
  const notifications = db.get('notifications');
  const links = db.get('parent_student_links');

  notifications.push({
    id: generateId(),
    user_id: student_user_id,
    title: 'New Academic Recommendation',
    message: `${req.user!.name}: "${recommendation}"`,
    type: 'RECOMMENDATION',
    date: now,
    is_read: false,
    reference_id: newRec.id
  });

  const parentLinks = links.filter(l => l.student_user_id === student_user_id);
  parentLinks.forEach(pl => {
    notifications.push({
      id: generateId(),
      user_id: pl.parent_user_id,
      title: 'New Recommendation for Child',
      message: `${req.user!.name}: "${recommendation}"`,
      type: 'RECOMMENDATION',
      date: now,
      is_read: false,
      reference_id: newRec.id
    });
  });

  db.set('notifications', notifications);
  res.status(201).json({ message: 'Recommendation created successfully.', recommendation: newRec });
});

// Update recommendation status (Student or Teacher)
router.patch('/:id/status', authenticate, (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['NEW', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status value.' });
    return;
  }

  const list = db.get('recommendations');
  const index = list.findIndex(r => r.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Recommendation not found.' });
    return;
  }

  const rec = list[index];

  // Authorization: Student who received it or Teacher who created it can update status
  if (req.user!.role === 'STUDENT' && rec.student_user_id !== req.user!.id) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }
  if (req.user!.role === 'PARENT') {
    res.status(403).json({ error: 'Parents cannot modify recommendation status.' });
    return;
  }

  list[index].status = status;
  list[index].updated_at = new Date().toISOString();
  db.set('recommendations', list);

  res.json({ message: 'Status updated successfully.', recommendation: list[index] });
});

// Get recommendations for a student (Student / Parent / Teacher)
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

  const list = db.get('recommendations').filter(r => r.student_user_id === studentUserId);
  const teachers = db.get('users');

  const enriched = list.map(r => {
    const teacher = teachers.find(u => u.id === r.teacher_user_id);
    return {
      ...r,
      teacher_name: teacher?.name || 'Teacher'
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ recommendations: enriched });
});

export default router;
