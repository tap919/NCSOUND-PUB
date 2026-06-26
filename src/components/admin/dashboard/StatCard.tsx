import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  valueClassName?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function StatCard({ label, value, valueClassName = 'text-3xl font-heading text-white', icon, children }: StatCardProps) {
  return (
    <div className="bg-neutral-900 p-4 border border-neutral-800">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1">
        {icon}{label}
      </p>
      <p className={valueClassName}>{value}</p>
      {children}
    </div>
  );
}
