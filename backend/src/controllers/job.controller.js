import Job from '../models/Job.model.js';
import User from '../models/User.model.js';
import Application from '../models/Application.model.js';
import { 
  getEmbedding, 
  calculateSimilarity, 
  formatMatchScore, 
  getJobEmbeddingText,
  getUserEmbeddingText 
} from '../utils/matching.service.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get all jobs (with semantic matching for students)
// @route   GET /api/v1/jobs
// @access  Public (or Private if matching is needed)
export const getAllJobs = async (req, res) => {
  try {
    const { 
      search, 
      type, 
      level, 
      location,
      minSalary,
      page = 1,
      limit = 10,
      sort = 'newest'
    } = req.query;

    const query = { status: 'active' };

    if (minSalary) {
      query['salary.min'] = { $gte: parseInt(minSalary) * 1000 };
    }

    // standard filtering
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      const types = Array.isArray(type) ? type : type.split(',').filter(t => t.trim() !== '');
      if (types.length > 0) {
        query.type = { $in: types };
      }
    }
    if (level) {
      const levels = Array.isArray(level) ? level : level.split(',').filter(l => l.trim() !== '');
      if (levels.length > 0) {
        query.level = { $in: levels };
      }
    }
    if (location) query.location = { $regex: location, $options: 'i' };

    const skip = (page - 1) * limit;

    // Fetch jobs
    let sortOption = {};
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'salary') sortOption = { 'salary.min': -1 };

    const jobs = await Job.find(query)
      .select('+embedding')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(query);

    // Semantic Matching Logic
    let processedJobs = jobs.map(job => {
      const jobObj = job.toObject();
      return {
        ...jobObj,
        skills: jobObj.requirements // Map requirements to skills for frontend
      };
    });

    if (req.userId) {
      const user = await User.findById(req.userId).select('+embedding');
      if (user && user.role === 'student' && (user.bio || user.skills?.length > 0)) {
        try {
          // 1. Get user profile embedding (use cache if available)
          let userEmbedding = user.embedding;

          if (!userEmbedding || userEmbedding.length === 0) {
            const userText = getUserEmbeddingText(user);
            userEmbedding = await getEmbedding(userText);
            
            // Cache for future use
            await User.findByIdAndUpdate(user._id, { embedding: userEmbedding });
          }

          // 2. Compare with each job's embedding
          processedJobs = processedJobs.map(job => {
            let matchScore = 0;
            if (job.embedding && job.embedding.length > 0) {
              const similarity = calculateSimilarity(userEmbedding, job.embedding);
              matchScore = formatMatchScore(similarity);
            } else {
              // Fallback to 0% as requested by user
              matchScore = 0;
            }
            return { ...job, matchScore };
          });

          // Sort by matchScore if requested
          if (sort === 'match') {
            processedJobs.sort((a, b) => b.matchScore - a.matchScore);
          }
        } catch (error) {
          console.error('Semantic matching failed:', error);
          processedJobs = processedJobs.map(job => ({
            ...job,
            matchScore: 0
          }));
        }
      } else {
        processedJobs = processedJobs.map(job => ({ ...job, matchScore: 0 }));
      }
    } else {
      processedJobs = processedJobs.map(job => ({ ...job, matchScore: 0 }));
    }

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

// @desc    Create new job
// @route   POST /api/v1/jobs
// @access  Private/Recruiter
export const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      companyName,
      jobType,
      workplaceType,
      jobLocation,
      salaryRange,
      jobDescription,
      skillsRequired,
      requiredTechnologies,
      educationRequired,
      numberOfOpenings,
      applicationDeadline,
      experienceRequired,
      jobStatus
    } = req.body;

    // Create normalized job object
    const jobData = {
      title: jobTitle,
      company: companyName,
      location: jobLocation?.city || 'Remote',
      salary: salaryRange,
      description: jobDescription,
      requirements: skillsRequired,
      technologies: requiredTechnologies,
      type: jobType,
      workplaceType,
      education: educationRequired,
      openings: numberOfOpenings,
      deadline: applicationDeadline,
      experienceRange: {
        min: experienceRequired?.min,
        max: experienceRequired?.max
      },
      level: experienceRequired?.level || 'Mid-level',
      status: jobStatus || 'active',
      postedBy: req.userId
    };

    // Generate embedding for semantic search
    try {
      const embeddingText = getJobEmbeddingText({
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        requirements: jobData.requirements,
        level: jobData.level,
        type: jobData.type
      });
      jobData.embedding = await getEmbedding(embeddingText);
    } catch (embError) {
      console.error('Failed to generate embedding during job creation:', embError);
      // Fallback: Continue without embedding, it can be generated later by a worker
    }

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job details
// @route   GET /api/v1/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let application = null;
    let matchScore = 0;

    // If student is logged in, check for their application and match score
    if (req.userId) {
      const user = await User.findById(req.userId).select('+embedding');
      
      if (user && user.role === 'student') {
        // Find existing application
        application = await Application.findOne({ 
          job: job._id, 
          student: req.userId 
        });

        // Calculate or get match score
        if (application && application.matchScore) {
          matchScore = application.matchScore;
        } else if (user.embedding && user.embedding.length > 0) {
          try {
            const jobWithEmbedding = await Job.findById(job._id).select('+embedding');
            if (jobWithEmbedding.embedding && jobWithEmbedding.embedding.length > 0) {
              const similarity = calculateSimilarity(user.embedding, jobWithEmbedding.embedding);
              matchScore = formatMatchScore(similarity);
            }
          } catch (matchError) {
            console.error('Match score calculation failed in getJobById:', matchError);
          }
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      data: {
        ...job.toObject(),
        application,
        matchScore
      }
    });
  } catch (error) {
    console.error('Get Job By Id Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// @desc    Get recruiter's jobs
// @route   GET /api/v1/jobs/my-jobs
// @access  Private/Recruiter
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.userId }).sort({ createdAt: -1 });
    
    // For each job, get the applicant count
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const applicantCount = await Application.countDocuments({ job: job._id });
      return {
        ...job.toObject(),
        applicants: applicantCount
      };
    }));

    res.status(200).json({
      success: true,
      data: jobsWithCounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/v1/jobs/:id
// @access  Private/Recruiter
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Ensure job belongs to recruiter
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    // 1. Find all applications for this job and notify students
    const applications = await Application.find({ job: job._id }).populate('student', 'email firstName');
    
    const notificationPromises = applications.map(app => {
      if (app.student && app.student.email) {
        return sendEmail({
          email: app.student.email,
          subject: `Update on your application for ${job.title}`,
          message: `Dear ${app.student.firstName || 'Candidate'},\n\nWe regret to inform you that the job posting for "${job.title}" at "${job.company}" has been cancelled and is no longer accepting applications. As a result, your application has been withdrawn.\n\nThank you for your interest.\n\nBest regards,\nRecruitment Team`,
          html: `<p>Dear ${app.student.firstName || 'Candidate'},</p>
                 <p>We regret to inform you that the job posting for <strong>"${job.title}"</strong> at <strong>"${job.company}"</strong> has been cancelled and is no longer accepting applications. As a result, your application has been withdrawn.</p>
                 <p>Thank you for your interest.</p>
                 <p>Best regards,<br>Recruitment Team</p>`
        });
      }
      return Promise.resolve();
    });

    // Send emails in background
    Promise.all(notificationPromises).catch(err => console.error('Error sending job deletion notifications:', err));

    // 2. Delete all applications
    await Application.deleteMany({ job: job._id });

    // 3. Delete the job
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted and applicants notified successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update job status
// @route   PATCH /api/v1/jobs/:id/status
// @access  Private/Recruiter
export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['active', 'draft', 'paused', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Use .equals() for safe ObjectId comparison
    if (!job.postedBy.equals(req.userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to change this job status' });
    }

    // Direct update to avoid potential validation issues with older records
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: `Job status successfully updated to ${status}`,
      data: updatedJob
    });
  } catch (error) {
    console.error(`Status Update Error [ID: ${req.params.id}]:`, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Update job details
// @route   PUT /api/v1/jobs/:id
// @access  Private/Recruiter
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    const {
      jobTitle,
      companyName,
      jobType,
      workplaceType,
      jobLocation,
      salaryRange,
      jobDescription,
      skillsRequired,
      requiredTechnologies,
      educationRequired,
      numberOfOpenings,
      applicationDeadline,
      experienceRequired,
      jobStatus
    } = req.body;

    // Check if fields for embedding have changed
    const needsNewEmbedding = 
      (jobTitle && jobTitle !== job.title) || 
      (jobDescription && jobDescription !== job.description) ||
      (skillsRequired && JSON.stringify(skillsRequired) !== JSON.stringify(job.requirements));

    // Update fields
    if (jobTitle) job.title = jobTitle;
    if (companyName) job.company = companyName;
    if (jobType) job.type = jobType;
    if (workplaceType) job.workplaceType = workplaceType;
    if (jobLocation?.city) job.location = jobLocation.city;
    if (salaryRange) job.salary = salaryRange;
    if (jobDescription) job.description = jobDescription;
    if (skillsRequired) job.requirements = skillsRequired;
    if (requiredTechnologies) job.technologies = requiredTechnologies;
    if (educationRequired) job.education = educationRequired;
    if (numberOfOpenings) job.openings = numberOfOpenings;
    if (applicationDeadline) job.deadline = applicationDeadline;
    if (experienceRequired) {
      job.experienceRange = {
        min: experienceRequired.min ?? job.experienceRange.min,
        max: experienceRequired.max ?? job.experienceRange.max
      };
      job.level = experienceRequired.level ?? job.level;
    }
    if (jobStatus) job.status = jobStatus;

    // Regenerate embedding if needed
    if (needsNewEmbedding) {
      try {
        const embeddingText = getJobEmbeddingText({
          title: job.title,
          company: job.company,
          description: job.description,
          requirements: job.requirements,
          level: job.level,
          type: job.type
        });
        job.embedding = await getEmbedding(embeddingText);
      } catch (embError) {
        console.error('Failed to regenerate embedding during job update:', embError);
      }
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


