import { Sparkles, CheckCircle2, Info } from 'lucide-react';

const JobContentSection = ({ job }) => {
  if (!job) return null;
  return (
    <div className="space-y-12">
      {/* Job Description */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Info size={20} className="text-brand-400" />
          Job Description
        </h2>
        <div className="prose prose-invert max-w-none">
          <div className="text-slate-400 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
            {job.description}
          </div>
        </div>
      </section>

      {/* Qualifications & Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-brand-400" />
            Key Qualifications
          </h2>
          <ul className="space-y-4">
            {(job.requirements || []).map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-400 text-sm">
                <CheckCircle2 size={16} className="text-brand-500 mt-1 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
            {(!job.requirements || job.requirements.length === 0) && (
              <p className="text-slate-500 text-sm italic">No specific qualifications listed.</p>
            )}
          </ul>
        </section>

        <section className="space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={20} className="text-brand-400" />
            Preferred Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {(job.technologies || []).map((skill) => (
              <span key={skill} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium hover:border-brand-500/50 transition-all cursor-default">
                {skill}
              </span>
            ))}
            {(!job.technologies || job.technologies.length === 0) && (
              <p className="text-slate-500 text-sm italic">No specific technologies listed.</p>
            )}
          </div>
        </section>
      </div>

      {/* Education & Experience Details */}
      <section className="p-8 glass-card border border-slate-700/50 bg-gradient-to-br from-brand-600/5 to-transparent rounded-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               Education
            </h4>
            <p className="text-white font-bold text-sm">
              {job.education?.degree}{job.education?.fieldOfStudy ? ` in ${job.education.fieldOfStudy}` : ' (Any Field)'}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               Experience
            </h4>
            <p className="text-white font-bold text-sm">
              {job.experienceRange?.min || 0} - {job.experienceRange?.max || 0} Years ({job.level})
            </p>
          </div>
          <div className="space-y-1">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               Workplace
             </h4>
             <p className="text-white font-bold text-sm">
               {job.workplaceType} Environment
             </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobContentSection;
