import express from 'express';
import { 
  getDashboardStats, 
  getRecentActivity, 
  getSavedJobs, 
  toggleSaveJob,
  getAnalytics,
  updateProfile,
  regenerateAISummary,
  updateAvatar,
  updateResume,
  incrementProfileViews,
  getResumeAnalysis
} from '../controllers/student.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadAvatar, uploadResume } from '../config/cloudinary.js';

const router = express.Router();

// All routes are protected
router.use(protect);


router.get('/stats', authorize('student'), getDashboardStats);
router.get('/activity', authorize('student'), getRecentActivity);
router.get('/saved-jobs', authorize('student'), getSavedJobs);
router.post('/toggle-save-job/:jobId', authorize('student'), toggleSaveJob);
router.get('/analytics', authorize('student'), getAnalytics);
router.put('/profile', authorize('student'), updateProfile);
router.post('/regenerate-summary', authorize('student'), regenerateAISummary);
router.post('/update-avatar', authorize('student'), uploadAvatar.single('avatar'), updateAvatar);
router.post('/update-resume', authorize('student'), uploadResume.single('resume'), updateResume);
router.get('/resume-analysis', authorize('student'), getResumeAnalysis);

// Shared/Recruiter accessible routes
router.patch('/:id/view', authorize('recruiter'), incrementProfileViews);

export default router;
