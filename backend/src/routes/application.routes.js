import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { 
  applyJob, 
  getStudentApplications, 
  withdrawApplication,
  uploadResumeSingle,
  getJobApplicants,
  updateApplicationStatus,
  updateApplicationNotes,
  deleteApplicationByRecruiter
} from '../controllers/application.controller.js';
import { uploadResume } from '../config/cloudinary.js';

const router = express.Router();

router.use(protect);

// Student only routes
router.post('/upload-resume', authorize('student'), uploadResume.single('resume'), uploadResumeSingle);
router.post('/apply/:jobId', authorize('student'), uploadResume.single('resume'), applyJob);
router.get('/', authorize('student'), getStudentApplications);
router.delete('/:id', authorize('student'), withdrawApplication);

// Recruiter only routes
router.get('/job/:jobId', authorize('recruiter'), getJobApplicants);
router.patch('/:id/status', authorize('recruiter'), updateApplicationStatus);
router.patch('/:id/notes', authorize('recruiter'), updateApplicationNotes);
router.delete('/:id/recruiter', authorize('recruiter'), deleteApplicationByRecruiter);

export default router;
