import { Router, Response } from 'express';
import { db, AnnouncementRecord, AnnouncementRead, NotificationRecord } from '../db';
import { authenticate, requireRoles, AuthRequest } from '../middleware/auth';
import { generateId } from './auth';

const router = Router();

// Create announcement (Teacher)
router.post('/create', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { title, description, priority, target_class_id, target_section, subject_id } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required.' });
    return;
  }

  const newAnnouncement: AnnouncementRecord = {
    id: generateId(),
    title,
    description,
    date: new Date().toISOString().split('T')[0],
    priority: priority === 'IMPORTANT' ? 'IMPORTANT' : 'NORMAL',
    target_class_id: target_class_id || '',
    target_section: target_section || '',
    subject_id: subject_id || '',
    created_by_teacher_id: req.user!.id,
    created_at: new Date().toISOString()
  };

  const announcements = db.get('announcements');
  announcements.push(newAnnouncement);
  db.set('announcements', announcements);

  // Send notifications to relevant students & parents
  const notifications = db.get('notifications');
  const studentProfiles = db.get('student_profiles');
  const links = db.get('parent_student_links');

  let targetStudents = studentProfiles;
  if (target_class_id) {
    targetStudents = targetStudents.filter(sp => sp.class_id === target_class_id);
  }
  if (target_section) {
    targetStudents = targetStudents.filter(sp => sp.section.toLowerCase() === target_section.toLowerCase());
  }

  targetStudents.forEach(sp => {
    notifications.push({
      id: generateId(),
      user_id: sp.user_id,
      title: `${priority === 'IMPORTANT' ? '🚨 [Important] ' : ''}${title}`,
      message: description.length > 100 ? description.substring(0, 100) + '...' : description,
      type: 'ANNOUNCEMENT',
      date: new Date().toISOString(),
      is_read: false,
      reference_id: newAnnouncement.id
    });

    // Also notify linked parents
    const parentLinks = links.filter(l => l.student_user_id === sp.user_id);
    parentLinks.forEach(pl => {
      notifications.push({
        id: generateId(),
        user_id: pl.parent_user_id,
        title: `${priority === 'IMPORTANT' ? '🚨 [Important] ' : ''}Announcement: ${title}`,
        message: description.length > 100 ? description.substring(0, 100) + '...' : description,
        type: 'ANNOUNCEMENT',
        date: new Date().toISOString(),
        is_read: false,
        reference_id: newAnnouncement.id
      });
    });
  });

  db.set('notifications', notifications);
  res.status(201).json({ message: 'Announcement created successfully.', announcement: newAnnouncement });
});

// List announcements (filtered by user role and targeting)
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  let list = db.get('announcements');
  const reads = db.get('announcement_reads').filter(r => r.user_id === req.user!.id);
  const readIds = new Set(reads.map(r => r.announcement_id));
  const users = db.get('users');
  const subjects = db.get('subjects');
  const classes = db.get('classes');

  if (req.user!.role === 'STUDENT') {
    const studentProfile = db.get('student_profiles').find(sp => sp.user_id === req.user!.id);
    list = list.filter(a => {
      const matchClass = !a.target_class_id || a.target_class_id === studentProfile?.class_id;
      const matchSection = !a.target_section || a.target_section.toLowerCase() === (studentProfile?.section || '').toLowerCase();
      return matchClass && matchSection;
    });
  } else if (req.user!.role === 'PARENT') {
    const links = db.get('parent_student_links').filter(l => l.parent_user_id === req.user!.id);
    const childUserIds = links.map(l => l.student_user_id);
    const childProfiles = db.get('student_profiles').filter(sp => childUserIds.includes(sp.user_id));
    const childClassIds = childProfiles.map(cp => cp.class_id);

    list = list.filter(a => {
      if (!a.target_class_id) return true;
      return childClassIds.includes(a.target_class_id);
    });
  }

  const enriched = list.map(a => {
    const author = users.find(u => u.id === a.created_by_teacher_id);
    const subObj = subjects.find(s => s.id === a.subject_id);
    const classObj = classes.find(c => c.id === a.target_class_id);
    return {
      ...a,
      author_name: author?.name || 'Teacher',
      subject_name: subObj?.name || '',
      class_name: classObj?.name || 'All Classes',
      is_read: readIds.has(a.id)
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ announcements: enriched });
});

// Mark announcement read
router.post('/:id/read', authenticate, (req: AuthRequest, res: Response): void => {
  const announcementId = req.params.id;
  const reads = db.get('announcement_reads');
  const exists = reads.find(r => r.announcement_id === announcementId && r.user_id === req.user!.id);

  if (!exists) {
    reads.push({
      id: generateId(),
      announcement_id: announcementId,
      user_id: req.user!.id,
      read_at: new Date().toISOString()
    });
    db.set('announcement_reads', reads);
  }

  res.json({ message: 'Marked read.' });
});

export default router;
