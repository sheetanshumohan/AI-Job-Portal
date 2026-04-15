import { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Trash2, 
  ArrowUpRight, 
  Eye, 
  MoreVertical,
  FileText,
  Copy,
  ExternalLink,
  Download
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApplicationTimeline from './ApplicationTimeline';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    applied: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    review: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    interview: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    offer: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    rejected: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };

  return (
    <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.applied}`}>
      {status}
    </span>
  );
};

const ApplicationCard = ({ application, onWithdraw }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    const jobLink = `${window.location.origin}/student/jobs/${application.jobId}`;
    navigator.clipboard.writeText(jobLink);
    toast.success('Job link copied to clipboard!');
    setShowMenu(false);
  };

  const getOptimizedUrl = (url, isDownload = false) => {
    if (!url) return '';
    
    // Check if it's a Cloudinary URL
    if (url.includes('cloudinary.com')) {
      let optimized = url;
      
      // 1. Ensure it uses 'raw/upload' instead of 'image/upload'
      optimized = optimized.replace('/image/upload/', '/raw/upload/');

      // 2. Remove transformation hacks like f_pdf since they aren't supported for 'raw'
      // This regex looks for anything between /upload/ and the version (v12345/) or the folder
      optimized = optimized.replace(/\/upload\/[^v][^\/]+\//, '/upload/');

      // 3. Robust Extension Handling (prevent double .pdf)
      // Remove any existing .pdf extension(s) and then add exactly one
      const baseUrl = optimized.split('?')[0];
      const query = optimized.includes('?') ? '?' + optimized.split('?')[1] : '';
      
      const cleanBase = baseUrl.replace(/(\.pdf)+$/i, '');
      optimized = cleanBase + '.pdf' + query;
      
      return optimized;
    }
    return url;
  };

  const handleViewResume = () => {
    if (application.resumeUrl) {
      const pdfUrl = getOptimizedUrl(application.resumeUrl);
      window.open(pdfUrl, '_blank');
    } else {
      toast.error('Resume link not available');
    }
    setShowMenu(false);
  };



  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 border border-slate-700/50 hover:border-brand-500/30 transition-all group relative"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-6">
        {/* Job & Company Info */}
        <div className="flex flex-col gap-2">
          <div className="space-y-1.5">
            <h3 className="text-white font-bold group-hover:text-brand-400 transition-colors leading-tight text-lg">
              {application.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><Building2 size={14} /> {application.company}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {application.location}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {application.dateApplied}</span>
            </div>
          </div>
        </div>


        {/* Status Badge & Actions */}
        <div className="flex sm:flex-col justify-between items-end gap-3 relative" ref={menuRef}>
          <StatusBadge status={application.status} />
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 transition-all rounded-lg ${showMenu ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-white hover:bg-slate-800/50'}`}
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5 backdrop-blur-xl"
              >
                <button
                  onClick={handleViewResume}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
                >
                  <FileText size={16} className="text-brand-400" />
                  View Original Resume
                </button>
                <button
                  onClick={() => {
                    const downloadUrl = getOptimizedUrl(application.resumeUrl, true);
                    
                    // Use a hidden anchor tag for more reliable cross-origin downloading
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.setAttribute('download', `${application.title.replace(/\s+/g, '_')}_Resume.pdf`);
                    link.setAttribute('target', '_blank');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
                >
                  <Download size={16} className="text-brand-400" />
                  Download as PDF
                </button>




                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
                >
                  <Copy size={16} className="text-emerald-400" />
                  Copy Job Link
                </button>
                <div className="h-px bg-slate-800/50 my-1 px-2" />
                <button
                  onClick={() => { onWithdraw(application.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-bold"
                >
                  <Trash2 size={16} />
                  Withdraw Application
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


      <div className="mt-8 mb-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
        <ApplicationTimeline currentStage={application.status} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-800/50">
        <Link 
          to={`/student/jobs/${application.jobId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all border border-slate-700/50"
        >
          <Eye size={16} /> View Details
        </Link>

        <button 
          onClick={() => onWithdraw(application.id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold transition-all border border-rose-500/10"
        >
          <Trash2 size={16} /> Withdraw Application
        </button>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;
