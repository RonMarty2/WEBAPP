interface PricingCardProps {
  nombre: string;
  precio: number;
  periodo: string;
  descripcion: string;
  features: string[];
  destacado?: boolean;
  cta: string;
}

export function PricingCard({ nombre, precio, periodo, descripcion, features, destacado, cta }: PricingCardProps) {
  return (
    <div className={`relative rounded-3xl border p-6 ${
      destacado ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-slate-200 bg-white'
    }`}>
      {destacado && (
        <span className="absolute -top-3 left-6 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">
          Más popular
        </span>
      )}
      <h3 className="text-lg font-bold text-slate-900">{nombre}</h3>
      <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
      <p className="mt-4">
        <span className="text-4xl font-bold text-slate-900">Bs. {precio}</span>
        <span className="text-sm text-slate-500"> /{periodo}</span>
      </p>
      <ul className="mt-6 space-y-2 text-sm text-slate-700">
        {features.map(f => (
          <li key={f} className="flex gap-2">
            <span className="text-emerald-600">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button className={`mt-6 w-full rounded-full py-3 font-medium ${
        destacado ? 'bg-amber-600 text-white hover:bg-amber-700' : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
      }`}>
        {cta}
      </button>
    </div>
  );
}
