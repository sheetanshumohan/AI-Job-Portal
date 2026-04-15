import { useState, useRef, useEffect } from 'react';
import { X, Plus, Hash } from 'lucide-react';

const TagInput = ({ label, placeholder, tags, onChange, error }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      
      <div className={`
        flex flex-wrap gap-2 p-2.5 bg-slate-900 border rounded-2xl transition-all
        ${error ? 'border-rose-500/50 ring-1 ring-rose-500/20' : 'border-slate-700/50 focus-within:border-brand-500/50'}
      `}>
        {tags.map((tag, index) => (
          <div 
            key={index}
            className="flex items-center gap-1.5 px-3 py-1 bg-brand-600/10 border border-brand-500/20 rounded-xl group transition-all hover:bg-brand-600/20"
          >
            <Hash size={12} className="text-brand-400" />
            <span className="text-sm font-medium text-brand-300">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="p-0.5 hover:bg-brand-600/30 rounded-full text-brand-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        <div className="flex-1 min-w-[120px] flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="w-full bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 px-2"
          />
        </div>
      </div>
      
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      <p className="text-[10px] text-slate-500 font-medium italic">
        Press Enter or comma to add tags
      </p>
    </div>
  );
};

export default TagInput;
