import { Briefcase, GraduationCap, Calendar, MapPin } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const ExperienceEducation = () => {
  const { user } = useAuthStore();
  const experiences = user?.experiences || [];
  
  // Use professional education array if present, otherwise fallback to registration data
  let education = user?.education || [];
  if (education.length === 0 && user?.collegeName) {
    education = [{
      degree: user.degree,
      school: user.collegeName,
      period: `Graduating ${user.graduationYear || 'N/A'}`,
      location: user.currentLocation || 'N/A',
      isRegistrationData: true
    }];
  }

  return (
    <div className="space-y-8">
      {/* Experience Section */}
      <div className="glass-card p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Briefcase size={24} />
          </div>
          <h3 className="text-white font-bold text-lg">Work Experience</h3>
        </div>

        <div className="space-y-10 relative">
          {experiences.length > 0 && <div className="absolute top-0 left-6 bottom-0 w-px bg-slate-800" />}
          
          {experiences.length > 0 ? experiences.map((exp, i) => (
            <div key={i} className="relative pl-12 group">
              <div className="absolute top-1 left-[21px] w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-700 group-hover:bg-amber-500 group-hover:border-amber-400/50 transition-all shadow-lg" />
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-white font-bold group-hover:text-amber-500 transition-colors uppercase tracking-tight">{exp.role}</h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">{exp.period}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 italic">
                  <span className="text-brand-400">{exp.company}</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} /> {exp.location}
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mt-2 pr-4 italic">
                  {exp.desc}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500 pl-4 py-4 italic">No work experience added yet.</p>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="glass-card p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
            <GraduationCap size={24} />
          </div>
          <h3 className="text-white font-bold text-lg">Education</h3>
        </div>

        <div className="space-y-8 relative">
          {education.length > 0 && <div className="absolute top-0 left-6 bottom-0 w-px bg-slate-800" />}
          
          {education.length > 0 ? education.map((edu, i) => (
            <div key={i} className="relative pl-12 group">
              <div className="absolute top-1 left-[21px] w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-700 group-hover:bg-rose-500 group-hover:border-rose-400/50 transition-all shadow-lg" />
              <div className="space-y-1">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-white font-bold group-hover:text-rose-500 transition-colors uppercase tracking-tight">{edu.degree}</h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">{edu.period}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 italic">
                   <span className="text-brand-400">{edu.school}</span>
                   <div className="flex items-center gap-1">
                    <MapPin size={12} /> {edu.location}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500 pl-4 py-2 italic">No education history added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceEducation;
