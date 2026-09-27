import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, User, StudentProfile, TeacherProfile, ParentProfile, ParentStudentLink } from '../db';
import { authenticate, AuthRequest, JWT_SECRET } from '../middleware/auth';

const router = Router();

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// Register user
router.post('/register', async (req, res): Promise<void> => {
  try {
    const { name, username, email, password, role, phone, class_id, section, roll_number, qualification, student_code_to_link, occupation } = req.body;

    if (!name || !username || !email || !password || !role) {
      res.status(400).json({ error: 'Name, username, email, password, and role are required.' });
      return;
    }

    if (!['STUDENT', 'TEACHER', 'PARENT'].includes(role)) {
      res.status(400).json({ error: 'Invalid user role specified.' });
      return;
    }

    const existingUser = db.get('users').find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(400).json({ error: 'Username or email is already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    const newUser: User = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      name,
      role,
      phone: phone || '',
      created_at: new Date().toISOString()
    };

    const users = db.get('users');
    users.push(newUser);
    db.set('users', users);

    // Create role-specific profile
    if (role === 'STUDENT') {
      const studentCode = 'STU-' + Math.floor(100000 + Math.random() * 900000);
      const studentProfile: StudentProfile = {
        id: generateId(),
        user_id: userId,
        student_code: studentCode,
        class_id: class_id || '',
        section: section || '',
        roll_number: roll_number || ''
      };
      const profiles = db.get('student_profiles');
      profiles.push(studentProfile);
      db.set('student_profiles', profiles);
    } else if (role === 'TEACHER') {
      const teacherCode = 'TCH-' + Math.floor(100000 + Math.random() * 900000);
      const teacherProfile: TeacherProfile = {
        id: generateId(),
        user_id: userId,
        teacher_code: teacherCode,
        qualification: qualification || 'Faculty Member'
      };
      const profiles = db.get('teacher_profiles');
      profiles.push(teacherProfile);
      db.set('teacher_profiles', profiles);
    } else if (role === 'PARENT') {
      const parentProfile: ParentProfile = {
        id: generateId(),
        user_id: userId,
        occupation: occupation || ''
      };
      const profiles = db.get('parent_profiles');
      profiles.push(parentProfile);
      db.set('parent_profiles', profiles);

      // If student code provided, link parent to student
      if (student_code_to_link) {
        const targetStudent = db.get('student_profiles').find(sp => sp.student_code.toLowerCase() === student_code_to_link.toLowerCase());
        if (targetStudent) {
          const links = db.get('parent_student_links');
          links.push({
            id: generateId(),
            parent_user_id: userId,
            student_user_id: targetStudent.user_id
          });
          db.set('parent_student_links', links);
        }
      }
    }

    const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = newUser;

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: userWithoutPass
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      res.status(400).json({ error: 'Username/Email and password are required.' });
      return;
    }

    const user = db.get('users').find(
      u => u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid login credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid login credentials.' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;

    res.json({
      token,
      user: userWithoutPass
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current user profile
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { password: _, ...userWithoutPass } = req.user;

  let roleDetails: any = null;
  if (req.user.role === 'STUDENT') {
    const profile = db.get('student_profiles').find(sp => sp.user_id === req.user!.id);
    let classObj = null;
    if (profile?.class_id) {
      classObj = db.get('classes').find(c => c.id === profile.class_id);
    }
    roleDetails = { ...profile, class_name: classObj?.name || '' };
  } else if (req.user.role === 'TEACHER') {
    roleDetails = db.get('teacher_profiles').find(tp => tp.user_id === req.user!.id);
  } else if (req.user.role === 'PARENT') {
    roleDetails = db.get('parent_profiles').find(pp => pp.user_id === req.user!.id);
  }

  res.json({
    user: userWithoutPass,
    roleDetails
  });
});

export default router;
