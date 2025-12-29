import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};