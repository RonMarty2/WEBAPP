"use client";

/**
 * PricingSection — pricing en acordeón por producto
 *
 * Reemplaza al antiguo FeaturesSection (que tenía 2 planes universales).
 * Ahora: 2 productos (Monografía + Proyecto de Grado), cada uno con 3
 * niveles (Básico / Plus / Premium). Solo un producto expandido a la vez.
 *
 * Copy enfocado en marketing: "nosotros hacemos por ti" + tiempos visibles.
 * Sin info técnica (qué IA usa, tokens, etc.) — eso queda dentro del wizard.
 *
 * REFACTOR (sesión 9): la fuente de datos ahora es `src/lib/pago/catalogo.ts`.
 * Antes el array PRODUCTOS estaba hardcodeado acá y NO coincidía con lo
 * que /api/payments aceptaba — un click en "Plus Bs 300" terminaba
 * pagando Bs 150. Ahora landing + API + /pago leen del mismo catálogo.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { planesPorFamilia, type PlanCatalogo } from "@/lib/pago/catalogo";

interface Plan {
  tier: string;
  headline: string;
  subhead: string;
  tiempo: string;
  precio: string;
  incluye: string[];
  noIncluye?: string[];
  recomendado?: boolean;
  cta: string;
  ctaSlug: string; // para query string ?plan=...
}

interface Producto {
  id: string;
  icon: string;
  nombre: string;
  descripcion: string;
  planes: Plan[];
}

// Adapta el catálogo unificado al shape que la UI espera.
function adaptarDeCatalogo(p: PlanCatalogo): Plan {
  return {
    tier: p.tier.charAt(0).toUpperCase() + p.tier.slice(1),
    headline: p.headline,
    subhead: p.subhead,
    tiempo: p.tiempo,
    precio: `Bs. ${p.precio_bs}`,
    incluye: p.incluye,
    noIncluye: p.no_incluye,
    recomendado: p.recomendado,
    cta: p.cta,
    ctaSlug: p.slug,
  };
}


// Construye los productos en runtime desde el catálogo unificado.
// Si en el futuro se agrega un SKU al catálogo, aparece acá automáticamente.
function construirProductosDesdeCatalogo(): Producto[] {
  const porFamilia = planesPorFamilia();
  return [
    {
      id: "monografia",
      icon: "📝",
      nombre: "Monografía Académica",
      descripcion: "Para titularte de un diplomado o postgrado · Bolivia · UMSS",
      planes: porFamilia.monografia.map(adaptarDeCatalogo),
    },
    {
      id: "proygrado",
      icon: "📊",
      nombre: "Proyecto de Grado",
      descripcion: "Plan de negocio completo · producto o servicio · análisis financiero",
      planes: porFamilia.proyecto_grado.map(adaptarDeCatalogo),
    },
  ];
}

export default function PricingSection() {
  const router = useRouter();
  const [productoActivo, setProductoActivo] = useState<string>("monografia");

  const PRODUCTOS = construirProductosDesdeCatalogo();

  const handleCTA = (slug: string) => {
    router.push(`/login?plan=${slug}`);
  };

  return (
    <section
      id="planes"
      style={{
        padding: "70px 24px 80px",
        background: "var(--bg-card, #ffffff)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h2
          className="font-crimson"
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "var(--fg-primary)",
            margin: "0 0 8px",
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          Elige cuánto acompañamiento necesitas
        </h2>
        <p
          style={{
            color: "var(--fg-muted)",
            fontSize: 15.5,
            textAlign: "center",
            margin: "0 auto 36px",
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          Nosotros redactamos tu documento completo. Tú decides hasta dónde nos
          quedamos a tu lado: solo entrega, hasta la aprobación del tutor, o
          hasta el día de la defensa.
        </p>

        {PRODUCTOS.map((producto) => {
          const activo = productoActivo === producto.id;
          return (
            <div
              key={producto.id}
              style={{
                marginBottom: 16,
                border: activo
                  ? "2px solid var(--accent)"
                  : "2px solid rgba(15,23,42,0.22)",
                borderRadius: 16,
                overflow: "hidden",
                transition: "border-color 0.25s, box-shadow 0.25s",
                background: "var(--bg-card, #ffffff)",
                boxShadow: activo
                  ? "0 4px 12px rgba(15,23,42,0.08), 0 12px 32px rgba(99,102,241,0.14)"
                  : "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(99,102,241,0.06)",
              }}
            >
              <button
                type="button"
                onClick={() => setProductoActivo(producto.id)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: activo
                    ? "linear-gradient(90deg, rgba(99,102,241,0.08), transparent)"
                    : "transparent",
                  borderBottom: activo ? "1px solid var(--border)" : "none",
                  border: "none",
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: "inherit",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(99,102,241,0.08)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {producto.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    className="font-crimson"
                    style={{
                      margin: 0,
                      fontSize: 19,
                      fontWeight: 800,
                      color: "var(--fg-primary)",
                    }}
                  >
                    {producto.nombre}
                  </h3>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 13,
                      color: "var(--fg-muted)",
                    }}
                  >
                    {producto.descripcion}
                  </p>
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.08)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    transform: activo ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                  }}
                >
                  ▼
                </div>
              </button>

              {activo && (
                <div style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 16,
                      alignItems: "stretch",
                    }}
                  >
                    {producto.planes.map((p) => (
                      <PlanCard key={p.ctaSlug} plan={p} onCTA={handleCTA} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PlanCard({ plan, onCTA }: { plan: Plan; onCTA: (slug: string) => void }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: plan.recomendado
          ? "2.5px solid var(--accent)"
          : "1.5px solid rgba(15,23,42,0.22)",
        background: "var(--bg-card, #ffffff)",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        boxShadow: plan.recomendado
          ? "0 10px 32px rgba(99, 102, 241, 0.20)"
          : "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(99,102,241,0.06)",
        color: "var(--fg-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow = plan.recomendado
          ? "0 14px 40px rgba(99, 102, 241, 0.30)"
          : "0 4px 12px rgba(15,23,42,0.08), 0 12px 32px rgba(99,102,241,0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = plan.recomendado
          ? "var(--accent)"
          : "rgba(15,23,42,0.22)";
        e.currentTarget.style.boxShadow = plan.recomendado
          ? "0 10px 32px rgba(99, 102, 241, 0.20)"
          : "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(99,102,241,0.06)";
      }}
    >
      <div
        style={{
          padding: "22px 18px 18px",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          background: plan.recomendado
            ? "linear-gradient(180deg, rgba(99,102,241,0.08), var(--bg-card, #ffffff))"
            : "var(--bg-card, #ffffff)",
        }}
      >
        {plan.recomendado && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "var(--accent)",
              color: "white",
              padding: "4px 12px",
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 999,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              boxShadow: "0 2px 8px rgba(99,102,241,0.30)",
            }}
          >
            Más elegido
          </span>
        )}
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: plan.recomendado ? "var(--accent-dark, #4f46e5)" : "var(--accent)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {plan.tier}
        </div>
        <div
          className="font-crimson"
          style={{
            fontSize: 19,
            fontWeight: 800,
            lineHeight: 1.2,
            minHeight: 46,
            color: "var(--fg-primary)",
          }}
        >
          {plan.headline}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--fg-muted)",
            lineHeight: 1.45,
            margin: "8px 0 14px",
            minHeight: 54,
          }}
        >
          {plan.subhead}
        </div>
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(22,163,74,0.12)",
            color: "#16a34a",
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 14,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            border: "1px solid rgba(22,163,74,0.25)",
          }}
        >
          {plan.tiempo}
        </div>
        <div
          className="font-crimson"
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "var(--accent)",
          }}
        >
          {plan.precio}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--fg-muted)" }}>pago único</div>
      </div>

      <div style={{ padding: "18px 20px", flex: 1, background: "var(--bg-card, #ffffff)" }}>
        <p
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "var(--fg-muted)",
            margin: "0 0 8px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {plan.tier === "Básico" ? "Te entregamos" : "Todo lo anterior, más:"}
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 13, lineHeight: 1.6, color: "var(--fg-secondary)" }}>
          {plan.incluye.map((f, i) => (
            <li
              key={i}
              style={{
                paddingLeft: 22,
                position: "relative",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  color: "#16a34a",
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        {plan.noIncluye && plan.noIncluye.length > 0 && (
          <>
            <p
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: "#94a3b8",
                margin: "14px 0 8px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              No incluye
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 12, lineHeight: 1.6, color: "#94a3b8" }}>
              {plan.noIncluye.map((f, i) => (
                <li
                  key={i}
                  style={{
                    paddingLeft: 22,
                    position: "relative",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ position: "absolute", left: 0, color: "#cbd5e1" }}>—</span>
                  {f}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div style={{ padding: "0 20px 20px", background: "var(--bg-card, #ffffff)" }}>
        <button
          type="button"
          onClick={() => onCTA(plan.ctaSlug)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            background: plan.recomendado ? "var(--accent)" : "var(--bg-card, #ffffff)",
            border: plan.recomendado
              ? "1.5px solid var(--accent)"
              : "1.5px solid rgba(15,23,42,0.22)",
            color: plan.recomendado ? "white" : "var(--fg-primary)",
            fontFamily: "inherit",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s, color 0.15s",
            boxShadow: plan.recomendado ? "0 4px 12px rgba(99,102,241,0.30)" : "none",
          }}
          onMouseEnter={(e) => {
            if (plan.recomendado) {
              e.currentTarget.style.background = "var(--accent-dark, #4f46e5)";
            } else {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "rgba(99,102,241,0.08)";
            }
          }}
          onMouseLeave={(e) => {
            if (plan.recomendado) {
              e.currentTarget.style.background = "var(--accent)";
            } else {
              e.currentTarget.style.borderColor = "rgba(15,23,42,0.22)";
              e.currentTarget.style.color = "var(--fg-primary)";
              e.currentTarget.style.background = "var(--bg-card, #ffffff)";
            }
          }}
        >
          {plan.cta}
        </button>
      </div>
    </div>
  );
}
