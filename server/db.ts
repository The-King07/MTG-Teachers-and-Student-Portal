import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // bcrypt hash
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT';
  phone?: string;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  student_code: string;
  class_id?: string;
  section?: string;
  roll_number?: string;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  teacher_code: string;
  qualification?: string;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  occupation?: string;
}

export interface ParentStudentLink {
  id: string;
  parent_user_id: string;
  student_user_id: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "Grade 10"
  grade: string;
  description?: string;
  sections: string[]; // e.g. ["A", "B"]
  created_at: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "Mathematics", "Science"
  code: string; // e.g. "MATH101"
  description?: string;
}

export interface TeacherAssignment {
  id: string;
  teacher_user_id: string;
  class_id: string;
  section: string;
  subject_id: string;
}

export interface AttendanceRecord {
  id: string;
  student_user_id: string;
  class_id: string;
  section: string;
  subject_id?: string;
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT';
  marked_by_teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface TestRecord {
  id: string;
  test_name: string;
  subject_id: string;
  class_id: string;
  section: string;
  date: string; // YYYY-MM-DD
  max_marks: number;
  description?: string;
  created_by_teacher_id: string;
  created_at: string;
}

export interface TestResultRecord {
  id: string;
  test_id: string;
  student_user_id: string;
  marks_obtained: number;
  percentage: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  priority: 'NORMAL' | 'IMPORTANT';
  target_class_id?: string; // null means all
  target_section?: string;  // null means all
  subject_id?: string;
  created_by_teacher_id: string;
  created_at: string;
}

export interface AnnouncementRead {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export interface ConversationRecord {
  id: string;
  participant1_id: string;
  participant2_id: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface FeedbackRecord {
  id: string;
  student_user_id: string;
  teacher_user_id: string;
  subject_id?: string;
  category: string;
  comment: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface RecommendationRecord {
  id: string;
  student_user_id: string;
  teacher_user_id: string;
  recommendation: string;
  category: string;
  date: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  is_read: boolean;
  reference_id?: string;
}

export interface DatabaseSchema {
  users: User[];
  student_profiles: StudentProfile[];
  teacher_profiles: TeacherProfile[];
  parent_profiles: ParentProfile[];
  parent_student_links: ParentStudentLink[];
  classes: ClassRoom[];
  subjects: Subject[];
  teacher_assignments: TeacherAssignment[];
  attendance: AttendanceRecord[];
  tests: TestRecord[];
  test_results: TestResultRecord[];
  announcements: AnnouncementRecord[];
  announcement_reads: AnnouncementRead[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  feedback: FeedbackRecord[];
  recommendations: RecommendationRecord[];
  notifications: NotificationRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.resolve(DATA_DIR, 'make_the_grade.json');

function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultClasses: ClassRoom[] = Array.from({ length: 12 }, (_, i) => ({
    id: `class-${i + 1}`,
    name: `Class ${i + 1}`,
    grade: `Grade ${i + 1}`,
    description: `Standard Class ${i + 1}`,
    sections: ['A', 'B', 'C'],
    created_at: new Date().toISOString()
  }));

  const defaultDb: DatabaseSchema = {
    users: [],
    student_profiles: [],
    teacher_profiles: [],
    parent_profiles: [],
    parent_student_links: [],
    classes: defaultClasses,
    subjects: [],
    teacher_assignments: [],
    attendance: [],
    tests: [],
    test_results: [],
    announcements: [],
    announcement_reads: [],
    conversations: [],
    messages: [],
    feedback: [],
    recommendations: [],
    notifications: []
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.classes || parsed.classes.length === 0) {
      parsed.classes = defaultClasses;
    }
    return { ...defaultDb, ...parsed };
  } catch (err) {
    console.error('Error reading DB file, re-initializing', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = initDb();
  }

  public save(): void {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public set<K extends keyof DatabaseSchema>(table: K, value: DatabaseSchema[K]): void {
    this.data[table] = value;
    this.save();
  }
}

export const db = new Database();
