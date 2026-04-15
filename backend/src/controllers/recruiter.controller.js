import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import Application from '../models/Application.model.js';
import Interview from '../models/Interview.model.js';

// @desc    Get current recruiter profile
// @route   GET /api/v1/recruiter/profile
// @access  Private/Recruiter
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update recruiter profile
// @route   PUT /api/v1/recruiter/profile
// @access  Private/Recruiter
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const allowedUpdates = [
      'recruiterName', 'designation', 'companyName', 'companyWebsite', 
      'companyCity', 'companyCountry', 'companySize', 'industry', 
      'foundedYear', 'companyDescription', 'linkedinUrl', 'phoneNumber'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

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

// @desc    Update recruiter avatar
// @route   POST /api/v1/recruiter/update-avatar
// @access  Private/Recruiter
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findById(req.userId);
    user.avatar = req.file.path;
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

// @desc    Update company logo
// @route   POST /api/v1/recruiter/update-logo
// @access  Private/Recruiter
export const updateLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findById(req.userId);
    user.companyLogo = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Company logo updated successfully',
      data: user.companyLogo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recruiter analytics
// @route   GET /api/v1/recruiter/analytics
// @access  Private/Recruiter
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // 1. Get all jobs posted by this recruiter
    const myJobs = await Job.find({ postedBy: userId });
    const myJobIds = myJobs.map(j => j._id);

    // 2. Application Trends (Last 7 Days)
    const applicationsTrendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await Application.countDocuments({
        job: { $in: myJobIds },
        createdAt: { $gte: date, $lt: nextDate }
      });

      // Calculate growth (simple comparison with previous day)
      let growth = 0;
      if (i < 6) {
        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevCount = await Application.countDocuments({
          job: { $in: myJobIds },
          createdAt: { $gte: prevDate, $lt: date }
        });
        if (prevCount > 0) {
          growth = Math.round(((count - prevCount) / prevCount) * 100);
        } else if (count > 0) {
          growth = 100;
        }
      }

      applicationsTrendData.push({
        day: days[date.getDay()],
        applications: count,
        growth: growth
      });
    }

    // 3. Hiring Funnel Data
    const funnelStages = [
      { stage: 'Applied', status: null, color: '#6366f1' },
      { stage: 'Screened', status: 'Shortlisted', color: '#818cf8' },
      { stage: 'Technical', status: 'Interview', color: '#c7d2fe' },
      { stage: 'Selected', status: 'Selected', color: '#a5b4fc' },
      { stage: 'Offered', status: 'Selected', color: '#10b981' }, // Mapping 'Selected' to 'Offered' for funnel
    ];

    const hiringFunnelData = await Promise.all(funnelStages.map(async (f) => {
      let count;
      if (f.stage === 'Applied') {
        count = await Application.countDocuments({ job: { $in: myJobIds } });
      } else {
        count = await Application.countDocuments({ 
          job: { $in: myJobIds }, 
          status: f.status 
        });
      }
      return { stage: f.stage, count, color: f.color };
    }));

    // 4. Job Status Data
    const statuses = [
      { name: 'Active', value: 'active', color: '#10b981' },
      { name: 'Draft', value: 'draft', color: '#94a3b8' },
      { name: 'Closed', value: 'closed', color: '#f43f5e' },
      { name: 'Paused', value: 'paused', color: '#f59e0b' },
    ];

    const jobStatusData = statuses.map(s => ({
      name: s.name,
      value: myJobs.filter(j => j.status === s.value).length,
      color: s.color
    }));

    // 5. Candidate Quality Data
    const shortlistedCount = await Application.countDocuments({ job: { $in: myJobIds }, status: 'Shortlisted' });
    const rejectedCount = await Application.countDocuments({ job: { $in: myJobIds }, status: 'Rejected' });
    
    const candidateQualityData = [
      { name: 'Shortlisted', value: shortlistedCount, color: '#10b981' },
      { name: 'Rejected', value: rejectedCount, color: '#f43f5e' },
    ];

    // 6. Top Performing Jobs
    const topJobsAggregate = await Application.aggregate([
      { $match: { job: { $in: myJobIds } } },
      {
        $group: {
          _id: '$job',
          applicants: { $sum: 1 }
        }
      },
      { $sort: { applicants: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails'
        }
      },
      { $unwind: '$jobDetails' }
    ]);

    const topJobsData = topJobsAggregate.map(item => ({
      title: item.jobDetails.title,
      applicants: item.applicants,
      growth: Math.floor(Math.random() * 50) + 10 // Mock growth for now
    }));

    // 7. KPIs
    const totalApplicants = await Application.countDocuments({ job: { $in: myJobIds } });
    const activePostings = myJobs.filter(j => j.status === 'active').length;
    
    const avgMatchScoreResult = await Application.aggregate([
      { $match: { job: { $in: myJobIds }, matchScore: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
    ]);
    const avgMatchScore = avgMatchScoreResult.length > 0 ? Math.round(avgMatchScoreResult[0].avgScore) : 0;

    // Hiring Velocity calculation (mocked as average days from created to selected)
    const selectedApps = await Application.find({ job: { $in: myJobIds }, status: 'Selected' });
    let hiringVelocity = 'N/A';
    if (selectedApps.length > 0) {
      const totalDays = selectedApps.reduce((acc, app) => {
        const diff = new Date(app.updatedAt) - new Date(app.createdAt);
        return acc + (diff / (1000 * 60 * 60 * 24));
      }, 0);
      hiringVelocity = Math.round(totalDays / selectedApps.length) + 'd';
    }

    res.status(200).json({
      success: true,
      data: {
        applicationsTrendData,
        hiringFunnelData,
        jobStatusData,
        candidateQualityData,
        topJobsData,
        kpis: {
          totalApplicants: totalApplicants.toLocaleString(),
          activePostings,
          avgMatchScore: avgMatchScore + '%',
          hiringVelocity
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recruiter dashboard summary
// @route   GET /api/v1/recruiter/dashboard-summary
// @access  Private/Recruiter
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Get all jobs posted by this recruiter
    const myJobs = await Job.find({ postedBy: userId });
    const myJobIds = myJobs.map(j => j._id);

    // 2. Calculate Stats
    const totalJobs = myJobs.length;
    const activeJobs = myJobs.filter(j => j.status === 'active').length;
    const totalApplicants = await Application.countDocuments({ job: { $in: myJobIds } });
    const shortlistedCount = await Application.countDocuments({ job: { $in: myJobIds }, status: 'Shortlisted' });
    const interviewCount = await Application.countDocuments({ job: { $in: myJobIds }, status: 'Interview' });

    // 3. Fetch Recent Activity
    // We combine new applications and status updates
    const recentApplications = await Application.find({ job: { $in: myJobIds } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('student', 'firstName lastName email avatar')
      .populate('job', 'title');

    const recentActivities = recentApplications.map(app => {
      const studentName = app.student ? `${app.student.firstName} ${app.student.lastName}`.trim() : 'Unknown Candidate';
      const jobTitle = app.job ? app.job.title : 'Deleted Job';
      
      let type = 'apply';
      let title = 'New Application';
      let content = `${studentName} applied for ${jobTitle}`;
      
      if (app.status === 'Shortlisted') {
        type = 'shortlist';
        title = 'Candidate Shortlisted';
        content = `${studentName} was shortlisted for ${jobTitle}`;
      } else if (app.status === 'Interview') {
        type = 'interview';
        title = 'Interview Scheduled';
        content = `Technical interview for ${studentName} for ${jobTitle}`;
      } else if (app.status === 'Rejected') {
        type = 'reject';
        title = 'Application Rejected';
        content = `${studentName} was rejected for ${jobTitle}`;
      } else if (app.status === 'Selected') {
        type = 'select';
        title = 'Candidate Selected';
        content = `${studentName} was selected for ${jobTitle}`;
      }

      return {
        id: app._id,
        type,
        title,
        content,
        time: app.updatedAt,
        student: app.student
      };
    });

    // 4. Quick Link Counts (Shortcuts)
    const pendingApplicants = await Application.countDocuments({ job: { $in: myJobIds }, status: 'Pending' });
    const interviewsPending = await Application.countDocuments({ job: { $in: myJobIds }, status: 'Interview' });
    
    // 5. AI performance insight (Simulated based on match scores)
    const avgMatchScoreResult = await Application.aggregate([
      { $match: { job: { $in: myJobIds }, matchScore: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
    ]);
    const currentAvg = avgMatchScoreResult.length > 0 ? Math.round(avgMatchScoreResult[0].avgScore) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          totalApplicants,
          shortlistedCount,
          interviewCount
        },
        recentActivities,
        shortcuts: {
          pendingApplicants,
          shortlistedCount,
          interviewsPending,
          expiringJobs: 0 // Mocked for now
        },
        aiInsight: {
          matchImprovement: currentAvg > 0 ? 15 : 0, // Placeholder logic
          currentAvg
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export recruiter data as CSV
// @route   GET /api/v1/recruiter/export-data
// @access  Private/Recruiter
export const exportRecruiterData = async (req, res) => {
  try {
    const userId = req.userId;
    
    // 1. Get all jobs posted by this recruiter
    const myJobs = await Job.find({ postedBy: userId });
    const myJobIds = myJobs.map(j => j._id);

    // 2. Get all applications for these jobs
    const applications = await Application.find({ job: { $in: myJobIds } })
      .populate('student', 'firstName lastName email')
      .populate('job', 'title company')
      .sort({ createdAt: -1 });

    // 3. Build CSV Header
    let csv = 'Job Title,Company,Candidate Name,Candidate Email,Applied Date,Match Score,Status\n';

    // 4. Populate CSV Rows
    applications.forEach(app => {
      const jobTitle = app.job?.title ? `"${app.job.title.replace(/"/g, '""')}"` : '"N/A"';
      const company = app.job?.company ? `"${app.job.company.replace(/"/g, '""')}"` : '"N/A"';
      const studentName = app.student ? `"${app.student.firstName} ${app.student.lastName}"`.replace(/"/g, '""') : '"N/A"';
      const studentEmail = app.student ? app.student.email : 'N/A';
      const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A';
      const matchScore = app.matchScore || 0;
      const status = app.status || 'Pending';

      csv += `${jobTitle},${company},${studentName},${studentEmail},${appliedDate},${matchScore}%,${status}\n`;
    });

    // 5. Set Headers for Download
    const fileName = `Recruitment_Report_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export Data Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate export' });
  }
};
