'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold tracking-tight ' +
  'transition-all duration-200 cursor-pointer select-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-[#0b0b0b] text-white border border-transparent ' +
    'hover:bg-[#1f1f1f] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] ' +
    'active:translate-y-0',
  secondary:
    'bg-white/80 text-[var(--fg-primary)] border border-[var(--border)] backdrop-blur-sm ' +
    'hover:bg-white hover:border-[var(--border-hover)] hover:-translate-y-px hover:shadow-md ' +
    'active:translate-y-0 dark:bg-white/5 dark:hover:bg-white/10',
  ghost:
    'bg-transparent text-[var(--fg-secondary)] border border-transparent ' +
    'hover:bg-black/5 hover:text-[var(--fg-primary)] ' +
    'dark:hover:bg-white/10',
  accent:
    'bg-[var(--accent)] text-[var(--accent-fg)] border border-transparent ' +
    'hover:bg-[var(--accent-hover)] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(99,102,241,0.35)] ' +
    'active:translate-y-0',
  danger:
    'bg-[#dc2626] text-white border border-transparent ' +
    'hover:bg-[#b91c1c] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(220,38,38,0.35)] ' +
    'active:translate-y-0',
  subtle:
    'bg-[var(--bg-subtle)] text-[var(--fg-primary)] border border-transparent ' +
    'hover:bg-[var(--border)] hover:text-[var(--fg-primary)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-lg gap-1.5',
  md: 'h-10 px-5 text-sm rounded-xl',
  lg: 'h-12 px-7 text-[15px] rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          base,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <span
            className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span className="shrink-0 inline-flex items-center">{leftIcon}</span>
        )}
        {children && <span className="truncate">{children}</span>}
        {!loading && rightIcon && (
          <span className="shrink-0 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
