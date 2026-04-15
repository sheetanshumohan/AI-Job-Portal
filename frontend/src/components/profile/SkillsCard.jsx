import { Code2, Cpu, Globe, Database, Smartphone, Palette } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const SkillsCard = ({ onEdit }) => {
  const { user } = useAuthStore();
  const allSkills = user?.skills || [];

  // Grouping logic for the UI grid
  const skillGroups = [
    {
      category: 'Core Skills',
      icon: <Code2 size={18} className="text-brand-400" />,
      skills: allSkills.slice(0, 5)
    },
    {
      category: 'Technologies',
      icon: <Cpu size={18} className="text-emerald-400" />,
      skills: allSkills.slice(5)
    }
  ].filter(group => group.skills.length > 0);
  return (
    <div className="glass-card p-6 h-full border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
          <Code2 size={24} />
        </div>
        <h3 className="text-white font-bold">Skills & Technologies</h3>
      </div>

      <div className="space-y-6">
        {skillGroups.map((group) => (
          <div key={group.category} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
              {group.icon}
              {group.category}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span 
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:border-brand-500/50 hover:text-white transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onEdit}
        className="w-full mt-8 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold border border-slate-700/50 transition-all flex items-center justify-center gap-2"
      >
        Edit Skills
      </button>
    </div>
  );
};

export default SkillsCard;
