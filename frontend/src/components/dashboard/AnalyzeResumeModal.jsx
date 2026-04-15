import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Zap,
  Loader2,
  TrendingUp
} from 'lucide-react';
import api from '../../lib/axios';

const AnalyzeResumeModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchAnalysis = async () => {
        try {
          setLoading(true);
          const response = await api.get('/student/resume-analysis');
          if (response.data.success) {
            setAnalysis(response.data.data);
          }
        } catch (error) {
          console.error('Failed to fetch resume analysis:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/10 rounded-lg">
                <Sparkles className="text-brand-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Profile Analysis</h3>
                <p className="text-xs text-slate-500 font-medium">Expert critique of your professional presence</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-brand-500" />
                  <Sparkles className="absolute -top-2 -right-2 text-brand-400 animate-pulse" size={24} />
                </div>
                <div className="text-center">
                  <h4 className="text-white font-bold text-lg">AI is evaluating your profile...</h4>
                  <p className="text-slate-500 text-sm mt-2">Checking skills, experience depth, and formatting benchmarks.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Score Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${analysis?.score || 0}, 100` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-brand-500"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">{analysis?.score}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Score</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-xl font-bold text-white mb-2">
                      {analysis?.score >= 80 ? 'Excellent Standing!' : analysis?.score >= 60 ? 'Good Progress!' : 'Needs Optimization'}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Your profile has a strong foundation. {analysis?.tips[0]}
                    </p>
                  </div>
                </div>

                {/* Grid Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="space-y-4">
                    <h5 className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest">
                      <CheckCircle2 size={18} /> Key Strengths
                    </h5>
                    <div className="space-y-3">
                      {analysis?.strengths.map((s, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl"
                        >
                          <Zap size={14} className="mt-1 text-emerald-500 shrink-0" />
                          <span className="text-sm text-slate-300">{s}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Improvements */}
                  <div className="space-y-4">
                    <h5 className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-widest">
                      <AlertCircle size={18} /> Growth Areas
                    </h5>
                    <div className="space-y-3">
                      {analysis?.gaps.map((g, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl"
                        >
                          <Zap size={14} className="mt-1 text-amber-500 shrink-0" />
                          <span className="text-sm text-slate-300">{g}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="p-6 bg-brand-500/5 border border-brand-500/10 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center gap-2 text-brand-400 font-bold text-sm uppercase tracking-widest mb-4">
                    <Lightbulb size={18} /> Actionable AI Tips
                  </div>
                  <ul className="space-y-3">
                    {analysis?.tips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                    <TrendingUp size={80} />
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-600/20"
                >
                  Got it, I'll Improve!
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalyzeResumeModal;
