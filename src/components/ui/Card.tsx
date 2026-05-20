'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'glass' | 'premium' | 'subtle' | 'flat';
type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
  as?: 'div' | 'article' | 'section';
}

const variants: Record<Variant, string> = {
  default:
    'bg-white/95 border border-[var(--border)] shadow-[0_1px_3px_rgba(20,20,20,0.06),0_6px_18px_rgba(20,20,20,0.05)] ' +
    'backdrop-blur-md ' +
    'dark:bg-white/[0.04] dark:border-white/10',
  glass:
    'bg-white/60 border border-white/60 backdrop-blur-xl backdrop-saturate-150 ' +
    'shadow-[0_1px_3px_rgba(20,20,20,0.06),0_6px_18px_rgba(20,20,20,0.05)] ' +
    'dark:bg-white/[0.06] dark:border-white/10',
  premium:
    'bg-white/95 border border-[var(--border)] backdrop-blur-md ' +
    'shadow-[0_2px_8px_rgba(20,20,20,0.06),0_12px_36px_rgba(20,20,20,0.08)] ' +
    'relative overflow-hidden ' +
    'dark:bg-white/[0.04] dark:border-white/10',
  subtle:
    'bg-[var(--bg-subtle)] border border-[var(--border)] ' +
    'dark:bg-white/[0.02] dark:border-white/5',
  flat:
    'bg-transparent border border-[var(--border)] ' +
    'dark:border-white/10',
};

const paddings: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const interactiveClass =
  'transition-all duration-200 cursor-pointer ' +
  'hover:-translate-y-0.5 hover:border-[var(--border-hover)] ' +
  'hover:shadow-[0_10px_32px_rgba(20,20,20,0.10)]';

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      as = 'div',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const Tag = as as 'div';
    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement>}
        className={[
          'rounded-2xl',
          variants[variant],
          paddings[padding],
          interactive ? interactiveClass : '',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({
  title,
  description,
  action,
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={['flex items-start justify-between gap-4 mb-4', className].join(' ')}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[var(--fg-primary)] truncate">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--fg-muted)] mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[var(--border)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
