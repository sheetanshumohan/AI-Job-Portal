import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { 
  startInterview, 
  submitAnswer, 
  completeInterview, 
  getInterview,
  getInterviewHistory 
} from '../controllers/interview.controller.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/start/:jobId', startInterview);
router.post('/submit/:interviewId', submitAnswer);
router.post('/complete/:interviewId', completeInterview);
router.get('/history', getInterviewHistory);
router.get('/:interviewId', getInterview);

export default router;
