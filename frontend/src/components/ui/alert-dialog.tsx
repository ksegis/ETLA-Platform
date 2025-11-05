'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './Button';

export interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

export function AlertDialogContent({ children }: { children: React.ReactNode }) {
  return <DialogContent className="max-w-md">{children}</DialogContent>;
}

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <DialogHeader>{children}</DialogHeader>;
}

export function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return <DialogTitle>{children}</DialogTitle>;
}

export function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 mt-2">{children}</p>;
}

export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 mt-6">{children}</div>;
}

export interface AlertDialogActionProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogAction({ onClick, children, className = '' }: AlertDialogActionProps) {
  return (
    <Button onClick={onClick} className={className}>
      {children}
    </Button>
  );
}

export function AlertDialogCancel({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <Button variant="outline" onClick={onClick}>
      {children}
    </Button>
  );
}
