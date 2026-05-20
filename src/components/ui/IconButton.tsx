'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'solid' | 'ghost' | 'soft' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  label: string;
  icon: ReactNode;
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center cursor-pointer select-none ' +
  'transition-all duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  solid:
    'bg-[#0b0b0b] text-white shadow-sm ' +
    'hover:bg-[#1f1f1f] hover:shadow-md hover:-translate-y-px active:translate-y-0',
  ghost:
    'bg-transparent text-[var(--fg-secondary)] ' +
    'hover:bg-black/5 hover:text-[var(--fg-primary)] dark:hover:bg-white/10',
  soft:
    'bg-[var(--bg-subtle)] text-[var(--fg-primary)] border border-[var(--border)] ' +
    'hover:bg-white hover:border-[var(--border-hover)] hover:shadow-sm ' +
    'dark:bg-white/5 dark:hover:bg-white/10',
  outline:
    'bg-transparent text-[var(--fg-primary)] border border-[var(--border)] ' +
    'hover:bg-[var(--bg-subtle)] hover:border-[var(--border-hover)]',
};

const sizes: Record<Size, string> = {
  sm: 'w-8 h-8 rounded-lg [&_svg]:w-4 [&_svg]:h-4',
  md: 'w-10 h-10 rounded-xl [&_svg]:w-[18px] [&_svg]:h-[18px]',
  lg: 'w-12 h-12 rounded-xl [&_svg]:w-5 [&_svg]:h-5',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      label,
      icon,
      loading = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        disabled={isDisabled}
        className={[base, variants[variant], sizes[size], className].join(' ')}
        {...props}
      >
        {loading ? (
          <span
            className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
