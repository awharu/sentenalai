import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'orange';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '', icon }) => {
  const variants = {
    success: 'bg-green-900/30 text-green-400 border-green-900/50',
    warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50',
    danger: 'bg-red-900/30 text-red-400 border-red-900/50',
    info: 'bg-blue-900/30 text-blue-400 border-blue-900/50',
    neutral: 'bg-slate-800 text-slate-400 border-slate-700',
    purple: 'bg-purple-900/30 text-purple-300 border-purple-900/50',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-900/50'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
};