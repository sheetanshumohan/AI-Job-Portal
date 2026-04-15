import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MessageCircle, 
  Send, 
  ChevronRight, 
  Trophy, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const MockInterview = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'interview'; // 'mock' or 'interview'
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, ready, feedback, completed

  useEffect(() => {
    const initInterview = async () => {
      try {
        const response = await api.post(`/interview/start/${jobId}?type=${mode}`);
        if (response.data.success) {
          const session = response.data.data;
          setInterview(session);
          
          if (session.status === 'completed') {
            setStatus('completed');
          } else {
            // Find the first question that hasn't been answered yet to resume
            const firstUnanswered = session.questions.findIndex(q => !q.answer);
            setCurrentIdx(firstUnanswered === -1 ? 0 : firstUnanswered);
            setStatus('ready');
          }
        }
      } catch (error) {
        toast.error('Failed to start interview');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    initInterview();
  }, [jobId]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await api.post(`/interview/submit/${interview._id}`, {
        questionIndex: currentIdx,
        answer: answer.trim()
      });

      if (response.data.success) {
        setFeedback(response.data.data);
        setStatus('feedback');
        
        // Update local state if needed
        const updatedQuestions = [...interview.questions];
        updatedQuestions[currentIdx] = {
          ...updatedQuestions[currentIdx],
          answer: answer.trim(),
          feedback: response.data.data.feedback,
          score: response.data.data.score
        };
        setInterview({ ...interview, questions: updatedQuestions });
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIdx === interview.questions.length - 1) {
      handleComplete();
    } else {
      setAnswer('');
      setFeedback(null);
      setCurrentIdx(prev => prev + 1);
      setStatus('ready');
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/interview/complete/${interview._id}`);
      if (response.data.success) {
        setInterview(response.data.data);
        setStatus('completed');
      }
    } catch (error) {
      toast.error('Failed to complete interview');
    } finally {
      setLoading(false);
    }
  };

  if (loading && status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="relative">
            <Loader2 size={48} className="text-brand-500 animate-spin" />
            <Sparkles size={20} className="absolute -top-2 -right-2 text-brand-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">Preparing your AI Interview...</h2>
          <p className="text-slate-500 text-sm">Generating job-specific questions just for you.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (status === 'completed') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 border border-brand-500/20 text-center space-y-8 relative overflow-hidden"
          >
            {/* Background Polish */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
            
            <div className="inline-flex p-4 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-2">
              <Trophy size={48} />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                {mode === 'mock' ? 'Mock Interview Completed!' : 'Technical Screening Round Completed!'}
              </h1>
              <p className="text-slate-400 text-lg">
                {mode === 'mock' ? "You've successfully finished your AI mock session." : "You've successfully finished your technical screening round."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-widest">
                  <BarChart3 size={14} /> Overall Performance
                </div>
                <div className="text-5xl font-black text-white">{interview.overallScore}<span className="text-xl text-slate-600">/10</span></div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-left space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Status
                </div>
                <div className="text-lg font-bold text-slate-200">Session Saved</div>
                <p className="text-xs text-slate-500">Your results have been added to your interview history for tracking improvement.</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-brand-500/5 border border-brand-500/10 text-left space-y-4">
               <h3 className="font-bold text-white flex items-center gap-2">
                 <Sparkles size={18} className="text-brand-400" /> AI Overall Feedback
               </h3>
               <p className="text-slate-300 leading-relaxed italic italic">"{interview.overallFeedback}"</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-600/20"
              >
                Back to Job
              </button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = interview.questions[currentIdx];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Exit Interview
          </button>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Progress</p>
                <p className="text-sm font-bold text-white">Question {currentIdx + 1} <span className="text-slate-600">of {interview.questions.length}</span></p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-500 font-black text-lg">
                {currentIdx + 1}
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Question Card */}
            <div className="glass-card p-10 border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-900/50 shadow-2xl">
               <div className="inline-flex px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider mb-6">
                 Question {currentIdx + 1}
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-8">
                 {currentQuestion.question}
               </h2>

               {status === 'ready' && (
                 <div className="space-y-6">
                   <div className="relative group">
                     <textarea 
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 h-48 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all resize-none leading-relaxed"
                     />
                     <div className="absolute bottom-4 right-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                       Professional tone recommended
                     </div>
                   </div>

                   <button 
                     onClick={handleSubmitAnswer}
                     disabled={!answer.trim() || submitting}
                     className="w-full py-5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:grayscale text-white rounded-3xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-600/20"
                   >
                     {submitting ? (
                        <>
                          <Loader2 size={24} className="animate-spin" /> Analyzing your response...
                        </>
                     ) : (
                        <>
                          Submit Response <Send size={20} />
                        </>
                     )}
                   </button>
                 </div>
               )}

               {status === 'feedback' && feedback && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-8"
                 >
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                          <CheckCircle2 size={14} /> AI Perspective
                        </div>
                        <p className="text-slate-300 leading-relaxed italic italic">"{feedback.feedback}"</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex flex-col justify-center text-center">
                        <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Score</div>
                        <div className="text-4xl font-black text-white">{feedback.score}<span className="text-sm text-slate-600">/10</span></div>
                      </div>
                   </div>

                   <button 
                     onClick={handleNextQuestion}
                     className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl font-bold text-lg transition-all flex items-center justify-center gap-3 border border-slate-700"
                   >
                     {currentIdx === interview.questions.length - 1 ? 'Finish Interview' : 'Next Question'} <ChevronRight size={20} />
                   </button>
                 </motion.div>
               )}
            </div>

            {/* Pro Tip */}
            <div className="flex gap-4 p-5 rounded-3xl bg-slate-900/50 border border-slate-800/50 items-start">
               <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                 <AlertCircle size={20} />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-white mb-1 tracking-tight">Pro Tip: Use the STAR Method</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Situation, Task, Action, Result. Provide concrete examples from your past experience to achieve higher scores from the AI evaluation.</p>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default MockInterview;
