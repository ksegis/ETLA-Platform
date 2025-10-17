// src/components/ui/badge.tsx
'use client';

import * as React from 'react';

export type BadgeVariant = 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/** Minimal class joiner */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const BASE =
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap select-none';

const VARIANT: Record<BadgeVariant, string> = {
  default: 'bg-black text-white',
  outline: 'border border-gray-300 text-gray-800',
  secondary: 'bg-gray-100 text-gray-900',
  destructive: 'bg-red-600 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-600 text-white',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    return <span ref={ref} className={cx(BASE, VARIANT[variant], className)} {...props} />;
  }
);
Badge.displayName = 'Badge';

export default Badge;
