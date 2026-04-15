import { FileText, Eye, Download, RefreshCw, Clock, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { useRef } from 'react';

const ResumeCard = () => {
  const { user, updateResume, isLoading } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const resumeUrl = user?.resumeUrl;
  const fileName = resumeUrl ? resumeUrl.split('/').pop().split('?')[0] : 'No resume uploaded';
  const fileExtension = fileName.split('.').pop().toUpperCase();
  const isImageOrPdf = ['PDF', 'JPG', 'JPEG', 'PNG', 'WEBP'].includes(fileExtension);
  
  // For non-browser-viewable files (like DOC/DOCX), use Google Docs Viewer
  const viewUrl = isImageOrPdf 
    ? resumeUrl 
    : `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return toast.error('Invalid file type. Please upload PDF or DOC/DOCX.');
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large. Max 5MB allowed.');
    }

    const { success, message } = await updateResume(file);
    if (success) {
      toast.success('Resume updated successfully!');
    } else {
      toast.error(message || 'Failed to update resume');
    }
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col group border border-slate-700/50 hover:border-brand-500/30 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold">Primary Resume</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
              {resumeUrl ? `${fileExtension} • VERIFIED` : 'NOT FOUND'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
          <Clock size={12} /> LATEST
        </div>
      </div>

      <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-4 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500" />
        <div className="w-16 h-16 bg-brand-500/5 rounded-full flex items-center justify-center">
            <FileText size={32} className="text-slate-600" />
        </div>
        <div>
          <p className="text-white font-semibold italic text-sm truncate max-w-[200px]">
            {resumeUrl ? `"${fileName}"` : "Click 'Upload' to add your resume"}
          </p>
          <p className="text-slate-500 text-xs mt-1 italic">
            {user?.updatedAt ? `Last synchronized: ${new Date(user.updatedAt).toLocaleDateString()}` : 'Not synced'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resumeUrl && (
          <a 
            href={viewUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Eye size={16} /> View
          </a>
        )}
        
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
        />
        
        <button 
          onClick={() => fileInputRef.current.click()}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-600/20 ${resumeUrl ? '' : 'sm:col-span-2'}`}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {resumeUrl ? 'Replace' : 'Upload Resume'}
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
