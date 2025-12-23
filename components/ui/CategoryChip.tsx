import React from 'react';
import { CategoryType } from '../../types';
import { CATEGORY_CONFIG } from '../../constants';

interface CategoryChipProps {
  category: CategoryType;
  isSelected: boolean;
  onClick: (category: CategoryType) => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ category, isSelected, onClick }) => {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onClick(category)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-all duration-200 whitespace-nowrap
        ${isSelected 
          ? 'bg-slate-800 text-white ring-2 ring-offset-1 ring-slate-800' 
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}
      `}
    >
      <div className={`p-1 rounded-full ${isSelected ? 'bg-white/20' : config.color + ' bg-opacity-10'}`}>
        <Icon size={14} className={isSelected ? 'text-white' : config.color.replace('bg-', 'text-')} />
      </div>
      {config.label}
    </button>
  );
};

export default CategoryChip;
