import { motion } from 'framer-motion';
import { Camera, MapPin, Mail, Phone, Calendar, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ProfileHeader = ({ user }) => {
  const { regenerateSummary, updateUser, updateAvatar, isLoading } = useAuthStore();

  const calculateCompletion = () => {
    let score = 0;
    if (user?.firstName) score += 10;
    if (user?.lastName) score += 10;
    if (user?.avatar) score += 10;
    if (user?.headline && user?.headline !== 'Aspirant') score += 10;
    if (user?.bio) score += 10;
    if (user?.phoneNumber) score += 10;
    if (user?.currentLocation) score += 10;
    if (user?.skills?.length > 0) score += 10;
    if (user?.experiences?.length > 0) score += 10;
    if (user?.education?.length > 0 || user?.collegeName) score += 10;
    return score;
  };

  const completionPercentage = calculateCompletion();

  const handleRegenerateSummary = async () => {
    const { success, message, data } = await regenerateSummary();
    if (success) {
      toast.success('Professional summary updated with AI!');
    } else {
      toast.error(message || 'Failed to generate summary');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (optional but recommended)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size too large. Max 5MB allowed.');
    }

    const { success, message } = await updateAvatar(file);
    if (success) {
      toast.success('Profile photo updated!');
    } else {
      toast.error(message || 'Failed to update photo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner & Avatar Section */}
      <div className="relative">
        <div className="h-48 sm:h-64 w-full rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600/30 via-indigo-600/30 to-purple-600/30 border border-slate-700/50">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>
        
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-slate-900 border-4 border-background overflow-hidden relative shadow-2xl">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white uppercase">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                )}
            </div>
            <label className="absolute bottom-2 right-2 p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg transition-all scale-0 group-hover:scale-100 cursor-pointer">
               <Camera size={18} />
               <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
            </label>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="pt-14 sm:pt-16 pb-2 px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              {completionPercentage === 100 && <CheckCircle2 size={20} className="text-brand-400" />}
            </div>
            <p className="text-lg text-brand-400 font-medium mt-1">{user?.headline || 'Aspirant'}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            {user?.currentLocation && (
              <div className="flex items-center gap-2">
                <MapPin size={16} /> {user.currentLocation}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Mail size={16} /> {user?.email}
            </div>
            {user?.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone size={16} /> {user.phoneNumber}
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="w-full lg:w-80 glass-card p-5 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Profile Completion</span>
            <span className="text-sm font-bold text-brand-400">{completionPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${completionPercentage}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="h-full bg-gradient-to-r from-brand-500 to-indigo-500"
             />
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
             <Sparkles size={12} className="text-brand-400" />
             {completionPercentage < 100 ? 'Complete your profile to reach 100%' : 'Your profile is fully optimized!'}
          </p>
        </div>
      </div>

      {/* AI Professional Summary Section */}
      <div className="glass-card p-6 bg-gradient-to-br from-brand-500/5 to-transparent border border-brand-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={20} className="text-brand-400" />
            <h3 className="font-bold text-lg">AI Professional Summary</h3>
          </div>
          <button 
            onClick={handleRegenerateSummary}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors bg-brand-500/10 px-3 py-1.5 rounded-lg border border-brand-500/20 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Regenerate with AI
          </button>
        </div>
        <p className="text-slate-300 leading-relaxed text-sm sm:text-base italic">
          {user?.bio || '"No professional summary generated yet. Click regenerate to build one using your profile data."'}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
