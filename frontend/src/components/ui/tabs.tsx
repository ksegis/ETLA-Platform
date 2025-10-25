"use client";

import React, { createContext, useContext, useState } from "react";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const Tabs = ({ 
  children, 
  value, 
  onValueChange, 
  className = "",
  defaultValue,
  ...props 
}: any) => {
  const [internalValue, setInternalValue] = useState(defaultValue || value);
  
  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ 
  children, 
  className = "", 
  ...props 
}: any) => {
  return (
    <div 
      className={`flex border-b ${className}`} 
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({ 
  children, 
  value,
  className = "", 
  ...props 
}: any) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const isActive = context.value === value;

  return (
    <button 
      className={`px-4 py-2 border-b-2 transition-colors ${
        isActive 
          ? "border-blue-500 text-blue-600 font-medium" 
          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
      } ${className}`}
      onClick={() => context.onValueChange(value)}
      role="tab"
      aria-selected={isActive}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ 
  children, 
  value,
  className = "",
  ...props 
}: any) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  if (context.value !== value) {
    return null;
  }

  return (
    <div 
      className={className}
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  );
};

