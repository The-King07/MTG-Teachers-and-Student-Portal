import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import classRoutes from './routes/classes';
import studentRoutes from './routes/students';
import attendanceRoutes from './routes/attendance';
import testRoutes from './routes/tests';
import announcementRoutes from './routes/announcements';
import chatRoutes from './routes/chat';
import feedbackRoutes from './routes/feedback';
import recommendationRoutes from './routes/recommendations';
import historyRoutes from './routes/history';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', application: 'MAKE THE GRADE', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[MAKE THE GRADE API] Server running on http://localhost:${PORT}`);
});
