import React from 'react';

interface BentoCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function BentoCard({ title, children, className = "" }: BentoCardProps) {
  return (
    <div className={`bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] border border-white ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-lg font-extrabold text-slate-950 tracking-tight">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}