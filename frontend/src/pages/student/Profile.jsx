import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Edit3, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ResumeCard from '../../components/profile/ResumeCard';
import SkillsCard from '../../components/profile/SkillsCard';
import ExperienceEducation from '../../components/profile/ExperienceEducation';
import SocialLinks from '../../components/profile/SocialLinks';
import EditProfileModal from '../../components/profile/EditProfileModal';
import useAuthStore from '../../store/authStore';

const StudentProfile = () => {
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Dynamic Header Actions */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-0">
          <button 
            onClick={handleShare}
            className="p-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700/50 transition-all"
            title="Share Profile"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-600/20"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

        {/* Profile Header Widget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ProfileHeader user={user} />
        </motion.div>

        {/* Content Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Core Identity & Professional Data */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={item}>
              <ExperienceEducation />
            </motion.div>
          </div>

          {/* Right Column: Key Assets & Connectivity */}
          <div className="space-y-8">
            <motion.div variants={item}>
              <ResumeCard />
            </motion.div>
            <motion.div variants={item}>
              <SkillsCard onEdit={() => setIsEditModalOpen(true)} />
            </motion.div>
            <motion.div variants={item}>
              <SocialLinks onEdit={() => setIsEditModalOpen(true)} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user}
      />
    </DashboardLayout>
  );
};

export default StudentProfile;
