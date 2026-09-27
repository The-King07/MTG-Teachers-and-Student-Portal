import { Router, Response } from 'express';
import { db, ConversationRecord, MessageRecord, NotificationRecord } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateId } from './auth';

const router = Router();

// Get list of eligible contacts for starting a chat (enforces strict authorization boundaries)
router.get('/contacts', authenticate, (req: AuthRequest, res: Response): void => {
  const user = req.user!;
  const users = db.get('users');

  if (user.role === 'STUDENT') {
    const studentProfile = db.get('student_profiles').find(sp => sp.user_id === user.id);
    const assignments = db.get('teacher_assignments').filter(
      ta => ta.class_id === studentProfile?.class_id && ta.section.toLowerCase() === (studentProfile?.section || '').toLowerCase()
    );
    const teacherUserIds = Array.from(new Set(assignments.map(a => a.teacher_user_id)));

    // Also include all teachers in case no explicit assignment was made yet
    const allTeachers = users.filter(u => u.role === 'TEACHER');

    const contacts = allTeachers.map(u => {
      const { password, ...uClean } = u;
      return uClean;
    });

    res.json({ contacts });
    return;
  }

  if (user.role === 'TEACHER') {
    // Teachers can message all students and parents
    const contacts = users.filter(u => u.role === 'STUDENT' || u.role === 'PARENT').map(u => {
      const { password, ...uClean } = u;
      return uClean;
    });
    res.json({ contacts });
    return;
  }

  if (user.role === 'PARENT') {
    // Parents can message teachers of their linked child/children
    const links = db.get('parent_student_links').filter(l => l.parent_user_id === user.id);
    const childUserIds = links.map(l => l.student_user_id);
    const childProfiles = db.get('student_profiles').filter(sp => childUserIds.includes(sp.user_id));
    const childClassIds = childProfiles.map(cp => cp.class_id);

    const assignments = db.get('teacher_assignments').filter(ta => childClassIds.includes(ta.class_id));
    const teacherUserIds = Array.from(new Set(assignments.map(a => a.teacher_user_id)));

    const teachers = users.filter(u => u.role === 'TEACHER');
    const contacts = teachers.map(u => {
      const { password, ...uClean } = u;
      return uClean;
    });

    res.json({ contacts });
    return;
  }

  res.json({ contacts: [] });
});

// Get user's active conversations
router.get('/conversations', authenticate, (req: AuthRequest, res: Response): void => {
  const userId = req.user!.id;
  const conversations = db.get('conversations').filter(
    c => c.participant1_id === userId || c.participant2_id === userId
  );
  const users = db.get('users');
  const messages = db.get('messages');

  const list = conversations.map(c => {
    const otherId = c.participant1_id === userId ? c.participant2_id : c.participant1_id;
    const otherUser = users.find(u => u.id === otherId);

    const convMessages = messages.filter(m => m.conversation_id === c.id);
    const lastMessage = convMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const unreadCount = convMessages.filter(m => m.receiver_id === userId && !m.is_read).length;

    return {
      conversation_id: c.id,
      other_user_id: otherId,
      other_user_name: otherUser?.name || 'User',
      other_user_role: otherUser?.role || '',
      other_user_email: otherUser?.email || '',
      last_message: lastMessage ? lastMessage.content : '',
      last_message_time: lastMessage ? lastMessage.timestamp : c.updated_at,
      unread_count: unreadCount
    };
  }).sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

  res.json({ conversations: list });
});

// Get or create conversation with a target user
router.post('/start', authenticate, (req: AuthRequest, res: Response): void => {
  const { target_user_id } = req.body;
  if (!target_user_id) {
    res.status(400).json({ error: 'Target user ID is required.' });
    return;
  }

  const userId = req.user!.id;
  const conversations = db.get('conversations');

  let conv = conversations.find(
    c => (c.participant1_id === userId && c.participant2_id === target_user_id) ||
         (c.participant1_id === target_user_id && c.participant2_id === userId)
  );

  if (!conv) {
    conv = {
      id: generateId(),
      participant1_id: userId,
      participant2_id: target_user_id,
      updated_at: new Date().toISOString()
    };
    conversations.push(conv);
    db.set('conversations', conversations);
  }

  res.json({ conversation: conv });
});

// Get messages for a conversation
router.get('/messages/:conversationId', authenticate, (req: AuthRequest, res: Response): void => {
  const { conversationId } = req.params;
  const conv = db.get('conversations').find(c => c.id === conversationId);

  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }

  // Security check: User must be a participant in this conversation
  if (conv.participant1_id !== req.user!.id && conv.participant2_id !== req.user!.id) {
    res.status(403).json({ error: 'Unauthorized to view this private conversation.' });
    return;
  }

  const messages = db.get('messages').filter(m => m.conversation_id === conversationId);

  // Mark received messages as read
  let updated = false;
  messages.forEach(m => {
    if (m.receiver_id === req.user!.id && !m.is_read) {
      m.is_read = true;
      updated = true;
    }
  });
  if (updated) {
    db.set('messages', db.get('messages'));
  }

  res.json({ messages: messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) });
});

// Send message
router.post('/send', authenticate, (req: AuthRequest, res: Response): void => {
  const { conversation_id, content } = req.body;
  if (!conversation_id || !content || !content.trim()) {
    res.status(400).json({ error: 'Conversation ID and message content are required.' });
    return;
  }

  const convs = db.get('conversations');
  const convIndex = convs.findIndex(c => c.id === conversation_id);
  if (convIndex === -1) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }

  const conv = convs[convIndex];
  if (conv.participant1_id !== req.user!.id && conv.participant2_id !== req.user!.id) {
    res.status(403).json({ error: 'Unauthorized access to conversation.' });
    return;
  }

  const receiverId = conv.participant1_id === req.user!.id ? conv.participant2_id : conv.participant1_id;
  const now = new Date().toISOString();

  const newMessage: MessageRecord = {
    id: generateId(),
    conversation_id,
    sender_id: req.user!.id,
    receiver_id: receiverId,
    content: content.trim(),
    timestamp: now,
    is_read: false
  };

  const messages = db.get('messages');
  messages.push(newMessage);
  db.set('messages', messages);

  // Update conversation updated_at
  convs[convIndex].updated_at = now;
  db.set('conversations', convs);

  // Notify receiver
  const notifications = db.get('notifications');
  notifications.push({
    id: generateId(),
    user_id: receiverId,
    title: `New Message from ${req.user!.name}`,
    message: content.length > 80 ? content.substring(0, 80) + '...' : content,
    type: 'CHAT_MESSAGE',
    date: now,
    is_read: false,
    reference_id: conversation_id
  });
  db.set('notifications', notifications);

  res.status(201).json({ message: newMessage });
});

export default router;
