import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Users, 
  Calendar, 
  Sparkles,
  Save,
  Rocket,
  Plus,
  Info,
  ChevronRight,
  Globe,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import DashboardLayout from '../../components/layout/DashboardLayout';
import TagInput from '../../components/recruiter/TagInput';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';


const jobSchema = z.object({
  jobTitle: z.string().min(5, "Title must be at least 5 characters").max(120),
  companyName: z.string().min(2, "Company name is required"),
  jobType: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Remote']),
  workplaceType: z.enum(['On-site', 'Remote', 'Hybrid']),
  jobLocation: z.object({
    city: z.string().min(2, "City is required"),
    state: z.string().optional().default(''),
    country: z.string().default('India'),
    isPrimarilyRemote: z.boolean().default(false)
  }),
  salaryRange: z.object({
    min: z.union([z.string(), z.number()]).transform(v => Number(v) || 0),
    max: z.union([z.string(), z.number()]).transform(v => Number(v) || 0),
    currency: z.string().default('INR'),
    period: z.enum(['per month', 'per year', 'per hour', 'fixed']).default('per year'),
    isNegotiable: z.boolean().default(false),
    isDisclosed: z.boolean().default(true)
  }),
  jobDescription: z.string().min(50, "Description must be at least 50 characters"),
  skillsRequired: z.array(z.string()).min(1, "At least one skill is required"),
  requiredTechnologies: z.array(z.string()).min(1, "At least one technology is required"),
  educationRequired: z.object({
    degree: z.enum(["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Any"]),
    fieldOfStudy: z.string().optional().default('')
  }),
  numberOfOpenings: z.union([z.string(), z.number()]).transform(v => Number(v) || 1),
  applicationDeadline: z.string().optional().default('').refine(val => !val || new Date(val) > new Date(), {
    message: "Deadline must be in the future"
  }),
  experienceRequired: z.object({
    min: z.union([z.string(), z.number()]).transform(v => Number(v) || 0),
    max: z.union([z.string(), z.number()]).transform(v => Number(v) || 0),
    level: z.enum(['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Any'])
  }),
  jobStatus: z.enum(['active', 'draft', 'paused', 'closed']).optional().default('active')
});

const PostJob = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(isEditMode);

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobTitle: '',
      jobDescription: '',
      companyName: user?.companyName || '',
      jobType: 'Full-time',
      workplaceType: 'On-site',
      jobLocation: { 
        city: '', 
        state: '',
        country: 'India', 
        isPrimarilyRemote: false 
      },
      salaryRange: { 
        min: '0', 
        max: '0',
        currency: 'INR', 
        period: 'per year', 
        isNegotiable: false, 
        isDisclosed: true 
      },
      educationRequired: { 
        degree: 'Bachelor\'s',
        fieldOfStudy: '' 
      },
      experienceRequired: { 
        min: '0', 
        max: '0',
        level: 'Mid-level' 
      },
      numberOfOpenings: '1',
      applicationDeadline: '',
      skillsRequired: [],
      requiredTechnologies: [],
      jobStatus: 'active'
    }
  });

  useEffect(() => {
    if (isEditMode) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      if (response.data.success) {
        const job = response.data.data;
        reset({
          jobTitle: job.title,
          companyName: job.company,
          jobType: job.type,
          workplaceType: job.workplaceType,
          jobLocation: {
            city: job.location,
            state: '',
            country: 'India',
            isPrimarilyRemote: job.workplaceType === 'Remote'
          },
          salaryRange: job.salary,
          jobDescription: job.description,
          skillsRequired: job.requirements,
          requiredTechnologies: job.technologies,
          educationRequired: job.education,
          numberOfOpenings: String(job.openings),
          applicationDeadline: job.deadline ? job.deadline.split('T')[0] : '',
          experienceRequired: {
            min: String(job.experienceRange?.min || 0),
            max: String(job.experienceRange?.max || 0),
            level: job.level
          },
          jobStatus: job.status
        });
      }
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/recruiter/jobs');
    } finally {
      setIsLoadingJob(false);
    }
  };

  const getFirstErrorMessage = (errs) => {
    for (const key in errs) {
      if (errs[key].message) return errs[key].message;
      if (typeof errs[key] === 'object') {
        const nestedMsg = getFirstErrorMessage(errs[key]);
        if (nestedMsg) return nestedMsg;
      }
    }
    return 'Please check all required fields';
  };

  const onInvalid = (errors) => {
    console.error('Form Validation Errors:', errors);
    const message = getFirstErrorMessage(errors);
    toast.error(`Validation Needed: ${message}`, {
      duration: 4000,
      icon: '📝'
    });
  };

  const onSubmit = async (data, status = 'active') => {
    setIsSubmitting(true);
    const label = isEditMode ? 'Updating' : (status === 'active' ? 'Publishing' : 'Saving');
    const loadingToast = toast.loading(`${label} job...`);
    
    try {
      const payload = { 
        ...data, 
        // If label is 'Updating' (edit mode), use the status from form data (data.jobStatus)
        // unless status parameter is explicitly provided as something other than 'active' 
        // (which is the default when called from the Publish/Save button)
        jobStatus: isEditMode ? data.jobStatus : (status || data.jobStatus)
      };
      
      const response = isEditMode 
        ? await api.patch(`/jobs/${id}`, payload)
        : await api.post('/jobs', payload);

      if (response.data.success) {
        toast.success(isEditMode ? 'Job updated successfully!' : (status === 'active' ? 'Job published successfully!' : 'Job saved as draft'), { id: loadingToast });
        navigate('/recruiter/jobs');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to process job';
      toast.error(errorMsg, { id: loadingToast });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };




  if (isLoadingJob) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading job details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-4 sm:px-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-600/10 rounded-xl border border-brand-500/20">
                <LayoutDashboard className="text-brand-400" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {isEditMode ? 'Edit Position' : 'Post new Position'}
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              {isEditMode ? 'Update the details of your job listing' : 'Fill in the details to find your next great hire'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {!isEditMode && (
               <button 
                 type="button"
                 onClick={handleSubmit((d) => onSubmit(d, 'draft'), onInvalid)}
                 disabled={isSubmitting}
                 className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700/50 text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
               >
                  <Save size={18} /> Save Draft
               </button>
             )}
             <button 
               type="button"
               onClick={handleSubmit((d) => onSubmit(d, 'active'), onInvalid)}
               disabled={isSubmitting}
               className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-brand-600/30 group disabled:opacity-50"
             >
                {isSubmitting ? 'Processing...' : (
                  <>
                    {isEditMode ? <Save size={18} /> : <Rocket size={18} />}
                    {isEditMode ? 'Save Changes' : 'Publish Job'}
                  </>
                )}
             </button>
          </div>
        </div>



        <form className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
            
            {/* Left Column: Core Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Card: Basic Info */}
              <section className="glass-card p-8 border border-slate-700/50 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Info size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-white">General Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Job Title</label>
                    <input 
                      {...register('jobTitle')}
                      placeholder="e.g. Senior Full Stack Engineer"
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-600"
                    />
                    {errors.jobTitle && <p className="text-xs text-rose-400 mt-2 font-medium">{errors.jobTitle.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Company Name</label>
                      <input 
                        {...register('companyName')}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-brand-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Job Type</label>
                      <select 
                        {...register('jobType')}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-brand-500/50 outline-none transition-all appearance-none"
                      >
                        {['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Remote'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Card: Location & Salary */}
              <section className="glass-card p-8 border border-slate-700/50 space-y-6">
                 <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Globe size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Location & Compensation</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Location Column */}
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={14} /> City
                      </label>
                      <input 
                        {...register('jobLocation.city')}
                        placeholder="e.g. Pune"
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-brand-500/50 outline-none transition-all"
                      />
                      {errors.jobLocation?.city && <p className="text-xs text-rose-400 mt-2 font-medium">{errors.jobLocation.city.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Workplace Type</label>
                      <div className="flex gap-3">
                        {['On-site', 'Remote', 'Hybrid'].map(type => (
                          <label key={type} className="flex-1">
                            <input 
                              type="radio" 
                              value={type} 
                              {...register('workplaceType')} 
                              className="hidden peer"
                            />
                            <div className="text-center py-3 bg-slate-900 border border-slate-700/50 rounded-xl cursor-pointer peer-checked:bg-brand-600/10 peer-checked:border-brand-500/50 peer-checked:text-brand-400 text-slate-500 text-xs font-bold transition-all">
                              {type}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Salary Column */}
                  <div className="space-y-4 text-left">
                     <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                        <DollarSign size={14} /> Salary Range
                      </label>
                     <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                           <input 
                             {...register('salaryRange.min')}
                             type="number"
                             placeholder="Min"
                             className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl pl-10 pr-4 py-4 text-white focus:border-brand-500/50 outline-none transition-all"
                           />
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm">$</span>
                        </div>
                        <div className="h-px w-4 bg-slate-700" />
                        <div className="relative flex-1">
                           <input 
                             {...register('salaryRange.max')}
                             type="number"
                             placeholder="Max"
                             className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl pl-10 pr-4 py-4 text-white focus:border-brand-500/50 outline-none transition-all"
                           />
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm">$</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <select 
                           {...register('salaryRange.period')}
                           className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 outline-none focus:border-brand-500/50"
                        >
                           {['per month', 'per year', 'per hour'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                           <input type="checkbox" {...register('salaryRange.isNegotiable')} className="accent-brand-500" />
                           <span className="text-[10px] font-bold text-slate-500 uppercase">Negotiable</span>
                        </div>
                     </div>
                  </div>
                </div>
              </section>

              {/* Card: Description */}
              <section className="glass-card p-8 border border-slate-700/50 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
                  <div className="p-2 bg-brand-600/10 rounded-lg text-brand-400">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Job Description</h3>
                </div>
                
                <div>
                  <textarea 
                    {...register('jobDescription')}
                    rows="12"
                    placeholder="Describe the role, responsibilities, and team..."
                    className="w-full bg-slate-900 border border-slate-700/50 rounded-3xl px-6 py-5 text-white focus:border-brand-500/50 outline-none transition-all placeholder:text-slate-700 leading-relaxed resize-none"
                  />
                  {errors.jobDescription && <p className="text-xs text-rose-400 mt-2 font-medium">{errors.jobDescription.message}</p>}
                </div>
              </section>
            </div>

            {/* Right Column: Sidebar Options */}
            <div className="lg:col-span-1 space-y-8">
               
               {/* Card: Requirements tags */}
               <section className="glass-card p-6 border border-slate-700/50 space-y-6">
                  <Controller
                    control={control}
                    name="skillsRequired"
                    render={({ field }) => (
                      <TagInput 
                        label="Skills Required"
                        placeholder="Type and press Enter..."
                        tags={field.value}
                        onChange={field.onChange}
                        error={errors.skillsRequired?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="requiredTechnologies"
                    render={({ field }) => (
                      <TagInput 
                        label="Technologies"
                        placeholder="React, AWS, etc..."
                        tags={field.value}
                        onChange={field.onChange}
                        error={errors.requiredTechnologies?.message}
                      />
                    )}
                  />
               </section>

               {/* Card: Education & Experience */}
               <section className="glass-card p-6 border border-slate-700/50 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                       <GraduationCap size={16} /> Education
                    </label>
                    <select 
                      {...register('educationRequired.degree')}
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-4 py-4 text-sm text-white focus:border-brand-500/50 outline-none transition-all"
                    >
                      {["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Any"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">Experience Level</label>
                     <select 
                        {...register('experienceRequired.level')}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-4 py-4 text-sm text-white focus:border-brand-500/50 outline-none transition-all"
                     >
                        {['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Any'].map(l => (
                           <option key={l} value={l}>{l}</option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">Post Status</label>
                     <select 
                        {...register('jobStatus')}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-4 py-4 text-sm text-white focus:border-brand-500/50 outline-none transition-all"
                     >
                        {['active', 'draft', 'paused', 'closed'].map(s => (
                           <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                     </select>
                  </div>
               </section>


               {/* Card: Availability & Deadlines */}
               <section className="glass-card p-6 border border-slate-700/50 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                         <Users size={16} /> Openings
                      </label>
                      <input 
                        {...register('numberOfOpenings')}
                        type="number"
                        min="1"
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-brand-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                         <Calendar size={16} /> Deadline
                      </label>
                      <input 
                        {...register('applicationDeadline')}
                        type="date"
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-brand-500/50 outline-none transition-all [color-scheme:dark]"
                      />
                      {errors.applicationDeadline && <p className="text-xs text-rose-400 mt-2 font-medium">{errors.applicationDeadline.message}</p>}
                    </div>
                  </div>
               </section>

               <div className="bg-brand-600/5 border border-brand-500/20 rounded-2xl p-6 flex gap-4">
                  <Info className="text-brand-400 shrink-0" size={20} />
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    This job will be immediately visible to all eligible candidates once published. You can track performance in your dashboard.
                  </p>
               </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostJob;
