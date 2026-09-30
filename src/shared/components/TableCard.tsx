import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface TableCardProps {
  /** 'padded' (default): card padding surrounds header+table. 'flush': header keeps its own
   *  padding but the table runs edge to edge, for tables meant to fill the card width. */
  variant?: 'padded' | 'flush';
  id?: string;
  className?: string;
  icon: LucideIcon;
  iconClassName?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export const TableCard: React.FC<TableCardProps> = ({
  variant = 'padded',
  id,
  className = '',
  icon: Icon,
  iconClassName = 'text-emerald-400',
  title,
  subtitle,
  actions,
  children,
  ref,
}) => {
  const flush = variant === 'flush';
  return (
    <div
      ref={ref}
      id={id}
      className={`rounded-2xl bg-surface border border-line shadow-xl ${flush ? 'overflow-hidden' : 'p-5 sm:p-6'} ${className}`}
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line-soft ${
          flush ? 'p-5 sm:p-6 pb-5' : ''
        }`}
      >
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Icon className={`w-5 h-5 ${iconClassName}`} />
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>
      {children}
    </div>
  );
};
