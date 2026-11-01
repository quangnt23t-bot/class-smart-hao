import React from 'react';
import { User, Users } from 'lucide-react';

interface FormTabsProps {
  activeTab: 'student' | 'parent';
  onTabChange: (tab: 'student' | 'parent') => void;
  parentCount?: number;
}

export const FormTabs: React.FC<FormTabsProps> = ({
  activeTab,
  onTabChange,
  parentCount = 0
}) => {
  return (
    <div className="p-1 bg-[#EAF0F7] rounded-xl flex items-center gap-1 border border-slate-200/80">
      <button
        type="button"
        onClick={() => onTabChange('student')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
          activeTab === 'student'
            ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
        }`}
        aria-selected={activeTab === 'student'}
      >
        <User className="w-3.5 h-3.5" />
        <span>Thông tin học sinh</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('parent')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
          activeTab === 'parent'
            ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
        }`}
        aria-selected={activeTab === 'parent'}
      >
        <Users className="w-3.5 h-3.5" />
        <span>Thông tin phụ huynh</span>
        {parentCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
            {parentCount}
          </span>
        )}
      </button>
    </div>
  );
};
