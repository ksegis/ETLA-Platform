'use client';

import * as React from 'react';

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="relative inline-block">{children}</div>;
}

export interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuTriggerProps
>(({ children, asChild }, ref) => {
  return (
    <div ref={ref} className="inline-block">
      {children}
    </div>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  className?: string;
  children: React.ReactNode;
}

export function DropdownMenuContent({ 
  align = 'start', 
  className = '', 
  children 
}: DropdownMenuContentProps) {
  const alignClass = align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';
  
  return (
    <div 
      className={`absolute ${alignClass} mt-2 z-50 min-w-[200px] overflow-hidden rounded-md border bg-white shadow-lg ${className}`}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
}

export interface DropdownMenuLabelProps {
  children: React.ReactNode;
}

export function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  return (
    <div className="px-3 py-2 text-sm font-semibold text-gray-900">
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function DropdownMenuItem({ onClick, children, disabled }: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-gray-200" />;
}
