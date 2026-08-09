import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500 dark:hover:bg-indigo-600',
      secondary:
        'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 dark:bg-rose-500 dark:hover:bg-rose-600',
      ghost:
        'hover:bg-zinc-100 text-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-300',
      outline:
        'border border-zinc-200 hover:bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-800/60 dark:text-zinc-200',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
      lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[46px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
