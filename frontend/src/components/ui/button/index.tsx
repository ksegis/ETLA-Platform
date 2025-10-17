import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

const v = (variant?: ButtonProps["variant"]) => {
  switch (variant) {
    case "outline": return "border bg-transparent hover:bg-accent";
    case "ghost": return "bg-transparent hover:bg-accent";
    case "destructive": return "bg-red-600 text-white hover:bg-red-700";
    default: return "bg-primary text-primary-foreground hover:bg-primary/90";
  }
};
const s = (size?: ButtonProps["size"]) => {
  switch (size) {
    case "sm": return "h-8 px-3 text-sm";
    case "lg": return "h-11 px-6 text-base";
    default: return "h-10 px-4 text-sm";
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${v(variant)} ${s(size)} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
