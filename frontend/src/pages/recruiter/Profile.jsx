import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Globe, 
  Calendar, 
  Camera, 
  Edit3, 
  Check, 
  X, 
  ExternalLink,
  Building2,
  Users,
  Award,
  ShieldCheck,
  Building
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/axios';

const profileSchema = z.object({
  recruiterName: z.string().min(2, 'Name must be at least 2 characters'),
  designation: z.string().min(2, 'Designation is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  companyName: z.string().min(2, 'Company name is required'),
  companyWebsite: z.string().url('Invalid website URL'),
  companySize: z.string(),
  industry: z.string(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()),
  companyDescription: z.string().max(2000, 'Description too long'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL'),
  companyCity: z.string().min(2, 'City is required'),
  companyCountry: z.string().min(2, 'Country is required'),
});

const RecruiterProfile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  const avatarInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/recruiter/profile');
      if (response.data.success) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
  });

  // Reset form when profile data is loaded
  useEffect(() => {
    if (profileData) {
      reset({
        recruiterName: profileData.recruiterName || '',
        designation: profileData.designation || '',
        phoneNumber: profileData.phoneNumber || '',
        companyName: profileData.companyName || '',
        companyWebsite: profileData.companyWebsite || '',
        companySize: profileData.companySize || '51-200',
        industry: profileData.industry || '',
        foundedYear: profileData.foundedYear || 2012,
        companyDescription: profileData.companyDescription || '',
        linkedinUrl: profileData.linkedinUrl || '',
        companyCity: profileData.companyCity || '',
        companyCountry: profileData.companyCountry || '',
      });
    }
  }, [profileData, reset]);

  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Syncing changes...');
    try {
      const response = await api.put('/recruiter/profile', data);
      if (response.data.success) {
        setProfileData(response.data.data);
        setIsEditModalOpen(false);
        toast.success('Profile updated successfully!', { id: loadingToast });
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Update failed', { id: loadingToast });
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type === 'avatar' ? 'avatar' : 'logo', file);

    const loadingToast = toast.loading(`Uploading ${type}...`);
    try {
      const endpoint = type === 'avatar' ? '/recruiter/update-avatar' : '/recruiter/update-logo';
      const response = await api.post(endpoint, formData);
      if (response.data.success) {
        setProfileData(prev => ({ 
          ...prev, 
          [type === 'avatar' ? 'avatar' : 'companyLogo']: response.data.data 
        }));
        toast.success(`${type === 'avatar' ? 'Avatar' : 'Logo'} updated!`, { id: loadingToast });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed', { id: loadingToast });
    }
  };

  if (isLoading || !profileData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* Cover & Profile Header */}
        <div className="relative group">
          <div className="h-64 w-full rounded-[40px] bg-gradient-to-r from-brand-600 to-indigo-700 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/40" />
          </div>
          
          <div className="max-w-5xl mx-auto px-10">
             <div className="flex flex-col md:flex-row items-end gap-8 -mt-20 relative z-10">
                <div className="relative">
                   <div 
                     onClick={() => avatarInputRef.current?.click()}
                     className="w-44 h-44 rounded-[48px] bg-slate-900 p-1.5 shadow-2xl relative overflow-hidden group/avatar border-4 border-slate-900 cursor-pointer"
                   >
                      <img src={profileData.avatar || "https://i.pravatar.cc/150?u=recruiter"} alt="Profile" className="w-full h-full object-cover rounded-[42px]" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                         <Camera className="text-white" size={32} />
                      </div>
                      <input 
                        type="file" 
                        ref={avatarInputRef} 
                        onChange={(e) => handleImageUpload(e, 'avatar')} 
                        className="hidden" 
                        accept="image/*"
                      />
                   </div>
                   <div className="absolute bottom-2 right-2 w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center border-4 border-slate-900 text-white shadow-xl">
                      <ShieldCheck size={20} />
                   </div>
                </div>

                <div className="flex-1 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h1 className="text-4xl font-bold text-white tracking-tight">{profileData.recruiterName}</h1>
                         <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                           {profileData.isVerified ? 'Verified Recruiter' : 'Profile Complete'}
                         </span>
                      </div>
                      <p className="text-lg text-slate-300 font-medium flex items-center gap-2">
                         <Briefcase size={18} className="text-brand-400" /> {profileData.designation || 'Recruiter'} at <span className="text-white">{profileData.companyName || 'Organization'}</span>
                      </p>
                   </div>
                   
                   <button 
                     onClick={() => setIsEditModalOpen(true)}
                     className="px-8 py-3.5 bg-white text-slate-950 rounded-2xl font-bold text-sm flex items-center gap-2.5 hover:bg-brand-50 transition-all shadow-xl shadow-brand-600/10 shrink-0"
                   >
                      <Edit3 size={18} /> Edit Profile
                   </button>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
           
           {/* Left Sidebar: About & Contact */}
           <div className="lg:col-span-1 space-y-8">
              
              {/* Contact Card */}
              <div className="glass-card p-8 border border-slate-700/50 space-y-6">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Personal Details</h3>
                 <div className="space-y-5">
                    <div className="flex items-center gap-4 group cursor-pointer">
                       <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-brand-400 group-hover:bg-brand-500/10 transition-colors">
                          <Mail size={18} />
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
                          <p className="text-sm text-white font-medium truncate">{profileData.email}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                       <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                          <Phone size={18} />
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phone Number</p>
                          <p className="text-sm text-white font-medium">{profileData.phoneNumber || 'Not provided'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                       <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                          <MapPin size={18} />
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Base Location</p>
                          <p className="text-sm text-white font-medium">{profileData.companyCity || 'City'}, {profileData.companyCountry || 'Country'}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* LinkedIn Presence */}
              <div className="p-8 bg-gradient-to-br from-[#0077b5]/10 to-[#0077b5]/5 border border-[#0077b5]/20 rounded-[32px] group relative overflow-hidden">
                 <div className="absolute -top-4 -right-4 text-[#0077b5]/10 opacity-50 group-hover:scale-110 transition-transform">
                    <FaLinkedin size={100} />
                 </div>
                 <h3 className="text-xs font-bold text-[#0077b5] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <FaLinkedin size={16} /> Professional Presence
                 </h3>
                 <p className="text-sm text-slate-400 leading-relaxed mb-6">Connect with me on LinkedIn to see my network and professional endorsements.</p>
                 <a 
                   href={profileData.linkedinUrl}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-4 bg-[#0077b5] hover:bg-[#0077b5]/90 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0077b5]/20"
                 >
                    View LinkedIn Profile <ExternalLink size={14} />
                 </a>
              </div>
           </div>

           {/* Right Column: Company Details */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Company Profile Card */}
              <div className="glass-card p-10 border border-slate-700/50">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10">
                    <div className="flex items-center gap-6">
                       <div 
                         onClick={() => logoInputRef.current?.click()}
                         className="w-20 h-20 bg-white rounded-3xl p-3 shadow-xl flex items-center justify-center cursor-pointer group/logo relative overflow-hidden"
                       >
                          <img src={profileData.companyLogo || "https://logo.clearbit.com/github.com"} alt="Company Logo" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                             <Camera className="text-white" size={20} />
                          </div>
                          <input 
                            type="file" 
                            ref={logoInputRef} 
                            onChange={(e) => handleImageUpload(e, 'logo')} 
                            className="hidden" 
                            accept="image/*"
                          />
                       </div>
                       <div className="space-y-1">
                          <h2 className="text-2xl font-bold text-white">{profileData.companyName || 'Your Company'}</h2>
                          {profileData.companyWebsite && (
                            <a href={profileData.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-brand-400 text-sm font-medium hover:underline flex items-center gap-1.5">
                               {profileData.companyWebsite.replace(/^https?:\/\//, '')} <ExternalLink size={12} />
                            </a>
                          )}
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="px-5 py-3 bg-slate-800 rounded-2xl border border-slate-700/50 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Size</p>
                          <p className="text-sm text-white font-bold">{profileData.companySize || 'N/A'}</p>
                       </div>
                       <div className="px-5 py-3 bg-slate-800 rounded-2xl border border-slate-700/50 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Est.</p>
                          <p className="text-sm text-white font-bold">{profileData.foundedYear || 'N/A'}</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                       <div className="w-10 h-10 bg-brand-500/10 rounded-xl rotate-3 flex items-center justify-center text-brand-400">
                          <Building2 size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Industry Sector</p>
                          <p className="text-sm text-white font-bold mt-1">{profileData.industry || 'Not set'}</p>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                       <div className="w-10 h-10 bg-indigo-500/10 rounded-xl -rotate-3 flex items-center justify-center text-indigo-400">
                          <Users size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Key Headcount</p>
                          <p className="text-sm text-white font-bold mt-1">{profileData.companySize || 'N/A'} Employees</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Building size={14} className="text-brand-400" /> About the Organization
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-sm bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                       {profileData.companyDescription || 'Provide a compelling description of your company to attract the best talent.'}
                    </p>
                 </div>
              </div>
           </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-white">Refine Profile</h2>
                 <button 
                   onClick={() => setIsEditModalOpen(false)}
                   className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                 {/* Identification Section */}
                 <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em]">IDENTITY & DESIGNATION</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">YOUR FULL NAME</label>
                          <input 
                            {...register('recruiterName')}
                            placeholder="e.g. Sheetanshu Mohan"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                          {errors.recruiterName && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.recruiterName.message}</p>}
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">OFFICIAL DESIGNATION</label>
                          <input 
                            {...register('designation')}
                            placeholder="e.g. Senior Talent Acquisition"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                          {errors.designation && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.designation.message}</p>}
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">DIRECT PHONE</label>
                          <input 
                            {...register('phoneNumber')}
                            placeholder="e.g. +91 98765 43210"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                          {errors.phoneNumber && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.phoneNumber.message}</p>}
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">LINKEDIN URL</label>
                          <input 
                            {...register('linkedinUrl')}
                            placeholder="e.g. https://linkedin.com/in/..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                          {errors.linkedinUrl && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.linkedinUrl.message}</p>}
                       </div>
                    </div>
                 </div>

                 {/* Company Section */}
                 <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em]">ORGANIZATION DETAILS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">COMPANY REGISTERED NAME</label>
                          <input 
                            {...register('companyName')}
                            placeholder="e.g. TechCloud Systems"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                          {errors.companyName && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.companyName.message}</p>}
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">CORPORATE WEBSITE</label>
                          <input 
                            {...register('companyWebsite')}
                            placeholder="e.g. https://techcloud.io"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                          {errors.companyWebsite && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.companyWebsite.message}</p>}
                       </div>
                    </div>
                    
                    {/* Location Row - NEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">COMPANY CITY</label>
                          <input 
                            {...register('companyCity')}
                            placeholder="e.g. Bangalore"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                          {errors.companyCity && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.companyCity.message}</p>}
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">COMPANY COUNTRY</label>
                          <input 
                            {...register('companyCountry')}
                            placeholder="e.g. India"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                          {errors.companyCountry && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.companyCountry.message}</p>}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">SIZE</label>
                          <select 
                            {...register('companySize')}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer"
                          >
                             <option value="1-10">1-10 Employees</option>
                             <option value="11-50">11-50 Employees</option>
                             <option value="51-200">51-200 Employees</option>
                             <option value="201-500">201-500 Employees</option>
                             <option value="501-1000">501-1000 Employees</option>
                             <option value="1000+">1000+ Employees</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">INDUSTRY</label>
                          <input 
                            {...register('industry')}
                            placeholder="e.g. Software"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1">ESTABLISHED</label>
                          <input 
                            type="number"
                            {...register('foundedYear', { valueAsNumber: true })}
                            placeholder="2012"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 ml-1">ORGANIZATION BIO</label>
                       <textarea 
                         {...register('companyDescription')}
                         placeholder="Describe your organization's mission and core values..."
                         className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl px-6 py-4 text-white focus:border-brand-500 outline-none transition-all resize-none h-40 font-light leading-relaxed"
                       />
                       {errors.companyDescription && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.companyDescription.message}</p>}
                    </div>
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2"
                    >
                       <Check size={18} /> Persist Changes
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default RecruiterProfile;
