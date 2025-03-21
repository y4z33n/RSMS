'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-amber-500 disabled:opacity-80 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400",
        subtle: "bg-amber-100 text-amber-800 hover:bg-amber-200",
        ghost: "bg-transparent text-amber-600 hover:bg-amber-50 hover:text-amber-700",
        link: "bg-transparent text-amber-600 underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        warning: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
        gradient: "text-white bg-gradient-to-r shadow-md hover:shadow-lg",
        primary: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
        secondary: "bg-gray-600 text-white hover:bg-gray-700 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm", 
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      rounded: "default",
    },
  }
);

export interface FancyButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  hoverScale?: number;
  withRipple?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export const FancyButton = forwardRef<HTMLButtonElement, FancyButtonProps>(
  (
    { 
      className, 
      variant, 
      size, 
      fullWidth, 
      rounded,
      gradientFrom = "from-amber-700",
      gradientTo = "to-amber-500",
      hoverScale = 1.02,
      withRipple = false,
      children,
      icon: Icon,
      iconPosition = 'left',
      ...props 
    }, 
    ref
  ) => {
    const gradientClasses = variant === 'gradient' 
      ? `${gradientFrom} ${gradientTo}` 
      : '';
    
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, rounded }), gradientClasses, className)}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon className="mr-2 h-4 w-4" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="ml-2 h-4 w-4" />}
      </button>
    );
  }
);

FancyButton.displayName = "FancyButton"; 