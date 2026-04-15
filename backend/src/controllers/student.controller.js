import mongoose from 'mongoose';
import Job from '../models/Job.model.js';
import Application from '../models/Application.model.js';
import Interview from '../models/Interview.model.js';
import User from '../models/User.model.js';
import { generateProfessionalSummary, analyzeResume } from '../utils/openai.service.js';
import { 
  getEmbedding, 
  calculateSimilarity, 
  formatMatchScore, 
  getUserEmbeddingText 
} from '../utils/matching.service.js';

// @desc    Get student dashboard stats
// @route   GET /api/v1/student/stats
// @access  Private/Student
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    const appliedCount = await Application.countDocuments({ student: userId });
    
    const user = await User.findById(userId);
    const savedCount = user.savedJobs.length;

    const interviewCount = await Application.countDocuments({ 
      student: userId, 
      status: 'Interview' 
    });

    // Fetch upcoming interviews (those that aren't completed yet)
    const interviewApps = await Interview.find({ 
      student: userId, 
      type: 'interview' 
    })
    .populate('job', 'title company logo')
    .sort({ updatedAt: -1 });

    const completedInterviews = await Interview.find({ 
      student: userId, 
      type: 'interview',
      status: 'completed'
    }).select('job');

    const completedJobIds = completedInterviews.map(i => i.job.toString());

    const upcomingInterviews = interviewApps
      .filter(app => !completedJobIds.includes(app.job._id.toString()))
      .slice(0, 3) // Only show latest 3
      .map(app => ({
        id: app._id,
        jobTitle: app.job.title,
        company: app.job.company,
        logo: app.job.logo,
        date: app.updatedAt,
        jobId: app.job._id
      }));

    // Profile views from User model
    const profileViews = user.profileViews || 0;

    // Calculate dynamic AI Match Score based on Market Fit
    // Match the student's profile against all active jobs in the system
    let matchScore = 0;
    try {
      // 1. Get or generate user embedding
      let userEmbedding = user.embedding;
      if (!userEmbedding || userEmbedding.length === 0) {
        // If bio or skills are empty, we might not have enough context
        if (user.bio || (user.skills && user.skills.length > 0)) {
          const userText = getUserEmbeddingText(user);
          userEmbedding = await getEmbedding(userText);
          // Cache the embedding for performance
          await User.findByIdAndUpdate(userId, { embedding: userEmbedding });
        }
      }

      if (userEmbedding && userEmbedding.length > 0) {
        // 2. Fetch active jobs with embeddings
        const activeJobs = await Job.find({ status: 'active' }).select('+embedding').limit(50);
        
        if (activeJobs.length > 0) {
          // 3. Calculate similarities
          const similarities = activeJobs
            .filter(job => job.embedding && job.embedding.length > 0)
            .map(job => calculateSimilarity(userEmbedding, job.embedding));
          
          if (similarities.length > 0) {
            // Sort and take average of top 3 matches
            similarities.sort((a, b) => b - a);
            const topSimilarities = similarities.slice(0, 3);
            const avgSimilarity = topSimilarities.reduce((a, b) => a + b, 0) / topSimilarities.length;
            matchScore = formatMatchScore(avgSimilarity);
          }
        }
      }
    } catch (error) {
      console.error('Failed to calculate Market Fit score:', error);
      // Fallback to latest application score if available
      const latestApp = await Application.findOne({ student: userId }).sort({ createdAt: -1 });
      matchScore = latestApp ? latestApp.matchScore : 0;
    }

    res.status(200).json({
      success: true,
      data: {
        appliedJobs: appliedCount,
        savedJobs: savedCount,
        interviews: interviewCount,
        profileViews: profileViews,
        matchScore: matchScore,
        upcomingInterviews: upcomingInterviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function for time ago in backend
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  let interval = seconds / 3600;
  if (interval > 24) return Math.floor(interval / 24) + "d ago";
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  return Math.floor(interval) + "m ago";
};

// @desc    Get student recent activity
// @route   GET /api/v1/student/activity
// @access  Private/Student
export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 5 } = req.query;

    const [applications, interviews] = await Promise.all([
      Application.find({ student: userId }).populate('job', 'title company').sort({ updatedAt: -1 }).limit(10),
      Interview.find({ student: userId }).populate('job', 'title company').sort({ createdAt: -1 }).limit(10)
    ]);

    const allActivities = [];

    // Process Applications
    applications.forEach(app => {
      // Skip 'Interview' status here because it's handled more descriptively by the Interview model below
      if (app.status === 'Interview') return;

      let title = '';
      let desc = '';
      let type = 'status';

      if (app.status === 'Pending') {
        title = 'Application Sent';
        desc = `You applied for "${app.job?.title}" at ${app.job?.company}`;
        type = 'pending';
      } else {
        title = 'App Updated';
        desc = `Your application for "${app.job?.title}" moved to ${app.status}`;
      }

      allActivities.push({
        id: `app-${app._id}-${app.updatedAt.getTime()}`,
        title,
        desc,
        type,
        time: getTimeAgo(app.updatedAt),
        date: app.updatedAt
      });
    });

    // Process Interviews
    interviews.forEach(interview => {
      allActivities.push({
        id: `int-${interview._id}`,
        title: interview.status === 'Completed' ? 'Interview Done' : 'New Interview',
        desc: `Technical screening for ${interview.job?.title} at ${interview.job?.company}`,
        type: interview.status === 'Completed' ? 'status' : 'pending',
        time: getTimeAgo(interview.createdAt),
        date: interview.createdAt
      });
    });

    // Merge and sort
    const sortedActivities = allActivities.sort((a, b) => b.date - a.date);

    // De-duplicate: If multiple activities of the same type exist for the same job title/desc, 
    // only keep the most recent one.
    const seen = new Set();
    const uniqueActivities = [];

    for (const activity of sortedActivities) {
      const key = `${activity.title}-${activity.desc}`; // Key based on content to catch logical duplicates
      if (!seen.has(key)) {
        seen.add(key);
        uniqueActivities.push(activity);
      }
    }

    res.status(200).json({
      success: true,
      data: uniqueActivities.slice(0, parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get saved jobs for student
// @route   GET /api/v1/student/saved-jobs
// @access  Private/Student
export const getSavedJobs = async (req, res) => {
  try {
    const { 
      search, 
      type, 
      level, 
      minSalary, 
      page = 1, 
      limit = 10,
      sort = 'newest'
    } = req.query;

    const user = await User.findById(req.userId).select('+embedding');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Build query for jobs in user's saved list
    const query = { _id: { $in: user.savedJobs } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      const types = type.split(',').filter(t => t.trim() !== '');
      if (types.length > 0) query.type = { $in: types };
    }

    if (level) {
      const levels = level.split(',').filter(l => l.trim() !== '');
      if (levels.length > 0) query.level = { $in: levels };
    }

    if (minSalary) {
      query['salary.min'] = { $gte: parseInt(minSalary) * 1000 };
    }

    const skip = (page - 1) * limit;

    let sortOption = {};
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'salary') sortOption = { 'salary.min': -1 };

    // Fetch jobs with filters and initial sorting
    const jobs = await Job.find(query)
      .select('+embedding')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalJobs = await Job.countDocuments(query);

    let processedJobs = jobs.map(job => {
      const jobObj = job.toObject();
      return {
        ...jobObj,
        skills: jobObj.requirements // Map requirements to skills for consistency
      };
    });

    if (user.role === 'student' && (user.bio || user.skills?.length > 0)) {
      try {
        let userEmbedding = user.embedding;

        // If no cached embedding, generate it
        if (!userEmbedding || userEmbedding.length === 0) {
          const userText = getUserEmbeddingText(user);
          userEmbedding = await getEmbedding(userText);
          await User.findByIdAndUpdate(user._id, { embedding: userEmbedding });
        }

        processedJobs = processedJobs.map(job => {
          let matchScore = 0;
          if (job.embedding && job.embedding.length > 0) {
            const similarity = calculateSimilarity(userEmbedding, job.embedding);
            matchScore = formatMatchScore(similarity);
          }
          return { ...job, matchScore };
        });

        // Memory sort if match sorting is requested
        if (sort === 'match') {
          processedJobs.sort((a, b) => b.matchScore - a.matchScore);
        }
      } catch (error) {
        console.error('Semantic matching failed for saved jobs:', error);
        processedJobs = processedJobs.map(job => ({ ...job, matchScore: 0 }));
      }
    } else {
      processedJobs = processedJobs.map(job => ({ ...job, matchScore: 0 }));
    }

    // Cleanup
    processedJobs.forEach(job => delete job.embedding);

    res.status(200).json({
      success: true,
      data: processedJobs,
      pagination: {
        total: totalJobs,
        page: parseInt(page),
        pages: Math.ceil(totalJobs / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle save job
// @route   POST /api/v1/student/toggle-save-job/:jobId
// @access  Private/Student
export const toggleSaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.userId);

    const isSaved = user.savedJobs.includes(jobId);

    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
      await user.save();
      return res.status(200).json({ success: true, message: 'Job removed from saved', isSaved: false });
    } else {
      user.savedJobs.push(jobId);
      await user.save();
      return res.status(200).json({ success: true, message: 'Job saved successfully', isSaved: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get analytics data
// @route   GET /api/v1/student/analytics
// @access  Private/Student
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const data = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get dates for the last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Count applications for this day
      const applicationsCount = await Application.countDocuments({
        student: userId,
        createdAt: { $gte: date, $lt: nextDate }
      });

      // Simple profile views simulation per day (if we had a history model we'd use that)
      // Since profileViews is a total, we just return roughly 1/7th or 0 for past days
      // and show actual current activity for today. 
      // For now, we'll return 0 for past days and the real increment for today,
      // or just return 0 for all to be "real" if no history exists.
      
      data.push({
        name: days[date.getDay()],
        applications: applicationsCount,
        profileViews: i === 0 ? (await User.findById(userId)).profileViews : 0
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/v1/student/profile
// @access  Private/Student
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const allowedUpdates = [
      'firstName', 'lastName', 'headline', 'bio', 'phoneNumber', 
      'currentLocation', 'nationality', 'skills', 'socialLinks', 
      'experiences', 'education', 'collegeName', 'degree', 
      'specialization', 'graduationYear', 'resumeUrl', 'avatar'
    ];

    const updates = {};
    const embeddingFields = ['firstName', 'lastName', 'headline', 'bio', 'skills'];
    let needsEmbeddingInvalidation = false;

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
        if (embeddingFields.includes(key)) needsEmbeddingInvalidation = true;
      }
    });

    if (needsEmbeddingInvalidation) {
      updates.embedding = []; // Clear cached embedding to trigger regeneration
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { $set: updates }, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Regenerate AI Professional Summary
// @route   POST /api/v1/student/regenerate-summary
// @access  Private/Student
export const regenerateAISummary = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const summary = await generateProfessionalSummary(user);
    
    user.bio = summary;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'AI Summary regenerated successfully',
      data: summary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile photo
// @route   POST /api/v1/student/update-avatar
// @access  Private/Student
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update avatar URL from Cloudinary response
    user.avatar = req.file.path; // CloudinaryStorage puts the URL in path
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: user.avatar
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update/Replace resume
// @route   POST /api/v1/student/update-resume
// @access  Private/Student
export const updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let sanitizedUrl = req.file.path.replace('/image/upload/', '/raw/upload/');

    const [baseUrl, queryString] = sanitizedUrl.split('?');

    const cleanBaseUrl = baseUrl.replace(/(\.pdf)+$/i, '') + '.pdf';

    sanitizedUrl = queryString
      ? `${cleanBaseUrl}?${queryString}`
      : cleanBaseUrl;

    user.resumeUrl = sanitizedUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: user.resumeUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Increment student profile views
// @route   PATCH /api/v1/student/:id/view
// @access  Private/Recruiter
export const incrementProfileViews = async (req, res) => {
  try {
    const { id } = req.params;

    // We use findByIdAndUpdate with $inc for atomic increment
    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { profileViews: 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile view recorded',
      views: user.profileViews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Resume Analysis
// @route   GET /api/v1/student/resume-analysis
// @access  Private/Student
export const getResumeAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const analysis = await analyzeResume(user);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};