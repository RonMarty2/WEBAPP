'use client';

import {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
  useId,
} from 'react';

type Size = 'sm' | 'md' | 'lg';

const fieldBase =
  'w-full bg-white/80 border rounded-xl text-[var(--fg-primary)] ' +
  'placeholder:text-[var(--fg-muted)] ' +
  'transition-all duration-200 outline-none ' +
  'focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/15 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-subtle)] ' +
  'dark:bg-white/5 dark:focus:bg-white/10';

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-4 text-[15px]',
};

function FieldShell({
  label,
  helper,
  error,
  required,
  htmlFor,
  children,
}: {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-semibold text-[var(--fg-secondary)] tracking-wide"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-rose-600 dark:text-rose-400">{error}</p>
      ) : helper ? (
        <p className="text-[12px] text-[var(--fg-muted)]">{helper}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  inputSize?: Size;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helper,
      error,
      inputSize = 'md',
      leftAddon,
      rightAddon,
      required,
      id,
      className = '',
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const errored = !!error;
    return (
      <FieldShell label={label} helper={helper} error={error} required={required} htmlFor={fieldId}>
        <div className="relative flex items-center">
          {leftAddon && (
            <span className="absolute left-3 inline-flex items-center text-[var(--fg-muted)] pointer-events-none [&_svg]:w-4 [&_svg]:h-4">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={errored || undefined}
            className={[
              fieldBase,
              sizes[inputSize],
              errored ? '!border-rose-400 focus:!ring-rose-300/30' : 'border-[var(--border)]',
              leftAddon ? 'pl-10' : '',
              rightAddon ? 'pr-10' : '',
              className,
            ].join(' ')}
            {...props}
          />
          {rightAddon && (
            <span className="absolute right-3 inline-flex items-center text-[var(--fg-muted)] [&_svg]:w-4 [&_svg]:h-4">
              {rightAddon}
            </span>
          )}
        </div>
      </FieldShell>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helper, error, required, id, className = '', rows = 4, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const errored = !!error;
    return (
      <FieldShell label={label} helper={helper} error={error} required={required} htmlFor={fieldId}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          required={required}
          aria-invalid={errored || undefined}
          className={[
            fieldBase,
            'py-3 px-4 text-sm leading-relaxed resize-y min-h-[88px]',
            errored ? '!border-rose-400 focus:!ring-rose-300/30' : 'border-[var(--border)]',
            className,
          ].join(' ')}
          {...props}
        />
      </FieldShell>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  inputSize?: Size;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helper, error, inputSize = 'md', required, id, className = '', children, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const errored = !!error;
    return (
      <FieldShell label={label} helper={helper} error={error} required={required} htmlFor={fieldId}>
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={errored || undefined}
            className={[
              fieldBase,
              sizes[inputSize],
              'appearance-none pr-10 cursor-pointer',
              errored ? '!border-rose-400 focus:!ring-rose-300/30' : 'border-[var(--border)]',
              className,
            ].join(' ')}
            {...props}
          >
            {children}
          </select>
          <span
            aria-hidden="true"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </FieldShell>
    );
  }
);

Select.displayName = 'Select';
