export function ProgressTracker({ porcentaje, color = '#0ea5e9' }: { porcentaje: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${porcentaje}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600">{porcentaje}%</span>
    </div>
  );
}
