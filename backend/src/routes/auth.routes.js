import express from 'express';
import { 
  register, 
  login, 
  logout, 
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  googleLogin,
  checkAuth
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadResume } from '../config/cloudinary.js';

const router = express.Router();

router.get('/me', protect, checkAuth);
router.post('/register', uploadResume.single('resume'), register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.post('/verify-email', protect, verifyEmail); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
