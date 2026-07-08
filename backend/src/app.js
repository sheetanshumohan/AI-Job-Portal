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
  'https://ai-resume-analyzer-frontend-eight-tan.vercel.app',
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
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/jobs', jobRoutes);
app.use('/recruiter', recruiterRoutes);
app.use('/interview', interviewRoutes);
app.use('/applications', applicationRoutes);
app.use('/notifications', notificationRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('AI Resume Analyzer API is running...');
});

export default app;
