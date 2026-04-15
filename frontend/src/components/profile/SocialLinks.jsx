import { Globe, Share2, Edit2 } from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa6';
import useAuthStore from '../../store/authStore';

const SocialLinks = ({ onEdit }) => {
  const { user } = useAuthStore();
  
  const socialConfig = [
    { name: 'LinkedIn', icon: <FaLinkedin size={20} />, key: 'linkedin', color: 'hover:text-[#0077b5]' },
    { name: 'GitHub', icon: <FaGithub size={20} />, key: 'github', color: 'hover:text-[#333]' },
    { name: 'Portfolio', icon: <Globe size={20} />, key: 'portfolio', color: 'hover:text-brand-400' },
    { name: 'Twitter', icon: <FaTwitter size={20} />, key: 'twitter', color: 'hover:text-[#1da1f2]' },
  ];

  return (
    <div className="glass-card p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Share2 size={24} />
          </div>
          <h3 className="text-white font-bold">Social & Links</h3>
        </div>
        <button 
          onClick={onEdit}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <Edit2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {socialConfig.map((link) => {
          const url = user?.socialLinks?.[link.key];
          
          return (
            <div 
              key={link.name}
              className={`flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 transition-all group ${link.color} ${!url ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-slate-500 group-hover:scale-110 transition-transform">
                  {link.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                    {link.name}
                  </span>
                  <span className="text-[10px] text-slate-600 truncate max-w-[150px]">
                    {url || 'Not added'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {url && (
                  <a 
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-brand-400 font-bold uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                  >
                    Visit
                  </a>
                )}
                <button 
                  onClick={onEdit}
                  className="p-1.5 text-slate-600 hover:text-white hover:bg-slate-800 rounded-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinks;
