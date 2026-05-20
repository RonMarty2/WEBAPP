'use client';

import { ReactNode } from 'react';

export type StepStatus = 'pending' | 'active' | 'completed' | 'locked';

export interface Step {
  id: string | number;
  label: string;
  description?: string;
  status: StepStatus;
  icon?: ReactNode;
}

interface StepperProps {
  steps: Step[];
  onStepClick?: (step: Step) => void;
  orientation?: 'horizontal' | 'vertical';
  compact?: boolean;
  className?: string;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10.5L8 14.5L16 6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9V6.5a3 3 0 1 1 6 0V9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const dotStyles: Record<StepStatus, string> = {
  pending:
    'bg-white border-2 border-[var(--border)] text-[var(--fg-muted)] ' +
    'dark:bg-white/5 dark:border-white/15',
  active:
    'bg-[var(--accent)] border-2 border-[var(--accent)] text-white ' +
    'shadow-[0_0_0_4px_rgba(99,102,241,0.18)]',
  completed:
    'bg-emerald-500 border-2 border-emerald-500 text-white',
  locked:
    'bg-[var(--bg-subtle)] border-2 border-[var(--border)] text-[var(--fg-muted)] ' +
    'dark:bg-white/[0.03] dark:border-white/10',
};

const labelStyles: Record<StepStatus, string> = {
  pending: 'text-[var(--fg-muted)]',
  active: 'text-[var(--fg-primary)] font-semibold',
  completed: 'text-[var(--fg-primary)]',
  locked: 'text-[var(--fg-muted)] opacity-60',
};

const connectorStyles: Record<StepStatus, string> = {
  pending: 'bg-[var(--border)]',
  active: 'bg-[var(--border)]',
  completed: 'bg-emerald-400',
  locked: 'bg-[var(--border)]',
};

export function Stepper({
  steps,
  onStepClick,
  orientation = 'horizontal',
  compact = false,
  className = '',
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';
  const size = compact ? 28 : 34;

  return (
    <ol
      className={[
        isHorizontal
          ? 'flex items-start gap-0 w-full'
          : 'flex flex-col gap-0 w-full',
        className,
      ].join(' ')}
      aria-label="Progreso"
    >
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const isClickable = step.status !== 'locked' && !!onStepClick;
        return (
          <li
            key={step.id}
            className={[
              isHorizontal ? 'flex-1 flex items-start min-w-0' : 'flex items-start gap-3',
            ].join(' ')}
          >
            <div
              className={[
                isHorizontal ? 'flex flex-col items-center min-w-0 flex-1' : 'flex items-center gap-3',
              ].join(' ')}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step)}
                aria-current={step.status === 'active' ? 'step' : undefined}
                aria-label={`Paso ${i + 1}: ${step.label}`}
                className={[
                  'relative inline-flex items-center justify-center rounded-full shrink-0',
                  'transition-all duration-200 font-semibold text-[13px]',
                  dotStyles[step.status],
                  isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                ].join(' ')}
                style={{ width: size, height: size }}
              >
                {step.status === 'completed' ? (
                  <CheckIcon />
                ) : step.status === 'locked' ? (
                  <LockIcon />
                ) : step.icon ? (
                  step.icon
                ) : (
                  i + 1
                )}
              </button>

              {!compact && (
                <div
                  className={[
                    isHorizontal ? 'mt-2 text-center px-2 min-w-0' : 'flex-1 min-w-0',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'text-[12.5px] leading-tight truncate',
                      labelStyles[step.status],
                    ].join(' ')}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-[11px] text-[var(--fg-muted)] mt-0.5 truncate">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isLast && (
              <div
                aria-hidden="true"
                className={[
                  isHorizontal
                    ? 'flex-1 h-[2px] mt-[15px] mx-1 rounded-full'
                    : 'w-[2px] min-h-[24px] my-1 ml-[16px] rounded-full',
                  connectorStyles[step.status],
                ].join(' ')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
