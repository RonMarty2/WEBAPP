'use client';

import { HTMLAttributes, createElement, ReactNode } from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type Tone = 'default' | 'muted' | 'secondary' | 'accent' | 'success' | 'danger';
type Family = 'sans' | 'serif';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  as?: `h${HeadingLevel}`;
  tone?: Tone;
  family?: Family;
  balance?: boolean;
}

const headingSize: Record<HeadingLevel, string> = {
  1: 'text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]',
  2: 'text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]',
  3: 'text-2xl md:text-[28px] font-semibold tracking-tight leading-[1.2]',
  4: 'text-xl font-semibold tracking-tight leading-snug',
  5: 'text-base font-semibold leading-snug',
  6: 'text-sm font-semibold uppercase tracking-wider leading-snug',
};

const toneClass: Record<Tone, string> = {
  default: 'text-[var(--fg-primary)]',
  muted: 'text-[var(--fg-muted)]',
  secondary: 'text-[var(--fg-secondary)]',
  accent: 'text-[var(--accent)]',
  success: 'text-emerald-600 dark:text-emerald-400',
  danger: 'text-rose-600 dark:text-rose-400',
};

export function Heading({
  level = 2,
  as,
  tone = 'default',
  family = 'sans',
  balance = true,
  className = '',
  children,
  ...props
}: HeadingProps) {
  const tag = as ?? (`h${level}` as const);
  return createElement(
    tag,
    {
      className: [
        headingSize[level],
        toneClass[tone],
        family === 'serif' ? 'font-crimson' : '',
        balance ? '[text-wrap:balance]' : '',
        className,
      ].join(' '),
      ...props,
    },
    children
  );
}

type TextSize = 'xs' | 'sm' | 'base' | 'lg';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: TextSize;
  weight?: TextWeight;
  tone?: Tone;
  as?: 'p' | 'span' | 'div';
  leading?: 'tight' | 'normal' | 'relaxed';
  children?: ReactNode;
}

const textSize: Record<TextSize, string> = {
  xs: 'text-[11.5px]',
  sm: 'text-[13px]',
  base: 'text-[14.5px]',
  lg: 'text-base',
};

const weightClass: Record<TextWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const leadingClass = {
  tight: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
};

export function Text({
  size = 'base',
  weight = 'regular',
  tone = 'default',
  as = 'p',
  leading = 'normal',
  className = '',
  children,
  ...props
}: TextProps) {
  return createElement(
    as,
    {
      className: [
        textSize[size],
        weightClass[weight],
        toneClass[tone],
        leadingClass[leading],
        className,
      ].join(' '),
      ...props,
    },
    children
  );
}

interface KickerProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function Kicker({ className = '', children, ...props }: KickerProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'text-[11px] font-bold uppercase tracking-[0.14em]',
        'text-[var(--accent)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
