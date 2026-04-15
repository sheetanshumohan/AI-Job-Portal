import Interview from '../models/Interview.model.js';
import Job from '../models/Job.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import { 
  generateInterviewQuestions, 
  evaluateInterviewAnswer, 
  generateOverallInterviewFeedback 
} from '../utils/openai.service.js';

export const startInterview = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    const [user, job] = await Promise.all([
      User.findById(userId),
      Job.findById(jobId)
    ]);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const type = req.query.type || 'interview';
    const questionCount = type === 'mock' ? 5 : 10;

    // Check for existing session first to allow resuming or preventing re-takes
    const existingInterview = await Interview.findOne({ 
      student: userId, 
      job: jobId,
      type: type
    }).sort({ createdAt: -1 });

    if (existingInterview) {
      // For technical screenings, enforce one-time completion
      if (type === 'interview' && existingInterview.status === 'completed') {
        return res.status(200).json({
           success: true,
           data: existingInterview,
           isExisting: true
        });
      }
      
      // If it's a started session (any type), allow resume
      if (existingInterview.status === 'started') {
        return res.status(200).json({
          success: true,
          data: existingInterview,
          isExisting: true
        });
      }
      
      // For mocks, if latest is completed, we allow starting a new one
      // (Unless we want to limit mocks too, but user said "whenever clicked... page opens")
    }

    // Generate questions using AI
    const questionsList = await generateInterviewQuestions(job, user, questionCount);
    
    const interview = await Interview.create({
      student: userId,
      job: jobId,
      type: type,
      questions: questionsList.map(q => ({ question: q })),
      status: 'started'
    });

    res.status(201).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { questionIndex, answer } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const questionText = interview.questions[questionIndex].question;
    
    // Evaluate answer using AI
    const evaluation = await evaluateInterviewAnswer(questionText, answer);

    interview.questions[questionIndex].answer = answer;
    interview.questions[questionIndex].feedback = evaluation.feedback;
    interview.questions[questionIndex].score = evaluation.score;

    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        feedback: evaluation.feedback,
        score: evaluation.score
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId).populate('job').populate('student');
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // Calculate overall score
    const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    interview.overallScore = (totalScore / interview.questions.length).toFixed(1);
    
    // Generate overall feedback
    interview.overallFeedback = await generateOverallInterviewFeedback(interview.questions);
    interview.status = 'completed';

    await interview.save();

    // Notify Recruiter
    try {
      const job = await Job.findById(interview.job._id).populate('postedBy');
      if (job && job.postedBy) {
        await Notification.create({
          recipient: job.postedBy._id,
          type: 'ai',
          title: 'Interview Completed',
          message: `${interview.student.firstName} ${interview.student.lastName} has finished the AI screening for ${job.title}. Score: ${interview.overallScore}/10`,
          action: 'View Interview Results',
          actionUrl: `/recruiter/jobs/${job._id}/applicants`
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify recruiter about interview completion:', notifErr);
    }

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId).populate('job', 'title company');
    
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ student: req.userId })
      .populate('job', 'title company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: interviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
