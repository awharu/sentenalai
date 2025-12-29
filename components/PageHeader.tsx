import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string; // Tailwind class e.g., "text-blue-500"
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, iconColor = "text-blue-500", actions }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          {Icon && <Icon className={iconColor} size={28} />}
          {title}
        </h1>
        {description && (
          <p className="text-slate-400 text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};