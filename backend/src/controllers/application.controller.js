import Application from '../models/Application.model.js';
import Job from '../models/Job.model.js';
import User from '../models/User.model.js';
import { 
  getEmbedding, 
  calculateSimilarity, 
  formatMatchScore, 
  getUserEmbeddingText 
} from '../utils/matching.service.js';
import {analyzeApplication} from '../utils/openai.service.js';
import sendEmail from '../utils/sendEmail.js';
import Notification from '../models/Notification.model.js';
import Interview from '../models/Interview.model.js';

// @desc    Upload resume directly to Cloudinary
// @route   POST /api/v1/applications/upload-resume
// @access  Private/Student
export const uploadResumeSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure URL has .pdf extension exactly once and uses raw path
    // Multer-Cloudinary might return a URL with image/upload if not careful, 
    // but configuring it as 'raw' should handle it. This is a safeguard.
    let sanitizedUrl = req.file.path.replace('/image/upload/', '/raw/upload/');
    
    // Remove duplicate extensions if they exist
    sanitizedUrl = sanitizedUrl.replace(/(\.pdf)+$/i, '') + '.pdf';

    // Update user's profile resume
    user.resumeUrl = sanitizedUrl;
    console.log(sanitizedUrl)
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: sanitizedUrl
    });
  } catch (error) {
    console.error('Upload Resume Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply for a job
// @route   POST /api/v1/applications/apply/:jobId
// @access  Private/Student
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    const job = await Job.findById(jobId)
      .select('+embedding')
      .populate('postedBy', 'email recruiterName');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({ job: jobId, student: userId });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // Parse Form Data if necessary (Multer sends everything as strings)
    const experience = typeof req.body.experience === 'string' ? JSON.parse(req.body.experience) : req.body.experience;
    const education = typeof req.body.education === 'string' ? JSON.parse(req.body.education) : req.body.education;
    const skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
    const { fullName, phone, location, githubUrl, portfolioUrl } = req.body;

    // Fetch user and update profile with application data
    const user = await User.findById(userId).select('+embedding');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }


    // Update user profile fields if provided
    if (fullName) {
      const names = fullName.split(' ');
      user.firstName = names[0];
      user.lastName = names.slice(1).join(' ') || '';
    }
    if (phone) user.phoneNumber = phone;
    if (location) user.currentLocation = location;
    if (skills) user.skills = skills;
    
    // Process experience
    if (experience && Array.isArray(experience)) {
      user.experiences = experience.map(exp => ({
        role: exp.role,
        company: exp.company,
        period: exp.duration,
        // Using provided duration as period
      }));
    }

    // Process education
    if (education && Array.isArray(education)) {
      user.education = education.map(edu => ({
        degree: edu.degree,
        school: edu.school,
        period: edu.year
      }));
    }

    if (githubUrl || portfolioUrl) {
      user.socialLinks = {
        ...user.socialLinks,
        github: githubUrl || user.socialLinks?.github,
        portfolio: portfolioUrl || user.socialLinks?.portfolio
      };
    }

    // Recalculate embedding since profile updated
    try {
      const embeddingText = getUserEmbeddingText(user);
      user.embedding = await getEmbedding(embeddingText);
    } catch (embError) {
      console.error('Failed to update embedding during application:', embError);
    }

    // Handle dynamic resume upload if provided, otherwise use profile resume
    let finalResumeUrl = req.body.resumeUrl || user.resumeUrl;
    
    if (req.file) {
      // Ensure URL has .pdf extension exactly once and uses raw path
      finalResumeUrl = req.file.path.replace('/image/upload/', '/raw/upload/');
      finalResumeUrl = finalResumeUrl.replace(/(\.pdf)+$/i, '') + '.pdf';
      
      user.resumeUrl = finalResumeUrl;
    } else if (req.body.resumeUrl) {
      // If URL provided directly, update user profile as well for consistency
      user.resumeUrl = req.body.resumeUrl;
    }


    await user.save();

    // Verify resume exists (either profile or new upload)
    if (!finalResumeUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a resume or add one to your profile' });
    }

    // Calculate match score
    let matchScore = 0;
    try {
      const jobEmbedding = job.embedding;
      if (jobEmbedding && jobEmbedding.length > 0) {
        const similarity = calculateSimilarity(user.embedding, jobEmbedding);
        matchScore = formatMatchScore(similarity);
      }
    } catch (matchError) {
      console.error('Match score calculation failed during application:', matchError);
    }

    // Generate AI Strengths & Gaps Analysis
    let aiAnalysis = { strengths: [], gaps: [] };
    try {
      aiAnalysis = await analyzeApplication(job, user);
    } catch (aiError) {
      console.error('AI Analysis failed during application:', aiError);
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      student: userId,
      resumeUrl: finalResumeUrl,
      matchScore,
      aiAnalysis,
      status: 'Pending'
    });


    // Notify Recruiter
    if (job.postedBy && job.postedBy.email) {
      try {
        await sendEmail({
          email: job.postedBy.email,
          subject: `New Application Received: ${job.title}`,
          message: `${user.firstName} ${user.lastName} has applied for the position of ${job.title}.\n\nMatch Score: ${matchScore}%\n\nYou can review the applicant in your recruiter dashboard.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #4a90e2;">New Applicant for ${job.title}</h2>
              <p>Hi ${job.postedBy.recruiterName || 'Recruiter'},</p>
              <p>A new candidate has applied for your job posting <strong>${job.title}</strong>.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Candidate:</strong> ${user.firstName} ${user.lastName}</p>
                <p style="margin: 5px 0 0 0;"><strong>Match Score:</strong> <span style="font-size: 18px; color: #2ecc71; font-weight: bold;">${matchScore}%</span></p>
              </div>
              <p>Please log in to your dashboard to review full profile and resume.</p>
              <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">This is an automated notification from HireSphere AI.</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send recruiter notification email:', emailError);
      }
    }

    // Create Notification for Recruiter
    try {
      await Notification.create({
        recipient: job.postedBy._id,
        type: 'apps',
        title: 'New Application Received',
        message: `${user.firstName} ${user.lastName} has applied for ${job.title}`,
        action: 'Review Applicant',
        actionUrl: `/recruiter/jobs/${job._id}/applicants`
      });
    } catch (notifErr) {
      console.error('Failed to create recruiter notification for new application:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all applications for a student
// @route   GET /api/v1/applications
// @access  Private/Student
export const getStudentApplications = async (req, res) => {
  try {
    const userId = req.userId;

    const applications = await Application.find({ student: userId })
      .populate({
        path: 'job',
        select: 'title company logo location type workplaceType status'
      })
      .sort({ createdAt: -1 });

    // Fetch all interviews for this student to attach to applications
    const interviews = await Interview.find({ student: userId, type: 'interview' });
    const interviewMap = interviews.reduce((acc, interview) => {
      acc[interview.job.toString()] = interview;
      return acc;
    }, {});

    // Ensure older applications have a fallback for resumeUrl
    const dataWithFallback = applications.map(app => {
      const appObj = app.toObject();
      return {
        ...appObj,
        resumeUrl: appObj.resumeUrl || appObj.student?.resumeUrl,
        interviewData: interviewMap[app.job?._id.toString()] || null
      };
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: dataWithFallback
    });

  } catch (error) {
    console.error('Get Student Applications Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Withdraw an application
// @route   DELETE /api/v1/applications/:id
// @access  Private/Student
export const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const application = await Application.findOne({ _id: id, student: userId }).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or you are not authorized' });
    }

    const job = await Job.findById(application.job._id).populate('postedBy');
    const student = await User.findById(userId);

    await application.deleteOne();

    // Notify Recruiter
    try {
      if (job && job.postedBy) {
        await Notification.create({
          recipient: job.postedBy._id,
          type: 'apps',
          title: 'Application Withdrawn',
          message: `${student.firstName} ${student.lastName} has withdrawn their application for ${job.title}`,
          action: 'View Job Applicants',
          actionUrl: `/recruiter/jobs/${job._id}/applicants`
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify recruiter about withdrawal:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw Application Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get all applicants for a specific job
// @route   GET /api/v1/applications/job/:jobId
// @access  Private/Recruiter
export const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    // Verify job belongs to this recruiter
    const job = await Job.findOne({ _id: jobId, postedBy: userId }).select('+embedding');
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found or you are not authorized to view its applicants' 
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate({
        path: 'student',
        select: 'firstName lastName email phoneNumber headline bio currentLocation socialLinks experiences education skills collegeName degree specialization graduationYear avatar'
      })
      .sort({ matchScore: -1 });

    // Fetch all interviews for this job to attach to applicants
    const interviews = await Interview.find({ job: jobId, type: 'interview' });
    const interviewMap = interviews.reduce((acc, interview) => {
      acc[interview.student.toString()] = interview;
      return acc;
    }, {});

    const finalData = await Promise.all(applications.map(async (app) => {
      // Handle missing AI analysis on-the-fly
      if (!app.aiAnalysis || !app.aiAnalysis.strengths || app.aiAnalysis.strengths.length === 0) {
        try {
          const analysis = await analyzeApplication(job, app.student);
          app.aiAnalysis = analysis;
          await app.save();
        } catch (err) {
          console.error(`On-the-fly AI analysis failed for app ${app._id}:`, err);
        }
      }

      const appObj = app.toObject();
      appObj.interviewData = interviewMap[app.student._id.toString()] || null;
      return appObj;
    }));

    res.status(200).json({
      success: true,
      count: finalData.length,
      data: finalData
    });
  } catch (error) {
    console.error('Get Job Applicants Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status
// @route   PATCH /api/v1/applications/:id/status
// @access  Private/Recruiter
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const application = await Application.findById(id).populate('job').populate('student');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify requesting user is the recruiter who posted the job
    if (application.job.postedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Notify Student
    if (application.student && application.student.email) {
      let emailSubject = '';
      let emailBody = '';
      let emailHtml = '';

      const companyName = application.job.company;
      const jobTitle = application.job.title;
      const studentName = application.student.firstName;

      switch (status) {
        case 'Shortlisted':
          emailSubject = `Great News! Your application for ${jobTitle} at ${companyName}`;
          emailBody = `Hi ${studentName},\n\nWe are pleased to inform you that you have been shortlisted for the ${jobTitle} position at ${companyName}. Our team will reach out to you soon regarding the next steps.\n\nBest regards,\n${companyName} Recruitment Team`;
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #10b981;">Application Shortlisted!</h2>
              <p>Hi ${studentName},</p>
              <p>We've reviewed your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>, and we're impressed with your profile!</p>
              <p>You have been moved to the <span style="font-weight: bold; color: #10b981;">Shortlisted</span> stage. Our hiring team will be in touch shortly to discuss the next steps.</p>
              <p>Best regards,<br/>The ${companyName} Team</p>
            </div>
          `;
          break;

        case 'Interview':
          emailSubject = `Interview Invitation: ${jobTitle} at ${companyName}`;
          const interviewLink = `http://localhost:5173/student/interview/${application.job._id}`;
          emailBody = `Hi ${studentName},\n\nWe would like to invite you for a 30-minute AI Technical Screening session for the ${jobTitle} position. You can start the interview by logging into your dashboard or following this link: ${interviewLink}\n\nGood luck!`;
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
              <h2 style="color: #8b5cf6;">Technical Screening Invitation</h2>
              <p>Hi ${studentName},</p>
              <p>We are excited to move forward with your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
              <p>As the next step, we'd like you to complete a <strong>30-minute AI-powered technical screening</strong>. This session will evaluate your technical skills and fit for the role.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${interviewLink}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Technical Screening</a>
              </div>
              <p style="font-size: 13px; color: #64748b;">Note: You can also access this interview from your "Applied Jobs" dashboard after logging in.</p>
              <p>Good luck!</p>
              <p>Best Regards,<br/>${companyName} Hiring Team</p>
            </div>
          `;
          break;

        case 'Rejected':
          emailSubject = `Update on your application for ${jobTitle} at ${companyName}`;
          emailBody = `Hi ${studentName},\n\nThank you for your interest in the ${jobTitle} position at ${companyName}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We wish you the best in your job search.`;
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Application Update</h2>
              <p>Hi ${studentName},</p>
              <p>Thank you for giving us the opportunity to review your profile for the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong>.</p>
              <p>After careful consideration, our team has decided not to move forward with your application at this time. Our decision was made based on our current business requirements and the specific needs of the role.</p>
              <p>We will keep your profile in our database for future opportunities that match your skills. We wish you the best of luck in your professional journey.</p>
              <p>Regards,<br/>${companyName} Recruitment Team</p>
            </div>
          `;
          break;

        case 'Selected':
          emailSubject = `Congratulations! Selection for ${jobTitle} at ${companyName}`;
          emailBody = `Hi ${studentName},\n\nCongratulations! We are thrilled to inform you that you have been selected for the ${jobTitle} position at ${companyName}. Our HR team will reach out shortly with the offer details and onboarding process.`;
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 2px solid #10b981; border-radius: 12px; padding: 24px;">
              <h1 style="color: #10b981;">Congratulations! 🎉</h1>
              <p>Hi ${studentName},</p>
              <p>We are delighted to offer you the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>!</p>
              <p>Our team was very impressed with your performance throughout the evaluation process, and we believe you will be a fantastic addition to our team.</p>
              <p>Our HR representative will contact you within the next 24-48 hours to discuss the offer details and onboarding steps.</p>
              <p>Welcome aboard!</p>
              <p>Best Regards,<br/>The ${companyName} Team</p>
            </div>
          `;
          break;
      }

      if (emailSubject) {
        try {
          await sendEmail({
            email: application.student.email,
            subject: emailSubject,
            message: emailBody,
            html: emailHtml
          });
        } catch (emailErr) {
          console.error(`Failed to send status update email to ${application.student.email}:`, emailErr);
        }
      }

      // Create Notification Record
      try {
        const companyName = application.job.company;
        const jobTitle = application.job.title;
        
        let notifTitle = '';
        let notifMessage = '';
        let notifAction = null;
        let notifActionUrl = null;

        switch (status) {
          case 'Shortlisted':
            notifTitle = 'Application Shortlisted';
            notifMessage = `Great news! You have been shortlisted for ${jobTitle} at ${companyName}.`;
            break;
          case 'Interview':
            notifTitle = 'Interview Requested';
            notifMessage = `${companyName} has requested an interview for ${jobTitle}. Click to start your technical screening.`;
            notifAction = 'Start Technical Screening';
            notifActionUrl = `/student/interview/${application.job._id}`;
            break;
          case 'Rejected':
            notifTitle = 'Application Update';
            notifMessage = `Thank you for applying to ${companyName}. They have decided not to move forward with your application for ${jobTitle} at this time.`;
            break;
          case 'Selected':
            notifTitle = 'Application Selected';
            notifMessage = `Congratulations! You have been selected for the ${jobTitle} position at ${companyName}. Check your email for more details.`;
            break;
        }

        if (notifTitle) {
          await Notification.create({
            recipient: application.student._id,
            type: 'apps',
            title: notifTitle,
            message: notifMessage,
            action: notifAction,
            actionUrl: notifActionUrl
          });
        }
      } catch (notifErr) {
        console.error('Failed to create notification record:', notifErr);
      }
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application notes
// @route   PATCH /api/v1/applications/:id/notes
// @access  Private/Recruiter
export const updateApplicationNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.userId;

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if the user is the recruiter who posted the job
    if (application.job.postedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update notes for this application' });
    }

    application.notes = notes;
    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Update Application Notes Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete an application (Recruiter side)
// @route   DELETE /api/v1/applications/:id/recruiter
// @access  Private/Recruiter
export const deleteApplicationByRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if the user is the recruiter who posted the job
    if (application.job.postedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this application' });
    }

    await Application.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete Application Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
