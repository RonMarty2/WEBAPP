'use client';

import { HTMLAttributes, ReactNode } from 'react';

type Variant = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';
type Size = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  dot?: boolean;
  icon?: ReactNode;
}

const variants: Record<Variant, { bg: string; text: string; border: string; dot: string }> = {
  neutral: {
    bg: 'bg-[var(--bg-subtle)] dark:bg-white/5',
    text: 'text-[var(--fg-secondary)]',
    border: 'border-[var(--border)]',
    dot: 'bg-[var(--fg-muted)]',
  },
  info: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-500/20',
    dot: 'bg-indigo-500',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/20',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/20',
    dot: 'bg-rose-500',
  },
  accent: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-500/20',
    dot: 'bg-violet-500',
  },
};

const sizes: Record<Size, string> = {
  sm: 'text-[10.5px] px-2 py-0.5 gap-1',
  md: 'text-[11.5px] px-2.5 py-1 gap-1.5',
};

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const v = variants[variant];
  return (
    <span
      className={[
        'inline-flex items-center font-semibold uppercase tracking-wide',
        'rounded-full border',
        v.bg,
        v.text,
        v.border,
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {dot && (
        <span
          className={['inline-block w-1.5 h-1.5 rounded-full', v.dot].join(' ')}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex items-center [&_svg]:w-3 [&_svg]:h-3">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}
