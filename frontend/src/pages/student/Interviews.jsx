import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  Clock, 
  Trophy, 
  BarChart3, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  MessageCircle,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const Interviews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [interviewsRes, applicationsRes] = await Promise.all([
        api.get('/interview/history'),
        api.get('/applications')
      ]);

      if (interviewsRes.data.success && applicationsRes.data.success) {
        const allSessions = interviewsRes.data.data;
        const allApps = applicationsRes.data.data;

        // 1. Process History: Only show the LATEST COMPLETED session per job (Interviews only)
        const completedInterviews = allSessions.filter(s => s.status === 'completed' && s.type === 'interview');
        const latestHistoryMap = new Map();
        
        // Since backend already sorts by -createdAt, the first one we see for a job is the latest
        completedInterviews.forEach(session => {
          const jobId = session.job?._id;
          if (jobId && !latestHistoryMap.has(jobId)) {
            latestHistoryMap.set(jobId, session);
          }
        });
        setInterviews(Array.from(latestHistoryMap.values()));

        // 2. Process Invitations: Show jobs with "Interview" status
        // Priority: Latest session status wins (Interviews only)
        const sessionStatusMap = new Map();
        [...allSessions].filter(s => s.type === 'interview').reverse().forEach(s => {
          if (s.job?._id) sessionStatusMap.set(s.job._id, s.status);
        });

        const currentInterviews = allApps.filter(app => {
          const status = sessionStatusMap.get(app.job?._id);
          // Only show if status is Interview and no session is completed
          return app.status === 'Interview' && status !== 'completed';
        });

        setPendingInvites(currentInterviews.map(invite => ({
           ...invite,
           isStarted: sessionStatusMap.get(invite.job?._id) === 'started'
        })));
      }
    } catch (error) {
      console.error('Error fetching interview data:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 6) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 pb-12 px-4 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Technical Screening</h1>
            <p className="text-slate-500 mt-1 text-sm">Review your AI-powered interview invitations and performance history</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white">Fetching Sessions...</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Pending Invitations */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Play size={16} className="text-brand-400" /> Pending Invitations
              </h2>
              
              <div className="space-y-4">
                {pendingInvites.length > 0 ? (
                  pendingInvites.map((invite) => (
                    <motion.div
                      key={invite._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-6 border-brand-500/20 bg-brand-500/5 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Sparkles size={48} className="text-brand-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{invite.job?.title}</h3>
                      <p className="text-sm text-slate-400 mb-4">{invite.job?.company}</p>
                      
                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-6">
                        <Clock size={12} /> 30 Min Session
                      </div>
                      
                      <button
                        onClick={() => navigate(`/student/interview/${invite.job?._id}?mode=interview`)}
                        className={`w-full py-3 text-white rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                          invite.isStarted 
                            ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' 
                            : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/20'
                        }`}
                      >
                        {invite.isStarted ? 'Resume Interview' : 'Start AI Interview'} <ChevronRight size={16} />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-10 text-center glass-card border-slate-800 bg-slate-900/40">
                    <Calendar size={32} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-sm text-slate-500">No pending interview invitations at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: History */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={16} className="text-brand-400" /> Interview History
              </h2>

              <div className="space-y-4">
                {interviews.length > 0 ? (
                  interviews.map((session) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 border-slate-800 hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-start justify-between">
                             <div>
                               <h3 className="text-xl font-bold text-white">{session.job?.title}</h3>
                               <p className="text-slate-400 text-sm font-medium">{session.job?.company}</p>
                             </div>
                             <div className={`px-4 py-2 rounded-2xl border ${getScoreColor(session.overallScore)}`}>
                               <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5">AI Score</div>
                               <div className="text-xl font-black">{session.overallScore}<span className="text-xs opacity-50">/10</span></div>
                             </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                             <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">
                               <MessageCircle size={14} /> AI Feedback Summary
                             </div>
                             <p className="text-sm text-slate-400 leading-relaxed italic">"{session.overallFeedback}"</p>
                          </div>

                          <div className="flex items-center gap-4 pt-2">
                             <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                               <Calendar size={14} /> {new Date(session.createdAt).toLocaleDateString()}
                             </div>
                             <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                               <Trophy size={14} className="text-amber-500" /> {session.questions.length} Questions Answered
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center glass-card border-slate-800 bg-slate-900/40">
                    <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-700 mb-6">
                       <BarChart3 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No session history yet</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                      Complete your first AI technical screening to see your detailed performance breakdown here.
                    </p>
                  </div>
                )}
              </div>

               {interviews.length > 0 && (
                <div className="flex gap-4 p-5 rounded-3xl bg-brand-500/5 border border-brand-500/10 items-start">
                  <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">How AI Scoring Works</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Our AI evaluates your responses based on technical accuracy, clarity of thought, and practical experience. 
                      Recruiters use these scores to shortlist candidates for final rounds.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Interviews;
