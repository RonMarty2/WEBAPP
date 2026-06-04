'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform, BUNDLE_PRECIO_MENSUAL } from '@/lib/ecosistema/platforms';

type MetodoPago = 'tigo' | 'qr' | 'transferencia';
type Plan = 'standalone' | 'bundle';

export default function ComprarFinanzas() {
  const platform = getPlatform('finanzas')!;
  const [plan, setPlan] = useState<Plan>('standalone');
  const [metodo, setMetodo] = useState<MetodoPago>('qr');
  const [enviado, setEnviado] = useState(false);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  const precio = plan === 'standalone' ? platform.precioStandalone : BUNDLE_PRECIO_MENSUAL;

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <PlatformShell platform={platform}>
      <header className="mb-8">
        <Link
          href="/ecosistema/universidad/finanzas"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Volver a Finanzas
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Suscribirse a Finanzas</h1>
        <p className="mt-2 text-slate-600">
          Acceso completo al curso, al SimuladorPRO y a tus artefactos. Cancelas cuando quieras.
        </p>
      </header>

      {enviado ? (
        <ConfirmacionEnvio precio={precio} metodo={metodo} email={email} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="space-y-6">
            <PlanCard
              titulo="Solo Finanzas"
              precio={platform.precioStandalone}
              seleccionado={plan === 'standalone'}
              onSelect={() => setPlan('standalone')}
              bullets={[
                'Las 6 clases interactivas',
                'SimuladorPRO ilimitado',
                'Artefactos guardados sin límite',
                'Exportación al Generador',
                'Cancela cuando quieras',
              ]}
            />
            <PlanCard
              titulo="Bundle completo (4 plataformas + Generador)"
              precio={BUNDLE_PRECIO_MENSUAL}
              seleccionado={plan === 'bundle'}
              onSelect={() => setPlan('bundle')}
              recomendado
              bullets={[
                'Finanzas + Mercados + Estrategia + Marketing',
                'Generador en modo conectado incluido',
                'Tus artefactos viajan a todas las plataformas',
                'Ahorro vs. comprar individuales',
                'Cancela cuando quieras',
              ]}
            />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Método de pago</h2>
            <p className="mt-1 text-sm text-slate-600">
              Una vez recibido el comprobante, activamos tu cuenta en menos de 24 horas.
            </p>

            <div className="mt-5 space-y-2">
              <MetodoPagoOption
                id="qr"
                label="QR Bancario (BCP / BNB / BMSC)"
                descripcion="Escaneas y pagas con tu app del banco"
                seleccionado={metodo === 'qr'}
                onSelect={() => setMetodo('qr')}
              />
              <MetodoPagoOption
                id="tigo"
                label="Tigo Money"
                descripcion="Pago desde tu billetera Tigo"
                seleccionado={metodo === 'tigo'}
                onSelect={() => setMetodo('tigo')}
              />
              <MetodoPagoOption
                id="transferencia"
                label="Transferencia bancaria"
                descripcion="Si prefieres transferencia directa"
                seleccionado={metodo === 'transferencia'}
                onSelect={() => setMetodo('transferencia')}
              />
            </div>

            <form className="mt-6 space-y-4 border-t border-slate-200 pt-6" onSubmit={enviar}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Tu correo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Teléfono <span className="text-xs font-normal text-slate-400">(para coordinar activación)</span>
                </label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="+591 7XXXXXXX"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Plan seleccionado</span>
                  <span className="font-semibold text-slate-900">
                    {plan === 'standalone' ? 'Solo Finanzas' : 'Bundle completo'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total mensual</span>
                  <span className="text-2xl font-bold text-slate-900">Bs. {precio}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Generar solicitud de pago
              </button>

              <p className="text-center text-xs text-slate-500">
                Al continuar aceptas los <Link href="/terminos" className="underline">términos</Link> y la{' '}
                <Link href="/privacidad" className="underline">política de privacidad</Link>.
              </p>
            </form>
          </section>
        </div>
      )}
    </PlatformShell>
  );
}

function PlanCard({
  titulo,
  precio,
  bullets,
  seleccionado,
  onSelect,
  recomendado,
}: {
  titulo: string;
  precio: number;
  bullets: string[];
  seleccionado: boolean;
  onSelect: () => void;
  recomendado?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative block w-full rounded-3xl border-2 p-6 text-left transition ${
        seleccionado
          ? 'border-emerald-500 bg-emerald-50/50 shadow-md'
          : 'border-slate-200 bg-white hover:border-emerald-300'
      }`}
    >
      {recomendado && (
        <span className="absolute -top-3 right-6 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
          Recomendado
        </span>
      )}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900">Bs. {precio}</p>
          <p className="text-xs text-slate-500">por mes</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

function MetodoPagoOption({
  id,
  label,
  descripcion,
  seleccionado,
  onSelect,
}: {
  id: string;
  label: string;
  descripcion: string;
  seleccionado: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
        seleccionado ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <input
        id={id}
        type="radio"
        name="metodo"
        checked={seleccionado}
        onChange={onSelect}
        className="mt-1 h-4 w-4 cursor-pointer accent-emerald-600"
      />
      <div className="flex-1">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{descripcion}</p>
      </div>
    </label>
  );
}

function ConfirmacionEnvio({
  precio,
  metodo,
  email,
}: {
  precio: number;
  metodo: MetodoPago;
  email: string;
}) {
  const instrucciones: Record<MetodoPago, string> = {
    qr: 'Te enviamos el QR a tu correo. Escanea, paga Bs. ' + precio + ' y respóndenos con la captura del comprobante.',
    tigo:
      'Te enviamos los datos para Tigo Money a tu correo. Una vez transfieras Bs. ' +
      precio +
      ', responde con el ID de transacción.',
    transferencia:
      'Te enviamos los datos bancarios a tu correo. Transfiere Bs. ' +
      precio +
      ' y responde con la captura del comprobante.',
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-2xl text-white">
        ✓
      </div>
      <h2 className="mt-5 text-2xl font-bold text-emerald-900">Solicitud recibida</h2>
      <p className="mt-2 text-sm text-emerald-900/80">
        Te enviamos los pasos a <strong>{email}</strong>.
      </p>
      <p className="mt-4 rounded-2xl bg-white p-4 text-left text-sm text-slate-700">
        {instrucciones[metodo]}
      </p>
      <p className="mt-4 text-xs text-emerald-900/70">
        Activamos tu cuenta en menos de 24 horas desde que recibimos el comprobante.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/ecosistema/universidad/finanzas"
          className="rounded-full border border-emerald-300 bg-white px-5 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Volver a Finanzas
        </Link>
      </div>
    </div>
  );
}
