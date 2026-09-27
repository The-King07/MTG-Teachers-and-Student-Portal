import { Router, Response } from 'express';
import { db } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get notifications for current user
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const userId = req.user!.id;
  const notifications = db.get('notifications').filter(n => n.user_id === userId);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const list = notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    unreadCount,
    notifications: list
  });
});

// Mark single notification read
router.patch('/:id/read', authenticate, (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const userId = req.user!.id;

  const notifications = db.get('notifications');
  const index = notifications.findIndex(n => n.id === id && n.user_id === userId);

  if (index !== -1) {
    notifications[index].is_read = true;
    db.set('notifications', notifications);
  }

  res.json({ message: 'Marked read.' });
});

// Mark all notifications read
router.post('/read-all', authenticate, (req: AuthRequest, res: Response): void => {
  const userId = req.user!.id;
  const notifications = db.get('notifications');

  let updated = false;
  notifications.forEach(n => {
    if (n.user_id === userId && !n.is_read) {
      n.is_read = true;
      updated = true;
    }
  });

  if (updated) {
    db.set('notifications', notifications);
  }

  res.json({ message: 'All notifications marked read.' });
});

export default router;
