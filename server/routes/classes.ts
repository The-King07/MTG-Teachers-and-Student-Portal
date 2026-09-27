import { Router, Response } from 'express';
import { db, ClassRoom, Subject, TeacherAssignment, StudentProfile, ParentStudentLink } from '../db';
import { authenticate, requireRoles, AuthRequest } from '../middleware/auth';
import { generateId } from './auth';

const router = Router();

// Get list of all classes, sections, and subjects
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const classes = db.get('classes');
  const subjects = db.get('subjects');
  res.json({ classes, subjects });
});

// Teacher creates a class
router.post('/create-class', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { name, grade, description, sections } = req.body;
  if (!name || !grade) {
    res.status(400).json({ error: 'Class name and grade are required.' });
    return;
  }

  const newClass: ClassRoom = {
    id: generateId(),
    name,
    grade,
    description: description || '',
    sections: Array.isArray(sections) && sections.length > 0 ? sections : ['A'],
    created_at: new Date().toISOString()
  };

  const classes = db.get('classes');
  classes.push(newClass);
  db.set('classes', classes);

  res.status(201).json({ message: 'Class created successfully.', classRoom: newClass });
});

// Teacher creates a subject
router.post('/create-subject', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { name, code, description } = req.body;
  if (!name || !code) {
    res.status(400).json({ error: 'Subject name and code are required.' });
    return;
  }

  const newSubject: Subject = {
    id: generateId(),
    name,
    code,
    description: description || ''
  };

  const subjects = db.get('subjects');
  subjects.push(newSubject);
  db.set('subjects', subjects);

  res.status(201).json({ message: 'Subject created successfully.', subject: newSubject });
});

// Teacher assigns self to class, section, subject
router.post('/assign-teacher', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { class_id, section, subject_id } = req.body;
  if (!class_id || !section || !subject_id) {
    res.status(400).json({ error: 'Class, Section, and Subject are required.' });
    return;
  }

  const assignments = db.get('teacher_assignments');
  const exists = assignments.find(
    a => a.teacher_user_id === req.user!.id && a.class_id === class_id && a.section === section && a.subject_id === subject_id
  );

  if (!exists) {
    assignments.push({
      id: generateId(),
      teacher_user_id: req.user!.id,
      class_id,
      section,
      subject_id
    });
    db.set('teacher_assignments', assignments);
  }

  res.json({ message: 'Assigned to class successfully.' });
});

// Teacher enrolls student or student updates class
router.post('/enroll-student', authenticate, requireRoles('TEACHER'), (req: AuthRequest, res: Response): void => {
  const { student_user_id, class_id, section, roll_number } = req.body;
  if (!student_user_id || !class_id || !section) {
    res.status(400).json({ error: 'Student, class, and section are required.' });
    return;
  }

  const studentProfiles = db.get('student_profiles');
  const index = studentProfiles.findIndex(sp => sp.user_id === student_user_id);

  if (index !== -1) {
    studentProfiles[index].class_id = class_id;
    studentProfiles[index].section = section;
    if (roll_number) studentProfiles[index].roll_number = roll_number;
    db.set('student_profiles', studentProfiles);
    res.json({ message: 'Student enrolled in class successfully.' });
  } else {
    res.status(404).json({ error: 'Student profile not found.' });
  }
});

// Parent links child using student_code
router.post('/link-child', authenticate, requireRoles('PARENT'), (req: AuthRequest, res: Response): void => {
  const { student_code } = req.body;
  if (!student_code) {
    res.status(400).json({ error: 'Student code is required.' });
    return;
  }

  const studentProfile = db.get('student_profiles').find(sp => sp.student_code.trim().toLowerCase() === student_code.trim().toLowerCase());
  if (!studentProfile) {
    res.status(404).json({ error: 'Student with provided code was not found.' });
    return;
  }

  const links = db.get('parent_student_links');
  const alreadyLinked = links.find(l => l.parent_user_id === req.user!.id && l.student_user_id === studentProfile.user_id);

  if (alreadyLinked) {
    res.status(400).json({ error: 'Child is already linked to your account.' });
    return;
  }

  const newLink: ParentStudentLink = {
    id: generateId(),
    parent_user_id: req.user!.id,
    student_user_id: studentProfile.user_id
  };
  links.push(newLink);
  db.set('parent_student_links', links);

  const studentUser = db.get('users').find(u => u.id === studentProfile.user_id);
  res.json({ message: `Successfully linked child ${studentUser?.name || 'Student'}.`, student: studentUser });
});

// Parent gets list of linked children
router.get('/my-children', authenticate, requireRoles('PARENT'), (req: AuthRequest, res: Response): void => {
  const links = db.get('parent_student_links').filter(l => l.parent_user_id === req.user!.id);
  const studentUserIds = links.map(l => l.student_user_id);

  const users = db.get('users').filter(u => studentUserIds.includes(u.id));
  const studentProfiles = db.get('student_profiles').filter(sp => studentUserIds.includes(sp.user_id));
  const classes = db.get('classes');

  const children = users.map(user => {
    const profile = studentProfiles.find(sp => sp.user_id === user.id);
    const classObj = classes.find(c => c.id === profile?.class_id);
    const { password, ...userWithoutPass } = user;
    return {
      ...userWithoutPass,
      profile,
      class_name: classObj?.name || 'Unassigned',
      grade: classObj?.grade || ''
    };
  });

  res.json({ children });
});

export default router;
