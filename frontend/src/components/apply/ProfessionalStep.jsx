import { Briefcase, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';

const ProfessionalStep = ({ control, register, errors }) => {
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience"
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: "education"
  });

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Professional Background</h2>
        <p className="text-slate-500 text-sm">Add your relevant work history and education</p>
      </div>

      {/* Experience Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase size={20} className="text-brand-400" /> Work Experience
          </h3>
          <button 
            type="button"
            onClick={() => appendExp({ company: '', role: '', duration: '' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-lg text-xs font-bold border border-brand-500/20 transition-all"
          >
            <Plus size={14} /> Add Experience
          </button>
        </div>
        
        <div className="space-y-4">
          {expFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl relative group">
              <button 
                type="button"
                onClick={() => removeExp(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-slate-800 text-slate-500 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-slate-700"
              >
                <Trash2 size={14} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  {...register(`experience.${index}.company`)}
                  placeholder="Company Name"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
                <input 
                  {...register(`experience.${index}.role`)}
                  placeholder="Job Role"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
                <input 
                  {...register(`experience.${index}.duration`)}
                  placeholder="Duration (e.g. 2020-2022)"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          ))}
          {expFields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
              No experience added yet
            </div>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap size={20} className="text-brand-400" /> Education
          </h3>
          <button 
            type="button"
            onClick={() => appendEdu({ school: '', degree: '', year: '' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-lg text-xs font-bold border border-brand-500/20 transition-all"
          >
            <Plus size={14} /> Add Education
          </button>
        </div>

        <div className="space-y-4">
          {eduFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl relative group">
              <button 
                type="button"
                onClick={() => removeEdu(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-slate-800 text-slate-500 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-slate-700"
              >
                <Trash2 size={14} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  {...register(`education.${index}.school`)}
                  placeholder="University / School"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
                <input 
                  {...register(`education.${index}.degree`)}
                  placeholder="Degree / Certificate"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
                <input 
                  {...register(`education.${index}.year`)}
                  placeholder="Passing Year"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          ))}
          {eduFields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
              No education added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalStep;
