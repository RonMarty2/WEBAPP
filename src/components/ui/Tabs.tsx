'use client';

import { ReactNode, useState, useCallback, KeyboardEvent } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  variant?: 'pill' | 'underline' | 'segmented';
  fullWidth?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tabs({
  tabs,
  value,
  defaultValue,
  onChange,
  variant = 'pill',
  fullWidth = false,
  size = 'md',
  className = '',
}: TabsProps) {
  const [internal, setInternal] = useState<string>(
    defaultValue ?? tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id ?? ''
  );
  const isControlled = value !== undefined;
  const current = isControlled ? value! : internal;

  const select = useCallback(
    (id: string) => {
      if (!isControlled) setInternal(id);
      onChange?.(id);
    },
    [isControlled, onChange]
  );

  const onKey = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      for (let i = 1; i <= tabs.length; i++) {
        const next = tabs[(idx + dir * i + tabs.length) % tabs.length];
        if (!next.disabled) {
          select(next.id);
          break;
        }
      }
    },
    [tabs, select]
  );

  const heights = size === 'sm' ? 'h-8 text-[12.5px]' : 'h-10 text-[13.5px]';

  if (variant === 'underline') {
    return (
      <div
        role="tablist"
        className={[
          'flex items-center gap-1 border-b border-[var(--border)]',
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
      >
        {tabs.map((t, i) => {
          const active = t.id === current;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              disabled={t.disabled}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={[
                'relative inline-flex items-center gap-2 px-4 font-medium',
                heights,
                'transition-colors duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded-md',
                t.disabled
                  ? 'text-[var(--fg-muted)] opacity-50 cursor-not-allowed'
                  : active
                  ? 'text-[var(--fg-primary)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)]',
                fullWidth ? 'flex-1 justify-center' : '',
              ].join(' ')}
            >
              {t.icon && <span className="[&_svg]:w-4 [&_svg]:h-4">{t.icon}</span>}
              <span className="truncate">{t.label}</span>
              {t.badge && <span className="ml-1">{t.badge}</span>}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-px left-0 right-0 h-[2px] bg-[var(--accent)] rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        className={[
          'inline-flex items-center gap-0.5 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]',
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
      >
        {tabs.map((t, i) => {
          const active = t.id === current;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              disabled={t.disabled}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={[
                'inline-flex items-center justify-center gap-2 px-4 rounded-lg font-medium',
                heights,
                'transition-all duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                t.disabled
                  ? 'text-[var(--fg-muted)] opacity-50 cursor-not-allowed'
                  : active
                  ? 'bg-white text-[var(--fg-primary)] shadow-sm dark:bg-white/10'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)]',
                fullWidth ? 'flex-1' : '',
              ].join(' ')}
            >
              {t.icon && <span className="[&_svg]:w-4 [&_svg]:h-4">{t.icon}</span>}
              <span className="truncate">{t.label}</span>
              {t.badge && <span>{t.badge}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // pill (default)
  return (
    <div
      role="tablist"
      className={['inline-flex items-center gap-1.5 flex-wrap', fullWidth ? 'w-full' : '', className].join(' ')}
    >
      {tabs.map((t, i) => {
        const active = t.id === current;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={t.disabled}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={[
              'inline-flex items-center gap-2 px-4 rounded-full font-medium border',
              heights,
              'transition-all duration-200',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              t.disabled
                ? 'text-[var(--fg-muted)] border-[var(--border)] opacity-50 cursor-not-allowed'
                : active
                ? 'bg-[var(--fg-primary)] text-white border-[var(--fg-primary)] shadow-sm'
                : 'text-[var(--fg-secondary)] border-[var(--border)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-hover)]',
              fullWidth ? 'flex-1 justify-center' : '',
            ].join(' ')}
          >
            {t.icon && <span className="[&_svg]:w-4 [&_svg]:h-4">{t.icon}</span>}
            <span className="truncate">{t.label}</span>
            {t.badge && <span>{t.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
