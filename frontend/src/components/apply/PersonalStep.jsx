import { User, Mail, Phone, MapPin, Upload, FileText, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const PersonalStep = ({ register, errors, setValue, watch }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const resumeFile = watch('resume');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadToCloudinary = async (file) => {
    // Only PDF restriction
    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file only.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await api.post('/applications/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success("Resume uploaded successfully!");
        // Store the URL in a specific field that we'll send to the backend
        setValue('resumeUrl', data.resumeUrl);
        // Also keep the file for UI display (name/size)
        setValue('resume', file); 
      }
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error.response?.data?.message || "Failed to upload resume");
      setValue('resume', null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadToCloudinary(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadToCloudinary(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Personal Information</h2>
        <p className="text-slate-500 text-sm">Review your basic details and upload your latest resume</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-brand-400 transition-colors">
              <User size={18} />
            </div>
            <input 
              {...register('fullName')}
              type="text"
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${errors.fullName ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-brand-500'} rounded-xl text-white focus:outline-none transition-all placeholder:text-slate-700`}
            />
          </div>
          {errors.fullName && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-brand-400 transition-colors">
              <Mail size={18} />
            </div>
            <input 
              {...register('email')}
              type="email"
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-brand-500'} rounded-xl text-white focus:outline-none transition-all placeholder:text-slate-700`}
            />
          </div>
          {errors.email && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
              <Phone size={18} />
            </div>
            <input 
              {...register('phone')}
              type="tel"
              placeholder="+91 98765 43210"
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${errors.phone ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-brand-500'} rounded-xl text-white focus:outline-none transition-all placeholder:text-slate-700`}
            />
          </div>
          {errors.phone && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1">{errors.phone.message}</p>}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Location</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
              <MapPin size={18} />
            </div>
            <input 
              {...register('location')}
              type="text"
              placeholder="e.g. Mumbai, India"
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-900 border ${errors.location ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-brand-500'} rounded-xl text-white focus:outline-none transition-all placeholder:text-slate-700`}
            />
          </div>
          {errors.location && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1">{errors.location.message}</p>}
        </div>
      </div>

      {/* Resume Upload Section */}
      <div className="space-y-3 pt-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          New Resume Upload
          <span className="text-[9px] font-normal uppercase bg-brand-500/10 px-2 py-0.5 rounded text-brand-400">Required</span>
        </label>
        
        <div 
          onDragEnter={handleDrag}
          className={`
            relative p-8 border-2 border-dashed rounded-3xl transition-all
            ${dragActive ? 'border-brand-500 bg-brand-500/5 scale-[1.01]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 focus-within:border-brand-500'}
            ${resumeFile ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
            ${errors.resume ? 'border-rose-500/50 bg-rose-500/5' : ''}
          `}
        >
          <input
            {...register('resume')}
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf"
            onChange={onFileChange}
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <Loader2 size={40} className="text-brand-500 animate-spin" />
                <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Uploading to Secure Storage...</p>
              </div>
            ) : resumeFile ? (
              <div className="space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <FileText size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white max-w-[250px] truncate">{resumeFile.name || 'Resume Attached'}</p>
                  <p className="text-[10px] text-emerald-500/60 mt-1 font-bold uppercase tracking-widest">Securely Uploaded</p>
                </div>
                <button 
                  type="button"
                  onClick={() => { setValue('resume', null); setValue('resumeUrl', null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 rounded-xl text-[10px] font-bold uppercase transition-all mx-auto"
                >
                  <X size={14} /> Remove File
                </button>
              </div>
            ) : (
              <label 
                htmlFor="resume-upload"
                className="cursor-pointer group flex flex-col items-center gap-4"
              >
                <div className="w-14 h-14 bg-slate-800 group-hover:bg-brand-600/20 group-hover:text-brand-400 rounded-2xl flex items-center justify-center transition-all text-slate-500">
                  <Upload size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-500">PDF documents only (Max 5MB)</p>
                </div>
                <div className="text-[10px] text-rose-500/70 font-bold uppercase tracking-widest px-4 py-1.5 bg-rose-500/5 rounded-lg border border-rose-500/10">
                  Required for this application
                </div>
              </label>
            )}
          </div>
          
          {dragActive && (
            <div 
              className="absolute inset-0 z-10 w-full h-full"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalStep;
