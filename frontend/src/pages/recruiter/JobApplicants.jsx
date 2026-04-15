import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MoreVertical,
  MessageSquare,
  Award,
  BookOpen,
  Briefcase,
  Star,
  Zap,
  Loader2,
  FileText,
  AlertCircle,
  Trash2,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/axios';

const STATUS_THEMES = {
  'Applied': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Pending': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Shortlisted': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Interview Scheduled': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Interview': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Rejected': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Selected': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const JobApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentNotes, setCurrentNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/job/${id}`);
      const rawData = response.data.data;

      // Map backend data to frontend expected structure
      const mappedData = rawData.map(app => ({
        _id: app._id,
        firstName: app.student?.firstName || 'Unknown',
        lastName: app.student?.lastName || '',
        email: app.student?.email || 'N/A',
        phoneNumber: app.student?.phoneNumber || 'N/A',
        applicationStatus: app.status, // Directly use backend status
        matchScore: app.matchScore || 0,
        skills: app.student?.skills || [],
        collegeName: app.student?.collegeName || app.student?.education?.[0]?.school || 'Not Specified',
        degree: app.student?.degree || app.student?.education?.[0]?.degree || 'N/A',
        major: app.student?.specialization || 'N/A',
        totalExperienceYears: app.student?.experiences?.length || 0, // Simplified count
        resume: { url: app.resumeUrl },
        currentLocation: {
          city: app.student?.currentLocation || 'Remote',
          full: app.student?.currentLocation || 'Remote'
        },
        recruiterNotes: app.notes || '',
        aiAnalysis: app.aiAnalysis || { strengths: [], gaps: [] },
        githubProfile: app.student?.socialLinks?.github || '',
        linkedinProfile: app.student?.socialLinks?.linkedin || '',
        avatar: app.student?.avatar,
        interviewData: app.interviewData || null,
        studentId: app.student?._id // IMPORTANT: Map student ID for view tracking
      }));

      setApplicants(mappedData);
      if (mappedData.length > 0) setSelectedId(mappedData[0]._id);
      setLoading(false);
    } catch (error) {
      console.error('Fetch Applicants Error:', error);
      toast.error('Failed to load actual applicants');
      setLoading(false);
    }
  };

  const getOptimizedUrl = (url, isDownload = false) => {
    if (!url) return '';

    // Check if it's a Cloudinary URL
    if (url.includes('cloudinary.com')) {
      let optimized = url;

      // 1. Ensure it uses 'raw/upload' instead of 'image/upload'
      optimized = optimized.replace('/image/upload/', '/raw/upload/');

      // 2. Remove transformation hacks like f_pdf since they aren't supported for 'raw'
      optimized = optimized.replace(/\/upload\/[^v][^\/]+\//, '/upload/');

      // 3. Robust Extension Handling (prevent double .pdf)
      const baseUrl = optimized.split('?')[0];
      const query = optimized.includes('?') ? '?' + optimized.split('?')[1] : '';

      const cleanBaseUrl = baseUrl.replace(/(\.pdf)+$/i, '');
      optimized = cleanBaseUrl + '.pdf' + query;

      return optimized;
    }
    return url;
  };

  const selectedApplicant = applicants.find(a => a._id === selectedId);

  useEffect(() => {
    if (selectedApplicant) {
      setCurrentNotes(selectedApplicant.recruiterNotes || '');
      
      // Increment profile view when a recruiter reviews the applicant
      const incrementView = async () => {
        try {
          if (selectedApplicant.studentId) {
            await api.patch(`/student/${selectedApplicant.studentId}/view`);
          }
        } catch (error) {
          console.error('Failed to increment profile view:', error);
        }
      };
      incrementView();
    }
  }, [selectedApplicant?._id]);

  const updateStatus = async (newStatus) => {
    try {
      await api.patch(`/applications/${selectedId}/status`, { status: newStatus });
      setApplicants(prev => prev.map(a => a._id === selectedId ? { ...a, applicationStatus: newStatus } : a));
      toast.success(`Candidate ${newStatus}`);
    } catch (error) {
      console.error('Update Status Error:', error);
      toast.error('Failed to update status on server');
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      await api.patch(`/applications/${selectedApplicant._id}/notes`, { notes: currentNotes });

      // Update local state
      setApplicants(prev => prev.map(app =>
        app._id === selectedApplicant._id
          ? { ...app, recruiterNotes: currentNotes }
          : app
      ));

      toast.success('Notes saved successfully');
    } catch (err) {
      console.error('Save Notes Error:', err);
      toast.error(err.response?.data?.message || 'Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this application? This action cannot be undone.')) return;

    try {
      await api.delete(`/applications/${selectedApplicant._id}/recruiter`);

      // Fix: Move to the next/neighboring applicant before removing the current one
      const currentIndex = applicants.findIndex(a => a._id === selectedId);
      const nextApplicant = applicants[currentIndex + 1] || applicants[currentIndex - 1];

      toast.success('Application deleted successfully');

      if (nextApplicant) {
        setSelectedId(nextApplicant._id);
      } else {
        setSelectedId(null);
      }

      setApplicants(prev => prev.filter(app => app._id !== selectedApplicant._id));
    } catch (err) {
      console.error('Delete Application Error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete application');
    }
  };

  const ScoreRing = ({ score }) => {
    const color = score > 85 ? 'text-emerald-500' : score > 70 ? 'text-amber-500' : 'text-rose-500';
    return (
      <div className="relative w-16 h-16">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * score) / 100} className={`${color} transition-all duration-1000`} strokeLinecap="round" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>{score}%</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden pr-2">

        {/* LEFT PANEL: Applicant List */}
        <div className="w-[380px] flex flex-col glass-card border-slate-700/50 overflow-hidden">
          <div className="p-5 border-b border-slate-700/50 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-brand-400" />
              Candidates <span className="text-xs text-slate-500 ml-auto bg-slate-800 px-2 py-1 rounded-md">{applicants.length} Total</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-slate-900/50 h-24 rounded-2xl border border-slate-800" />
              ))
            ) : applicants.filter(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((app) => (
              <motion.div
                key={app._id}
                onClick={() => setSelectedId(app._id)}
                className={`
                  p-4 rounded-2xl border cursor-pointer transition-all group
                  ${selectedId === app._id
                    ? 'bg-brand-600/10 border-brand-500/50 shadow-lg shadow-brand-500/5'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-brand-400 transition-colors uppercase tracking-tight">
                      {app.firstName} {app.lastName}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Award size={10} /> {app.collegeName}
                    </p>
                  </div>
                  <ScoreRing score={app.matchScore} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${STATUS_THEMES[app.applicationStatus]}`}>
                    {app.applicationStatus}
                  </span>
                  <ChevronRight size={14} className={`transition-transform ${selectedId === app._id ? 'text-brand-400' : 'text-slate-700 group-hover:text-slate-500'}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Detailed Review */}
        <div className="flex-1 flex flex-col bg-slate-900/40 border border-slate-700/50 rounded-3xl overflow-hidden relative min-w-0">
          <AnimatePresence mode="wait">
            {selectedApplicant ? (
              <motion.div
                key={selectedApplicant._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                {/* Detail Header */}
                <div className="p-6 sm:p-8 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl relative z-50">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-center gap-6 min-w-0 flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 p-0.5 shadow-xl shadow-brand-600/20 shrink-0">
                        <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center overflow-hidden">
                          {selectedApplicant.avatar ? (
                            <img src={selectedApplicant.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl sm:text-2xl font-bold text-white uppercase">{selectedApplicant.firstName[0]}{selectedApplicant.lastName[0]}</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate shrink-0">{selectedApplicant.firstName} {selectedApplicant.lastName}</h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm font-medium text-slate-400">
                          <span className="flex items-center gap-2 group/contact"><Mail size={16} className="text-brand-400 transition-colors group-hover/contact:text-brand-300" /> <span className="text-slate-300/90">{selectedApplicant.email}</span></span>
                          <span className="flex items-center gap-2 group/contact"><Phone size={16} className="text-brand-400 transition-colors group-hover/contact:text-brand-300" /> <span className="text-slate-300/90">{selectedApplicant.phoneNumber}</span></span>
                          <span className="flex items-center gap-2 group/contact"><MapPin size={16} className="text-brand-400 transition-colors group-hover/contact:text-brand-300" /> <span className="text-slate-300/90">{selectedApplicant.currentLocation?.full}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => updateStatus('Rejected')}
                        className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] sm:text-xs font-bold uppercase transition-all whitespace-nowrap"
                      >
                        <XCircle size={16} /> <span className="hidden sm:inline">Reject</span>
                      </button>
                      <button
                        onClick={() => updateStatus('Shortlisted')}
                        className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] sm:text-xs font-bold uppercase transition-all shadow-lg shadow-emerald-500/40 whitespace-nowrap"
                      >
                        <CheckCircle2 size={16} /> <span className="hidden sm:inline">Shortlist</span>
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setShowActions(!showActions)}
                          className={`p-2.5 sm:p-3 rounded-2xl transition-all border ${showActions ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                          <MoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                          {showActions && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 mt-4 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden"
                              >
                                <div className="p-2 space-y-1">
                                  <button
                                    onClick={() => { updateStatus('Interview'); setShowActions(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                      <Calendar size={16} />
                                    </div>
                                    Schedule Interview
                                  </button>
                                  <button
                                    onClick={() => { updateStatus('Selected'); setShowActions(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                      <UserCheck size={16} />
                                    </div>
                                    Mark Hired
                                  </button>
                                  <div className="h-px bg-slate-700/50 mx-2 my-1" />
                                  <button
                                    onClick={() => { handleDeleteApplication(); setShowActions(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-rose-400 hover:text-white hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-widest"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                                      <Trash2 size={16} />
                                    </div>
                                    Delete Application
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-8 border-b border-slate-700/50 px-8">
                    {['profile', 'resume', 'interview', 'notes']
                      .filter(tab => tab !== 'interview' || selectedApplicant.interviewData)
                      .map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                          relative py-2 text-xs font-bold uppercase tracking-widest transition-all
                          ${activeTab === tab ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}
                        `}
                      >
                        {tab}
                        {activeTab === tab && (
                          <motion.div layoutId="activeTab" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                  {activeTab === 'profile' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Summary Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 border-slate-700/30">
                          <BookOpen size={20} className="text-brand-400 mb-3" />
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Education</h5>
                          <p className="text-white font-bold">{selectedApplicant.degree} in {selectedApplicant.major}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{selectedApplicant.collegeName}</p>
                        </div>
                        <div className="glass-card p-6 border-slate-700/30">
                          <Briefcase size={20} className="text-amber-400 mb-3" />
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Experience</h5>
                          <p className="text-white font-bold">{selectedApplicant.totalExperienceYears} Years Total</p>
                          <p className="text-xs text-slate-400 mt-0.5">Relevant professional background</p>
                        </div>
                        <div className="glass-card p-6 border-slate-700/30">
                          <Star size={20} className="text-violet-400 mb-3" />
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Presence</h5>
                          <div className="flex gap-4 mt-2">
                            {selectedApplicant.linkedinProfile && (
                              <a href={selectedApplicant.linkedinProfile.startsWith('http') ? selectedApplicant.linkedinProfile : `https://${selectedApplicant.linkedinProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                                <FaLinkedin size={14} />
                              </a>
                            )}
                            {selectedApplicant.githubProfile && (
                              <a href={selectedApplicant.githubProfile.startsWith('http') ? selectedApplicant.githubProfile : `https://${selectedApplicant.githubProfile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                                <FaGithub size={14} />
                              </a>
                            )}
                            <a href="#" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"><ExternalLink size={14} /></a>
                          </div>
                        </div>
                      </div>

                      {/* Skills Cloud */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Skill Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplicant.skills.map((skill, i) => (
                            <span key={i} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 flex items-center gap-2">
                              <Zap size={12} className="text-amber-500" /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Schedule Section Preview */}
                      <div className="p-8 bg-gradient-to-r from-brand-600/20 to-violet-600/20 rounded-3xl border border-brand-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400">
                            <Calendar size={28} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">Ready for evaluation?</h4>
                            <p className="text-sm text-brand-200/60">Schedule a 30-min technical screening session.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => updateStatus('Interview')}
                          className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-600/40 whitespace-nowrap"
                        >
                          Schedule Interview
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'resume' && (
                    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex-1 min-h-[400px] w-full bg-slate-950/50 rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-8 space-y-6 text-center group">
                        <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-slate-700 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                          <FileText size={48} className="text-brand-400/50" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white tracking-tight">Resume Document</h3>
                          <p className="text-xs text-slate-500 max-w-xs font-medium">Verified PDF Document • {selectedApplicant.firstName}_Resume_HireSphere.pdf</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                          <a
                            href={getOptimizedUrl(selectedApplicant.resume?.url, true)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg border border-slate-700"
                          >
                            <Download size={18} className="text-brand-400" /> Download PDF
                          </a>
                          <a
                            href={getOptimizedUrl(selectedApplicant.resume?.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-600/30"
                          >
                            <ExternalLink size={18} /> Open Preview
                          </a>
                        </div>
                        <div className="pt-8 w-full max-w-md">
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10 text-left">
                            <Zap size={20} className="text-brand-400 shrink-0" />
                            <p className="text-[10px] text-brand-200/60 leading-relaxed font-medium">
                              Our AI has already analyzed this resume for match compatibility. You can view the full report in the
                              <span className="text-brand-400 font-bold mx-1">Analysis</span> tab.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 p-4 rounded-2xl bg-slate-900/30 border border-slate-800/30 text-[10px] text-slate-600 italic flex items-center justify-center gap-2">
                        <AlertCircle size={14} /> Note: All documents are scanned for security and PII compliance before viewing.
                      </div>
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                      <div className="p-8 glass-card border-brand-500/10 bg-brand-600/5 flex items-center gap-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-4xl font-bold text-brand-400">{selectedApplicant.matchScore}%</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Verdict</div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">Skills Match <span className="text-white">{Math.min(100, Math.round(selectedApplicant.matchScore * 1.05))}%</span></div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, Math.round(selectedApplicant.matchScore * 1.05))}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">Experience Context <span className="text-white">{Math.max(0, Math.round(selectedApplicant.matchScore * 0.92))}%</span></div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.max(0, Math.round(selectedApplicant.matchScore * 0.92))}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl h-full">
                          <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Strengthening Points
                          </h5>
                          <ul className="space-y-3 text-sm text-slate-400">
                            {selectedApplicant.aiAnalysis?.strengths?.length > 0 ? (
                              selectedApplicant.aiAnalysis.strengths.map((point, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-emerald-500 shrink-0">•</span>
                                  <span>{point}</span>
                                </li>
                              ))
                            ) : (
                              <li className="italic opacity-50">No strengths identified yet.</li>
                            )}
                          </ul>
                        </div>
                        <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl h-full">
                          <h5 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={16} /> Potential Gaps
                          </h5>
                          <ul className="space-y-3 text-sm text-slate-400">
                            {selectedApplicant.aiAnalysis?.gaps?.length > 0 ? (
                              selectedApplicant.aiAnalysis.gaps.map((point, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-rose-500 shrink-0">•</span>
                                  <span>{point}</span>
                                </li>
                              ))
                            ) : (
                              <li className="italic opacity-50">No significant gaps identified.</li>
                            )}
                          </ul>
                      </div>
                    </div>
                  </div>
                )}

                  {activeTab === 'interview' && selectedApplicant.interviewData && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                      {/* Interview Header Stats */}
                      <div className="p-8 glass-card border-purple-500/10 bg-purple-600/5 flex items-center gap-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-4xl font-bold text-purple-400">{selectedApplicant.interviewData.overallScore}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">AI Screening<br/>Score</div>
                        </div>
                        <div className="flex-1 space-y-4">
                           <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
                             <Sparkles size={14} /> AI Overall Evaluation
                           </div>
                           <p className="text-sm text-slate-300 leading-relaxed italic italic">"{selectedApplicant.interviewData.overallFeedback}"</p>
                           <div className="flex items-center gap-4 pt-2">
                             <span className={`px-4 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${selectedApplicant.interviewData.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                               Status: {selectedApplicant.interviewData.status}
                             </span>
                             <span className="text-[10px] text-slate-500 font-medium">Session Date: {new Date(selectedApplicant.interviewData.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>

                      {/* Question Breakdown */}
                      <div className="space-y-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <MessageSquare size={16} className="text-brand-400" /> Full Session Transcript
                        </h4>
                        
                        <div className="space-y-4">
                          {selectedApplicant.interviewData.questions.map((q, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                    {i + 1}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Technical Query</span>
                                </div>
                                <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${q.score >= 7 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                  Score: {q.score}/10
                                </div>
                              </div>
                              <p className="text-white font-bold leading-tight">{q.question}</p>
                              
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/50">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                  <span className="text-brand-400 font-bold mr-2 uppercase text-[10px]">Candidate Answer:</span> 
                                  {q.answer || <span className="italic opacity-50">No response provided</span>}
                                </p>
                              </div>

                              <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10">
                                <p className="text-xs text-slate-400 leading-relaxed italic italic">
                                  <span className="text-brand-400 font-bold non-italic not-italic mr-2 uppercase text-[9px]">AI Critique:</span> 
                                  "{q.feedback}"
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex-1 flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <MessageSquare size={14} className="text-brand-400" /> Evaluation Notes
                        </label>
                        <textarea
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="Add your internal evaluation notes here..."
                          className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white text-sm focus:border-brand-500 outline-none transition-all resize-none leading-relaxed"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium italic">
                        <p>
                          {selectedApplicant.updatedAt && `Last updated: ${new Date(selectedApplicant.updatedAt).toLocaleString()}`}
                        </p>
                        <button
                          onClick={handleSaveNotes}
                          disabled={isSavingNotes || currentNotes === (selectedApplicant.recruiterNotes || '')}
                          className={`
                                 font-bold uppercase tracking-widest transition-all
                                 ${isSavingNotes
                              ? 'text-slate-600 cursor-not-allowed'
                              : currentNotes === (selectedApplicant.recruiterNotes || '')
                                ? 'text-slate-600 cursor-default'
                                : 'text-brand-400 hover:text-brand-300'}
                              `}
                        >
                          {isSavingNotes ? 'Saving...' : 'Save notes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-sm">
                  <div className="w-16 h-16 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center mx-auto text-slate-600 shadow-inner">
                    <Users size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">No Applicant Selected</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Choose a candidate from the left panel to begin reviewing their application, assessment scores, and resume.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default JobApplicants;
