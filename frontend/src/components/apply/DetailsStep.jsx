import { Code2, DollarSign, Clock } from 'lucide-react';

const DetailsStep = ({ register, errors, setValue, watch }) => {
  const selectedSkills = watch('skills') || [];
  const skillOptions = ['React', 'Node.js', 'Python', 'Go', 'AWS', 'Docker', 'TypeScript', 'SQL', 'NoSQL', 'Figma'];

  const toggleSkill = (skill) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setValue('skills', updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Preferences & Skills</h2>
        <p className="text-slate-500 text-sm">Tell us about your expectations and expertise</p>
      </div>

      <div className="space-y-8">
        {/* Skills Selection */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Code2 size={18} className="text-brand-400" /> Key Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-brand-600/10 border-brand-500/50 text-brand-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {errors.skills && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1">{errors.skills.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Salary Expectation */}
          <div className="space-y-3">
             <label className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign size={18} className="text-brand-400" /> Expected Salary (Annual)
            </label>
            <div className="relative group">
              <input 
                {...register('salaryExpectation')}
                type="text"
                placeholder="e.g. $120,000"
                className={`w-full px-4 py-3.5 bg-slate-900 border ${errors.salaryExpectation ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-brand-500'} rounded-xl text-white focus:outline-none transition-all`}
              />
            </div>
            {errors.salaryExpectation && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1">{errors.salaryExpectation.message}</p>}
          </div>

          {/* Notice Period */}
          <div className="space-y-3">
             <label className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-brand-400" /> Notice Period
            </label>
            <select 
              {...register('noticePeriod')}
              className={`w-full px-4 py-3.5 bg-slate-900 border ${errors.noticePeriod ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-brand-500'} rounded-xl text-white focus:outline-none appearance-none transition-all cursor-pointer`}
            >
              <option value="">Select notice period</option>
              <option value="immediate">Immediate</option>
              <option value="15days">15 Days</option>
              <option value="30days">30 Days</option>
              <option value="60days">60 Days+</option>
            </select>
            {errors.noticePeriod && <p className="text-[10px] text-rose-500 font-bold uppercase ml-1">{errors.noticePeriod.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsStep;
