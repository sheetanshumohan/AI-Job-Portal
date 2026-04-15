import useAuthStore from '../../store/authStore';
import { Globe, FileText, CheckCircle2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';

const ReviewStep = ({ register, errors, watch }) => {
  const { user } = useAuthStore();
  const formData = watch();
  
  // Extract filename from URL
  const getFileName = (url) => {
    if (!url) return "No resume uploaded";
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    // Remove Cloudinary unique ID if present (optional)
    console.log(fileName)
    return fileName.split('_').slice(1).join('_') || fileName;
  };

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Final Review</h2>
        <p className="text-slate-500 text-sm">Review your application before submitting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Links Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Portfolio & Links</h3>
          
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                <FaGithub size={18} />
              </div>
              <input 
                {...register('githubUrl')}
                placeholder="GitHub Profile URL"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                <Globe size={18} />
              </div>
              <input 
                {...register('portfolioUrl')}
                placeholder="Portfolio Website URL"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Resume Preview Box */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Resume Selected</h3>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 group cursor-pointer hover:border-brand-500/50 transition-all shadow-xl">
             <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                <FileText size={24} />
             </div>
              <div className="flex-1">
                {formData.resume ? (
                  <>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">{formData.resume.name}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight mt-0.5 whitespace-nowrap">File ready for upload</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-rose-500 uppercase tracking-tight">Resume Missing</p>
                    <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-tight mt-0.5">Please go back and upload</p>
                  </>
                )}
              </div>
             <CheckCircle2 size={18} className={formData.resume ? "text-emerald-500" : "text-slate-700"} />
          </div>
        </div>


      </div>

      {/* Confirmation Wrapper */}
      <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input 
            type="checkbox"
            {...register('terms')}
            className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 transition-all"
          />
          <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
            I confirm that all the information provided above is accurate and I authorize the recruiter to review my profile and resume for this application.
          </span>
        </label>
        {errors.terms && <p className="text-[10px] text-rose-500 font-bold uppercase mt-2 ml-7">{errors.terms.message}</p>}
      </div>
    </div>
  );
};

export default ReviewStep;
