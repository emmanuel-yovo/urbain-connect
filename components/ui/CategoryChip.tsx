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
        flex items-center gap-2 px-5 py-2 rounded-2xl shadow-sm text-xs font-bold transition-all duration-200 whitespace-nowrap border
        ${isSelected 
          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-100'}
      `}
    >
      <Icon size={14} className={isSelected ? 'text-white' : config.color.replace('bg-', 'text-')} />
      {config.label}
    </button>
  );
};

export default CategoryChip;