import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import jobRoutes from './routes/job.routes.js';
import recruiterRoutes from './routes/recruiter.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import applicationRoutes from './routes/application.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Connect to Database
connectDB();

// Middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://ai-resume-analyzer-frontend-new.vercel.app',
  'https://ai-job-portal-omega-seven.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/recruiter', recruiterRoutes);
app.use('/api/v1/interview', interviewRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('AI Resume Analyzer API is running...');
});

export default app;
