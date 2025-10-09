"use client";

import * as React from "react";

// If @radix-ui/react-tabs is available, keep this import.
// If not, leave the simple controlled shim below (works for now).
let TabsPrimitive: any;
try {
  TabsPrimitive = require("@radix-ui/react-tabs");
} catch {
  TabsPrimitive = null;
}

// ---------- Option A: Radix-backed (preferred if installed) ----------
if (TabsPrimitive) {
  const { Root, List, Trigger, Content } = TabsPrimitive;

  export const Tabs = Root; // accepts value, defaultValue, onValueChange
  export const TabsList = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof List>
  >(({ className, ...props }, ref) => <List ref={ref} className={className} {...props} />);
  TabsList.displayName = "TabsList";

  export const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Trigger>
  >(({ className, ...props }, ref) => <Trigger ref={ref} className={className} {...props} />);
  TabsTrigger.displayName = "TabsTrigger";

  export const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof Content>
  >(({ className, ...props }, ref) => <Content ref={ref} className={className} {...props} />);
  TabsContent.displayName = "TabsContent";
} else {
  // ---------- Option B: Minimal controlled shim (no Radix) ----------
  type TabsProps = {
    value?: string;
    defaultValue?: string;
    onValueChange?: (v: string) => void;
    className?: string;
    children: React.ReactNode;
  };

  type Ctx = {
    value: string;
    setValue: (v: string) => void;
  };

  const Ctx = React.createContext<Ctx | null>(null);

  export function Tabs({ value, defaultValue, onValueChange, className, children }: TabsProps) {
    const [internal, setInternal] = React.useState<string>(defaultValue ?? "");
    const current = value ?? internal;
    const setValue = (v: string) => {
      if (onValueChange) onValueChange(v);
      if (value === undefined) setInternal(v);
    };
    return (
      <div className={className}>
        <Ctx.Provider value={{ value: current, setValue }}>{children}</Ctx.Provider>
      </div>
    );
  }

  export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
  }

  export function TabsTrigger({
    value,
    children,
    className,
  }: {
    value: string;
    children: React.ReactNode;
    className?: string;
  }) {
    const ctx = React.useContext(Ctx);
    if (!ctx) return null;
    const selected = ctx.value === value;
    return (
      <button
        type="button"
        aria-selected={selected}
        className={className}
        onClick={() => ctx.setValue(value)}
      >
        {children}
      </button>
    );
  }

  export function TabsContent({
    value,
    children,
    className,
  }: {
    value: string;
    children: React.ReactNode;
    className?: string;
  }) {
    const ctx = React.useContext(Ctx);
    if (!ctx) return null;
    if (ctx.value !== value) return null;
    return <div className={className}>{children}</div>;
  }
}

