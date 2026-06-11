import { useProyectoStore } from "@/stores/finanzas/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import type { RegimenTributario, Sector } from "@/types/finanzas/proyecto";

const sectores: { valor: Sector; label: string }[] = [
  { valor: "produccion", label: "Producción" },
  { valor: "comercio", label: "Comercio" },
  { valor: "servicios", label: "Servicios" },
  { valor: "agricultura", label: "Agricultura" },
  { valor: "mixto", label: "Mixto" },
];

const regimenes: { valor: RegimenTributario; label: string; desc: string }[] = [
  { valor: "general", label: "Régimen General", desc: "Factura, IVA 13% débito/crédito, IT 3%, IUE 25%. El más común y completo." },
  { valor: "rts", label: "Régimen Simplificado (RTS)", desc: "Cuota fija bimensual por categoría. Sin IVA ni IT. Comercios pequeños." },
  { valor: "rau", label: "Régimen Agropecuario (RAU)", desc: "Cuota anual por hectárea. Productores rurales." },
  { valor: "sin_actividad", label: "Sin actividad fiscal", desc: "Solo para casos académicos sin factura. No aplica IVA ni IT." },
];

const categoriasRts: { valor: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { valor: 1, label: "Categoría 1 — Capital Bs 12.001–15.000" },
  { valor: 2, label: "Categoría 2 — Capital Bs 15.001–18.700" },
  { valor: 3, label: "Categoría 3 — Capital Bs 18.701–23.500" },
  { valor: 4, label: "Categoría 4 — Capital Bs 23.501–29.500" },
  { valor: 5, label: "Categoría 5 — Capital Bs 29.501–37.000" },
];

export default function Paso1Datos() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const actualizar = useProyectoStore((s) => s.actualizarDatosGenerales);
  const setTributacion = useProyectoStore((s) => s.setTributacion);

  const trib = proyecto.tributacion;
  const regimen: RegimenTributario = trib?.regimen ?? "sin_actividad";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Paso 1 · Datos generales</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define la identidad básica de tu proyecto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Campo
            id="p1-nombre"
            label="Nombre del proyecto"
            valor={proyecto.nombre}
            onChange={(v) => actualizar({ nombre: v })}
          />
          <Campo
            id="p1-ubicacion"
            label="Ubicación"
            placeholder="Ej: Cochabamba, zona norte"
            valor={proyecto.ubicacion}
            onChange={(v) => actualizar({ ubicacion: v })}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="p1-descripcion" className="text-sm font-medium">
            Descripción breve
          </label>
          <textarea
            id="p1-descripcion"
            rows={3}
            value={proyecto.descripcion}
            onChange={(e) => actualizar({ descripcion: e.target.value })}
            placeholder="En 2-3 líneas describe qué hará tu proyecto."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="p1-sector" className="text-sm font-medium">
            Sector económico
          </label>
          <select
            id="p1-sector"
            value={proyecto.sector}
            onChange={(e) => actualizar({ sector: e.target.value as Sector })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {sectores.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Régimen tributario (sesión 13) — define cómo se calculan IVA, IT e IUE */}
        <div className="space-y-1.5 border-t border-border pt-4">
          <label htmlFor="p1-regimen" className="text-sm font-medium">
            Régimen tributario
          </label>
          <select
            id="p1-regimen"
            value={regimen}
            onChange={(e) => setTributacion({ regimen: e.target.value as RegimenTributario })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {regimenes.map((r) => (
              <option key={r.valor} value={r.valor}>
                {r.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {regimenes.find((r) => r.valor === regimen)?.desc}
          </p>

          {regimen === "rts" && (
            <div className="mt-2 space-y-1.5">
              <label htmlFor="p1-rts-cat" className="text-xs font-medium">
                Categoría del RTS
              </label>
              <select
                id="p1-rts-cat"
                value={trib?.categoriaRts ?? 1}
                onChange={(e) =>
                  setTributacion({ regimen: "rts", categoriaRts: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categoriasRts.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {regimen === "rau" && (
            <div className="mt-2 space-y-1.5">
              <label htmlFor="p1-rau-ha" className="text-xs font-medium">
                Hectáreas
              </label>
              <input
                id="p1-rau-ha"
                type="number"
                min={0}
                step={0.1}
                value={trib?.hectareasRau ?? 0}
                onChange={(e) =>
                  setTributacion({ regimen: "rau", hectareasRau: Number(e.target.value) || 0 })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {regimen === "general" && (
            <p className="mt-2 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              📌 En este régimen, en los pasos siguientes vas a marcar qué productos
              <strong> emiten factura</strong> y qué compras se hacen <strong>con factura</strong>.
              El sistema calcula IVA débito/crédito mensual e IT con arrastre del saldo a favor.
            </p>
          )}
        </div>
      </div>

      <FichaPedagogica
        titulo="Estudio de factibilidad"
        contenido={
          <>
            Un estudio de factibilidad evalúa si una idea de negocio es viable
            <strong> económica, técnica y legalmente</strong>. Los datos generales aquí son la
            primera capa: ubicación afecta acceso a mercado, sector define qué normativa
            aplica (SENASAG si es alimentos, ASFI si es financiero, etc.).
          </>
        }
      />
    </div>
  );
}

function Campo({
  id,
  label,
  valor,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
