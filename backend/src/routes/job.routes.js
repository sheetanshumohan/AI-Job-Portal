import express from 'express';
import { 
  getAllJobs, 
  getJobById,
  createJob,
  getRecruiterJobs,
  deleteJob,
  updateJobStatus,
  updateJob
} from '../controllers/job.controller.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// optionalAuth will populate req.userId if a token is present, but won't block if it's not
// This allows guests to browse jobs while students see match scores
router.get('/', optionalAuth, getAllJobs);
router.get('/my-jobs', protect, authorize('recruiter'), getRecruiterJobs);
router.get('/:id', optionalAuth, getJobById);


// Recruiter only routes
router.post('/', protect, authorize('recruiter'), createJob);
router.patch('/:id/status', protect, authorize('recruiter'), updateJobStatus);
router.patch('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);



export default router;


