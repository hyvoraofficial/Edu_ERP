import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', asChild = false, variant = 'primary', size = 'md', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // Core base style classes for a modern Stripe/Linear-style button
    const baseClass = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
    
    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs',
      outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs bg-white',
      ghost: 'text-slate-700 hover:bg-slate-100',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base'
    };

    return (
      <Comp
        className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
