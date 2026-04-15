import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Loader2, 
  Sparkles, 
  Code2, 
  Share2,
  Plus,
  Trash2,
  Calendar,
  Building2,
  FileText
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const EditProfileModal = ({ isOpen, onClose, user }) => {
  const { updateUser, isLoading } = useAuthStore();
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      headline: user?.headline || '',
      bio: user?.bio || '',
      skillsString: user?.skills?.join(', ') || '',
      currentLocation: user?.currentLocation || '',
      phoneNumber: user?.phoneNumber || '',
      collegeName: user?.collegeName || '',
      degree: user?.degree || '',
      specialization: user?.specialization || '',
      graduationYear: user?.graduationYear || '',
      socialLinks: {
        linkedin: user?.socialLinks?.linkedin || '',
        github: user?.socialLinks?.github || '',
        portfolio: user?.socialLinks?.portfolio || '',
        twitter: user?.socialLinks?.twitter || '',
      },
      experiences: user?.experiences?.length > 0 ? user.experiences : [{ role: '', company: '', period: '', location: '', desc: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences"
  });

  const onSubmit = async (data) => {
    // Convert comma-separated string back to array
    const profileData = {
      ...data,
      skills: data.skillsString.split(',').map(s => s.trim()).filter(s => s !== '')
    };
    delete profileData.skillsString;

    const { success, message } = await updateUser(profileData);
    if (success) {
      toast.success(message || 'Profile updated!');
      onClose();
    } else {
      toast.error(message || 'Failed to update profile');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-600/10 to-transparent">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight font-bold">Update your professional identity</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <User size={12} /> First Name
                  </label>
                  <input 
                    {...register('firstName')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <User size={12} /> Last Name
                  </label>
                  <input 
                    {...register('lastName')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Briefcase size={12} /> Headline
                  </label>
                  <input 
                    {...register('headline')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Sparkles size={12} /> Bio / Professional Summary
                  </label>
                  <textarea 
                    {...register('bio')}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm resize-none"
                    placeholder="Tell us about your professional journey..."
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Code2 size={12} /> Skills (Comma separated)
                  </label>
                  <input 
                    {...register('skillsString')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                    placeholder="React, Node.js, Python..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Mail size={12} /> Email
                  </label>
                  <input 
                    {...register('email')}
                    disabled
                    className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Phone size={12} /> Phone
                  </label>
                  <input 
                    {...register('phoneNumber')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <MapPin size={12} /> Location
                  </label>
                  <input 
                    {...register('currentLocation')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                  />
                </div>

                {/* Dynamic Work Experience Section */}
                <div className="sm:col-span-2 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Briefcase size={14} /> Work Experience History
                    </h4>
                    <button
                      type="button"
                      onClick={() => append({ role: '', company: '', period: '', location: '', desc: '' })}
                      className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-lg text-[10px] font-bold uppercase transition-all border border-brand-500/20"
                    >
                      <Plus size={14} /> Add Experience
                    </button>
                  </div>

                  <div className="space-y-8">
                    {fields.map((field, index) => (
                      <motion.div 
                        key={field.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-6 bg-slate-950/50 border border-slate-800 rounded-2xl group"
                      >
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remove Experience"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider pl-1 flex items-center gap-2">
                              <User size={10} /> Role / Designation
                            </label>
                            <input 
                              {...register(`experiences.${index}.role`)}
                              placeholder="Frontend Engineer"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 transition-all text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider pl-1 flex items-center gap-2">
                              <Building2 size={10} /> Company
                            </label>
                            <input 
                              {...register(`experiences.${index}.company`)}
                              placeholder="Tech Corp"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 transition-all text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider pl-1 flex items-center gap-2">
                              <Calendar size={10} /> Period
                            </label>
                            <input 
                              {...register(`experiences.${index}.period`)}
                              placeholder="Jan 2022 - Present"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 transition-all text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider pl-1 flex items-center gap-2">
                              <MapPin size={10} /> Location
                            </label>
                            <input 
                              {...register(`experiences.${index}.location`)}
                              placeholder="Remote / New York"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 transition-all text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider pl-1 flex items-center gap-2">
                              <FileText size={10} /> Description
                            </label>
                            <textarea 
                              {...register(`experiences.${index}.desc`)}
                              rows={2}
                              placeholder="Briefly describe your responsibilities and achievements..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 transition-all text-xs resize-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="sm:col-span-2 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest pl-1 mb-4 flex items-center gap-2">
                    <Share2 size={14} /> Social & External Links
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">LinkedIn URL</label>
                      <input 
                        {...register('socialLinks.linkedin')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">GitHub URL</label>
                      <input 
                        {...register('socialLinks.github')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Portfolio URL</label>
                      <input 
                        {...register('socialLinks.portfolio')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Twitter URL</label>
                      <input 
                        {...register('socialLinks.twitter')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Data: Education */}
                <div className="sm:col-span-2 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest pl-1 mb-4">Educational Background (Registration)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                         College Name
                      </label>
                      <input 
                        {...register('collegeName')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                         Degree
                      </label>
                      <input 
                        {...register('degree')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                         Specialization
                      </label>
                      <input 
                        {...register('specialization')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                         Graduation Year
                      </label>
                      <input 
                        {...register('graduationYear')}
                        type="number"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-900 pt-6 pb-2 mt-4 flex items-center justify-end gap-3 border-t border-slate-800 z-10">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
