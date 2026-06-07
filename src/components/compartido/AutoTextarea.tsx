'use client';

/**
 * Textarea que crece automáticamente con el contenido (no recorta texto largo).
 *
 * Funciona igual que un <textarea> normal — acepta value, onChange, className,
 * etc. Internamente ajusta su `height` a `scrollHeight` cada vez que cambia el
 * value (incluida la carga inicial desde el servidor).
 *
 * Usar en cualquier campo de texto donde el contenido puede ser largo y no
 * queremos forzar al usuario a hacer scroll dentro de un textarea chiquito.
 */

import { useEffect, useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> & {
  /** Filas iniciales / mínimas. Default 2. El textarea solo CRECE desde este mínimo. */
  rowsMin?: number;
};

export function AutoTextarea({ rowsMin = 2, value, onInput, style, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  // Ajusta el alto a scrollHeight. Se llama al montar y cada vez que cambia el value.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={rowsMin}
      value={value}
      onInput={(e) => {
        const el = e.currentTarget;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
        onInput?.(e);
      }}
      style={{ ...style, overflow: 'hidden', resize: 'none' }}
      {...rest}
    />
  );
}
