import User from '../models/User.model.js';
import sendEmail from '../utils/sendEmail.js';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- REGISTER ---
export const register = async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;
    // Parse skills if it comes as a stringified array from FormData
    if (profileData.skills && typeof profileData.skills === 'string') {
      try {
        profileData.skills = JSON.parse(profileData.skills);
      } catch (e) {
        profileData.skills = profileData.skills.split(',').map(s => s.trim());
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Handle File Upload (Resume)
    let resumeUrl = '';
    if (req.file) {
      resumeUrl = req.file.path; // Cloudinary URL
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    // Clean empty strings from profileData to avoid Mongoose casting errors (e.g. empty Date or Number)
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === '' || profileData[key] === 'undefined' || profileData[key] === 'null') {
        profileData[key] = undefined;
      }
    });

    const user = await User.create({
      email,
      password,
      role,
      otp,
      otpExpires,
      resumeUrl,
      socialLinks: {
        linkedin: profileData.linkedinUrl,
        github: profileData.githubUrl,
        portfolio: profileData.portfolioUrl
      },
      ...profileData
    });

    // Send OTP email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your account',
        html: `<h1>Your OTP is: ${otp}</h1><p>It expires in 15 minutes.</p>`
      });
    } catch (emailError) {
       console.error("Email send failed:", emailError.message);
    }

    const token = generateTokenAndSetCookie(res, user._id);

    // Filter out sensitive data from user object
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;
    delete userResponse.resetPasswordOTP;
    delete userResponse.resetPasswordExpires;

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: userResponse
      },
      accessToken: token,
      needsVerification: true
    });

  } catch (error) {
    console.error("--- REGISTRATION ERROR STACK ---");
    console.error(error);
    console.error("---------------------------------");
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Internal Server Error during registration',
      error: error.message
    });
  }
};

// --- VERIFY EMAIL ---
export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({
      otp,
      otpExpires: { $gt: Date.now() },
      _id: req.userId // Populated by middleware
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LOGIN ---
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: `Access denied. Registered as ${user.role}.` });
    }

    // If user is not verified, send a new OTP
    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      try {
        await sendEmail({
          email: user.email,
          subject: 'Verify your account',
          html: `<h1>Your OTP is: ${otp}</h1><p>It expires in 15 minutes.</p>`
        });
      } catch (emailError) {
        console.error("Email send failed during login:", emailError.message);
      }
    }

    const token = generateTokenAndSetCookie(res, user._id);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;

    res.status(200).json({
      success: true,
      data: {
        user: userResponse
      },
      accessToken: token,
      needsVerification: !user.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GOOGLE LOGIN ---
export const googleLogin = async (req, res) => {
  try {
    const { idToken, role } = req.body;
    let payload;

    try {
      // 1. Try to verify as an ID Token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      // 2. Fallback: If verification fails, treat it as an Access Token (common with useGoogleLogin hook)
      try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (!response.ok) throw new Error("Invalid Google Access Token");
        payload = await response.json();
      } catch (fetchError) {
        throw new Error("Failed to verify Google Token: " + verifyError.message);
      }
    }
    
    const { email, sub: googleId, given_name, family_name, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: "Google account does not have an email associated." });
    }

    let user = await User.findOne({ email });

    if (user) {
      // Check if user role matches the role requested
      if (user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This email is already registered as a ${user.role}.`
        });
      }
      // Update existing user with google info if not already present
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user for Google login
      const randomPassword = crypto.randomBytes(16).toString('hex');
      
      user = await User.create({
        email,
        googleId,
        role,
        firstName: given_name,
        lastName: family_name,
        avatar: picture,
        isVerified: true,
        password: randomPassword
      });
    }

    const token = generateTokenAndSetCookie(res, user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Google Login successful',
      data: {
        user: userResponse
      },
      accessToken: token
    });
  } catch (error) {
    console.error("Google Login Error:", error.message);
    res.status(500).json({ 
      success: false,
      message: 'Google Login failed', 
      error: error.message 
    });
  }
};

// --- FORGOT PASSWORD ---
export const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== role) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. This email is registered as a ${user.role}.` 
      });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = resetOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP',
      html: `<h1>Reset OTP: ${resetOtp}</h1>`
    });

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- RESET PASSWORD ---
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LOGOUT ---
export const logout = (req, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// --- CHECK AUTH ---
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;

    res.status(200).json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
