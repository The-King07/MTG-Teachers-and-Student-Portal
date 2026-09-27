import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md'
}) => {
  let resolvedVariant = variant;

  if (!resolvedVariant) {
    const s = status.toLowerCase();
    if (s === 'present' || s === 'completed' || s.includes('high') || s.includes('pass') || s === '100%') {
      resolvedVariant = 'success';
    } else if (s === 'absent' || s.includes('fail') || s === 'important' || s === 'danger') {
      resolvedVariant = 'danger';
    } else if (s === 'in_progress' || s === 'in progress' || s.includes('medium')) {
      resolvedVariant = 'warning';
    } else if (s === 'new' || s === 'normal') {
      resolvedVariant = 'info';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${styles[resolvedVariant]} ${sizeStyles[size]}`}>
      {status}
    </span>
  );
};
