import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | null;
  emptyLabel?: string;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  color?: 'amber' | 'blue' | 'emerald' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  emptyLabel = 'No records yet',
  icon: Icon,
  subtext,
  color = 'amber'
}) => {
  const colorMap = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const hasValue = value !== null && value !== undefined && value !== '';

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{title}</p>
        {hasValue ? (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        ) : (
          <p className="text-sm font-medium text-gray-400 italic">{emptyLabel}</p>
        )}
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg border ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
