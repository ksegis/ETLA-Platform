// src/types/shims/ui-button.d.ts
declare module '@/components/ui/button' {
  import * as React from 'react'

  export type ButtonVariant =
    | 'default'
    | 'outline'
    | 'secondary'
    | 'destructive'
    | 'ghost'
    | 'link'

  // Keep 'md' as a backwards-compatible alias (normalized to 'default' in the component)
  export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'md'

  export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
  }

  // Declare the component once
  const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >

  // ✅ Export both default and named, so `import Button` and `import { Button }` both work
  export { Button }
  export default Button
}


