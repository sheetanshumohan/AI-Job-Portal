import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  updateAvatar, 
  updateLogo,
  getAnalytics,
  getDashboardSummary,
  exportRecruiterData
} from '../controllers/recruiter.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadAvatar, uploadLogo } from '../config/cloudinary.js';

const router = express.Router();

// All routes are protected and for recruiters only
router.use(protect);
router.use(authorize('recruiter'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/update-avatar', uploadAvatar.single('avatar'), updateAvatar);
router.post('/update-logo', uploadLogo.single('logo'), updateLogo);
router.get('/analytics', getAnalytics);
router.get('/dashboard-summary', getDashboardSummary);
router.get('/export-data', exportRecruiterData);

export default router;
