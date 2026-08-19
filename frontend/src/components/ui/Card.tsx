import * as React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white text-slate-900 border border-slate-200 rounded-xl shadow-xs transition-all duration-200 hover:shadow-md p-6 ${className}`}
      {...props}
    />
  )
);
Card.displayName = 'Card';
