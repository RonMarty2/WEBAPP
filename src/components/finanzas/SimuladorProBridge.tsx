type SimuladorProBridgeProps = {
  seccion?: string;
};

export default function SimuladorProBridge({
  seccion = "Finanzas",
}: SimuladorProBridgeProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SIMULADOR_PRO_FINANZAS_URL?.replace(
    /\/$/,
    ""
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cerebro financiero externo
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{seccion}</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                WEBAPP conserva esta entrada visual, pero los calculos y la
                simulacion financiera viven en simuladorPRO.
              </p>
            </div>
            {baseUrl && (
              <a
                href={baseUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Abrir simuladorPRO
              </a>
            )}
          </div>
        </header>

        {baseUrl ? (
          <iframe
            title="simuladorPRO"
            src={baseUrl}
            className="h-[calc(100vh-180px)] min-h-[640px] w-full rounded-lg border border-slate-200 bg-white shadow-sm"
          />
        ) : (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            <h2 className="font-semibold">Conexion pendiente</h2>
            <p className="mt-2">
              Configura `NEXT_PUBLIC_SIMULADOR_PRO_FINANZAS_URL` con la URL
              publica de simuladorPRO. Hasta entonces, WEBAPP no ejecuta
              calculos financieros locales.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
