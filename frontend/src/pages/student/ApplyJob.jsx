import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ApplyStepper from '../../components/apply/ApplyStepper';
import PersonalStep from '../../components/apply/PersonalStep';
import ProfessionalStep from '../../components/apply/ProfessionalStep';
import DetailsStep from '../../components/apply/DetailsStep';
import ReviewStep from '../../components/apply/ReviewStep';
import ApplySuccess from '../../components/apply/ApplySuccess';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

// --- Form Validation Schema ---
const applySchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  location: z.string().min(2, "Location required"),
  
  experience: z.array(z.object({
    company: z.string().min(1, "Company name required"),
    role: z.string().min(1, "Role required"),
    duration: z.string().min(1, "Duration required")
  })).default([]),
  
  education: z.array(z.object({
    school: z.string().min(1, "School required"),
    degree: z.string().min(1, "Degree required"),
    year: z.string().min(1, "Year required")
  })).default([]),
  
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  salaryExpectation: z.string().min(1, "Expectation required"),
  noticePeriod: z.string().min(1, "Selection required"),
  
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  resume: z.any().optional(),
  resumeUrl: z.string().url("Invalid Resume URL").optional().or(z.literal('')),
  terms: z.boolean().refine(val => val === true, "You must accept the terms")
});


const steps = ['Personal', 'Professional', 'Details', 'Review'];

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(applySchema),
    defaultValues: {
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      location: user?.currentLocation || '',
      experience: user?.experiences?.length > 0 
        ? user.experiences.map(e => ({ company: e.company, role: e.role, duration: e.period }))
        : [{ company: '', role: '', duration: '' }],
      education: user?.education?.length > 0
        ? user.education.map(e => ({ school: e.school, degree: e.degree, year: e.period }))
        : [{ school: '', degree: '', year: '' }],
      skills: user?.skills || [],
      salaryExpectation: '',
      noticePeriod: '',
      resume: null,
      resumeUrl: user?.resumeUrl || '',
      terms: false
    }
  });

  // Use useEffect to reset form if user data loads late
  useEffect(() => {
    if (user) {
      const names = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (names) setValue('fullName', names);
      if (user.email) setValue('email', user.email);
      if (user.phoneNumber) setValue('phone', user.phoneNumber);
      if (user.currentLocation) setValue('location', user.currentLocation);
      if (user.skills?.length > 0) setValue('skills', user.skills);
      if (user.experiences?.length > 0) {
        setValue('experience', user.experiences.map(e => ({ company: e.company, role: e.role, duration: e.period })));
      }
      if (user.education?.length > 0) {
        setValue('education', user.education.map(e => ({ school: e.school, degree: e.degree, year: e.period })));
      }
    }
  }, [user, setValue]);

  const nextStep = async () => {
    // Validate current step fields
    const fields = getFieldsForStep(currentStep);
    const isValid = await trigger(fields);
    if (isValid) setCurrentStep(prev => prev + 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1: return ['fullName', 'email', 'phone', 'location'];
      case 2: return ['experience', 'education'];
      case 3: return ['skills', 'salaryExpectation', 'noticePeriod'];
      case 4: return ['terms'];
      default: return [];
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('location', data.location);
      formData.append('salaryExpectation', data.salaryExpectation);
      formData.append('noticePeriod', data.noticePeriod);
      formData.append('terms', data.terms);
      
      if (data.githubUrl) formData.append('githubUrl', data.githubUrl);
      if (data.portfolioUrl) formData.append('portfolioUrl', data.portfolioUrl);

      // Append complex fields as JSON strings for Multer
      formData.append('skills', JSON.stringify(data.skills));
      formData.append('experience', JSON.stringify(data.experience));
      formData.append('education', JSON.stringify(data.education));

      // Append file if exists (for backwards compatibility or non-stepper flows)
      if (data.resume instanceof File) {
        formData.append('resume', data.resume);
      } else if (data.resumeUrl) {
        formData.append('resumeUrl', data.resumeUrl);
      }

      const response = await api.post(`/applications/apply/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success("Application submitted successfully!");
        setIsSuccess(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit application";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        
        {!isSuccess ? (
          <>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white mb-8 transition-all group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Cancel Application
            </button>

            <div className="glass-card p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-brand-600" />
              
              <ApplyStepper currentStep={currentStep} steps={steps} />

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    {currentStep === 1 && <PersonalStep register={register} errors={errors} setValue={setValue} watch={watch} />}

                    {currentStep === 2 && <ProfessionalStep control={control} register={register} errors={errors} />}
                    {currentStep === 3 && <DetailsStep register={register} errors={errors} setValue={setValue} watch={watch} />}
                    {currentStep === 4 && <ReviewStep register={register} errors={errors} watch={watch} />}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1 || isSubmitting}
                    className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white disabled:opacity-0 transition-all"
                  >
                    Previous Step
                  </button>

                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-10 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-600/30 group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          Submit Application <CheckCircle2 size={18} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        ) : (
          <ApplySuccess />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplyJob;
