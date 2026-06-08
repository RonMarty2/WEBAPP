"use client";

/**
 * Página /pago — checkout con pago manual (Tigo / QR / transferencia).
 *
 * REFACTOR (sesión 9): ahora respeta los 6 SKUs del catálogo
 * (mono-basico, mono-plus, mono-premium, pg-basico, pg-plus, pg-premium).
 * Antes solo entendía 2 (estandar, pro) y cualquier otro slug se
 * silenciaba y mostraba Bs 150 sin avisar — bug que perdía ventas.
 */

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PLANES, planPorSlug, migrarSlugLegacy } from "@/lib/pago/catalogo";

type Metodo = "tigo_money" | "qr_bancario" | "transferencia";
type Estado = "pendiente" | "aprobado" | "rechazado";

interface Solicitud {
  id: string;
  plan: string;        // slug del catálogo
  monto_bs: number;
  metodo: Metodo;
  estado: Estado;
  comprobante_b64?: string;
  notas_admin?: string;
  created_at: string;
}

interface PaymentConfig {
  tigo_money_numero?: string;
  tigo_money_nombre?: string;
  banco_nombre?: string;
  banco_cuenta?: string;
  banco_titular?: string;
  banco_ci?: string;
  qr_imagen_b64?: string;
  instrucciones_extra?: string;
}

const METODOS_LABEL: Record<Metodo, string> = {
  tigo_money: "Tigo Money",
  qr_bancario: "QR Bancario (QR-BO)",
  transferencia: "Transferencia Bancaria",
};

// Slug por defecto si la URL no trae nada o trae basura.
const SLUG_DEFAULT = "mono-basico";

function PagoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParamRaw = searchParams.get("plan") ?? SLUG_DEFAULT;
  // Soporta slugs viejos (estandar → mono-basico, pro → mono-plus).
  const planParam = migrarSlugLegacy(planParamRaw);
  // Si el slug no existe en el catálogo, cae al default sin romper.
  const slugInicial = planPorSlug(planParam) ? planParam : SLUG_DEFAULT;

  const [plan, setPlan] = useState<string>(slugInicial);
  const [metodo, setMetodo] = useState<Metodo>("tigo_money");
  const [config, setConfig] = useState<PaymentConfig>({});
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [notas, setNotas] = useState("");
  const [comprobante, setComprobante] = useState<{ b64: string; tipo: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/payments")
      .then(r => r.json())
      .then(d => {
        if (d.solicitudes?.length) {
          const activa = d.solicitudes.find((s: Solicitud) => s.estado === "pendiente") ?? d.solicitudes[0];
          setSolicitud(activa);
        }
        setConfig(d.payment_config ?? {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function crearSolicitud() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, metodo, notas_usuario: notas }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error al crear solicitud");
      setSolicitud(d.solicitud);
      setSuccess("Solicitud creada. Ahora sube tu comprobante de pago.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_600_000) { setError("El archivo es demasiado grande (máx. 1.6 MB)"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      const b64 = dataUrl.split(",")[1];
      setComprobante({ b64, tipo: file.type });
    };
    reader.readAsDataURL(file);
  }

  async function subirComprobante() {
    if (!solicitud || !comprobante) return;
    setUploading(true);
    setError("");
    try {
      const res = await fetch(`/api/payments/${solicitud.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comprobante_b64: comprobante.b64, comprobante_tipo: comprobante.tipo }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error al subir comprobante");
      setSolicitud(d.solicitud);
      setSuccess("Comprobante enviado correctamente. El admin verificará tu pago pronto.");
      setComprobante(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function cancelarSolicitud() {
    if (!solicitud) return;
    if (!confirm("¿Cancelar esta solicitud de pago?")) return;
    await fetch(`/api/payments/${solicitud.id}`, { method: "DELETE" });
    setSolicitud(null);
    setSuccess("");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  // Datos del plan elegido — siempre existen por el guard en slugInicial.
  const planInfo = planPorSlug(plan) ?? planPorSlug(SLUG_DEFAULT)!;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#f1f5f9", fontFamily: "'Inter', sans-serif", padding: "2rem 1rem" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/dashboard" style={{ color: "#94a3b8", fontSize: 13, textDecoration: "none" }}>← Volver al dashboard</Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: "1rem", marginBottom: 4 }}>Activar tu Plan</h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Pago manual — el admin verifica y activa tu cuenta en minutos.</p>
        </div>

        {/* Estado aprobado */}
        {solicitud?.estado === "aprobado" && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#4ade80" }}>¡{planPorSlug(solicitud.plan)?.nombre ?? solicitud.plan} activado!</div>
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>Ya puedes usar todas las funciones del plan.</p>
            <button onClick={() => router.push("/dashboard")} style={{ marginTop: "1rem", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
              Ir al Dashboard →
            </button>
          </div>
        )}

        {/* Estado rechazado */}
        {solicitud?.estado === "rechazado" && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#f87171" }}>Solicitud rechazada</div>
            {solicitud.notas_admin && <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>{solicitud.notas_admin}</p>}
            <button onClick={() => setSolicitud(null)} style={{ marginTop: "1rem", background: "transparent", color: "#94a3b8", border: "1px solid #475569", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Formulario inicial — si no hay solicitud pendiente */}
        {!solicitud && (
          <>
            {/* Selector de plan — muestra los 6 SKUs del catálogo agrupados
                por familia. El que vino en la URL viene preseleccionado. */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Monografía
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.7rem", marginBottom: "1rem" }}>
                {PLANES.filter((p) => p.activo && p.familia === "monografia").map((p) => (
                  <button key={p.slug} onClick={() => setPlan(p.slug)} style={{
                    padding: "1rem 0.85rem", borderRadius: 12,
                    border: plan === p.slug ? "2px solid #3b82f6" : "2px solid #334155",
                    background: plan === p.slug ? "rgba(59,130,246,0.12)" : "rgba(30,41,59,0.8)",
                    cursor: "pointer", textAlign: "left", color: "#f1f5f9",
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: plan === p.slug ? "#60a5fa" : "#f1f5f9" }}>{p.nombre}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: plan === p.slug ? "#3b82f6" : "#94a3b8" }}>Bs. {p.precio_bs}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{p.headline}</div>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Proyecto de Grado
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.7rem" }}>
                {PLANES.filter((p) => p.activo && p.familia === "proyecto_grado").map((p) => (
                  <button key={p.slug} onClick={() => setPlan(p.slug)} style={{
                    padding: "1rem 0.85rem", borderRadius: 12,
                    border: plan === p.slug ? "2px solid #a78bfa" : "2px solid #334155",
                    background: plan === p.slug ? "rgba(124,58,237,0.12)" : "rgba(30,41,59,0.8)",
                    cursor: "pointer", textAlign: "left", color: "#f1f5f9",
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: plan === p.slug ? "#c4b5fd" : "#f1f5f9" }}>{p.nombre}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: plan === p.slug ? "#a78bfa" : "#94a3b8" }}>Bs. {p.precio_bs}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{p.headline}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Opción alternativa: comprar UN módulo individual.
                Por ahora coordinamos precio por contacto directo —
                no hay flujo automatizado de pago modular todavía.
                Mantiene la arquitectura visible (que cada módulo
                se puede vender suelto) sin inventar precios. */}
            <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 12, padding: "1.2rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: "0.5rem" }}>¿SOLO QUIERES UN MÓDULO?</div>
              <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, marginBottom: "0.8rem" }}>
                Si solo necesitas <strong>uno</strong> de los 7 módulos (Idea, Mercados,
                Estrategia, Marketing, Organización, Finanzas o Defensa) en vez del SaaS
                entero, también lo vendemos suelto a un precio menor.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.8rem" }}>
                {[
                  { id: "idea", label: "💡 Idea" },
                  { id: "mercados", label: "📊 Mercados" },
                  { id: "estrategia", label: "🎯 Estrategia" },
                  { id: "marketing", label: "📣 Marketing" },
                  { id: "organizacion", label: "🏢 Organización" },
                  { id: "finanzas", label: "💰 Finanzas" },
                  { id: "defensa", label: "🎓 Defensa" },
                ].map((m) => (
                  <span key={m.id} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "rgba(124,58,237,0.15)", color: "#c4b5fd" }}>
                    {m.label}
                  </span>
                ))}
              </div>
              <a
                href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_VENTAS || "").replace(/[^0-9]/g, "") || "59100000000"}?text=Hola%2C%20quiero%20comprar%20un%20m%C3%B3dulo%20individual%20del%20Laboratorio%20Acad%C3%A9mico%20PRO`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#7c3aed", color: "white", textDecoration: "none", fontSize: 13, fontWeight: 700 }}
              >
                Coordinar precio por WhatsApp →
              </a>
              <p style={{ marginTop: "0.6rem", fontSize: 11, color: "#94a3b8" }}>
                Pago automático modular en desarrollo. Por ahora coordinamos el precio
                contigo según qué módulo necesitas y cuánto tiempo.
              </p>
            </div>

            {/* Selector de método */}
            <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #334155", borderRadius: 12, padding: "1.2rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: "0.8rem" }}>MÉTODO DE PAGO</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(Object.keys(METODOS_LABEL) as Metodo[]).map(m => (
                  <label key={m} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: metodo === m ? "rgba(59,130,246,0.08)" : "transparent" }}>
                    <input type="radio" name="metodo" value={m} checked={metodo === m} onChange={() => setMetodo(m)} style={{ accentColor: "#3b82f6" }} />
                    <span style={{ fontSize: 14, fontWeight: metodo === m ? 600 : 400 }}>{METODOS_LABEL[m]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Instrucciones de pago según método */}
            <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid #334155", borderRadius: 12, padding: "1.2rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: "0.8rem" }}>DATOS PARA REALIZAR EL PAGO</div>

              {metodo === "tigo_money" && (
                <div>
                  {config.tigo_money_numero
                    ? <>
                        <div style={{ fontSize: 13, color: "#94a3b8" }}>Número Tigo Money:</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80", margin: "4px 0 8px" }}>{config.tigo_money_numero}</div>
                        {config.tigo_money_nombre && <div style={{ fontSize: 13, color: "#64748b" }}>A nombre de: <strong style={{ color: "#f1f5f9" }}>{config.tigo_money_nombre}</strong></div>}
                      </>
                    : <div style={{ color: "#64748b", fontSize: 13 }}>El administrador aún no configuró el número de Tigo Money. Contáctalo directamente.</div>
                  }
                  <div style={{ marginTop: 12, fontSize: 13, color: "#4ade80", fontWeight: 600 }}>Monto exacto: Bs. {planInfo.precio_bs}</div>
                </div>
              )}

              {metodo === "qr_bancario" && (
                <div>
                  {config.qr_imagen_b64
                    ? <img src={`data:image/png;base64,${config.qr_imagen_b64}`} alt="QR de pago" style={{ width: 180, height: 180, border: "1px solid #334155", borderRadius: 8, background: "#fff" }} />
                    : <div style={{ color: "#64748b", fontSize: 13 }}>El QR bancario aún no está configurado. Usa otro método o contacta al admin.</div>
                  }
                  <div style={{ marginTop: 12, fontSize: 13, color: "#4ade80", fontWeight: 600 }}>Monto exacto: Bs. {planInfo.precio_bs}</div>
                </div>
              )}

              {metodo === "transferencia" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {config.banco_nombre && <div style={{ fontSize: 13 }}>Banco: <strong>{config.banco_nombre}</strong></div>}
                  {config.banco_cuenta && <div style={{ fontSize: 13 }}>Cuenta: <strong style={{ color: "#60a5fa" }}>{config.banco_cuenta}</strong></div>}
                  {config.banco_titular && <div style={{ fontSize: 13 }}>Titular: <strong>{config.banco_titular}</strong></div>}
                  {config.banco_ci && <div style={{ fontSize: 13 }}>CI: <strong>{config.banco_ci}</strong></div>}
                  {!config.banco_cuenta && <div style={{ color: "#64748b", fontSize: 13 }}>Datos bancarios aún no configurados.</div>}
                  <div style={{ marginTop: 8, fontSize: 13, color: "#4ade80", fontWeight: 600 }}>Monto exacto: Bs. {planInfo.precio_bs}</div>
                </div>
              )}

              {config.instrucciones_extra && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", borderTop: "1px solid #334155", paddingTop: 10 }}>{config.instrucciones_extra}</div>
              )}
            </div>

            {/* Notas opcionales */}
            <textarea
              placeholder="Nota opcional para el admin (ej: nombre completo, referencia de pago)"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={2}
              style={{ width: "100%", background: "rgba(30,41,59,0.8)", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 13, resize: "vertical", boxSizing: "border-box", marginBottom: "1rem" }}
            />

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: "1rem" }}>{error}</div>}

            <button onClick={crearSolicitud} disabled={sending} style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: sending ? "#334155" : "#3b82f6", color: "#fff", fontWeight: 800, fontSize: 16, cursor: sending ? "not-allowed" : "pointer",
            }}>
              {sending ? "Creando solicitud..." : `Solicitar activación — Bs. ${planInfo.precio_bs}`}
            </button>
          </>
        )}

        {/* Solicitud pendiente — subir comprobante */}
        {solicitud?.estado === "pendiente" && (
          <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #334155", borderRadius: 12, padding: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#facc15", marginBottom: 4 }}>⏳ Solicitud pendiente de verificación</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: "1.2rem" }}>
              {planPorSlug(solicitud.plan)?.nombre ?? solicitud.plan} · Bs. {solicitud.monto_bs} · {METODOS_LABEL[solicitud.metodo]}
              <br />Creada: {new Date(solicitud.created_at).toLocaleString("es-BO")}
            </div>

            {solicitud.comprobante_b64
              ? <div style={{ color: "#4ade80", fontSize: 13, marginBottom: "1rem" }}>✓ Comprobante enviado — el admin verificará pronto.</div>
              : <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: "1rem" }}>⚠ Aún no has subido el comprobante. Súbelo para que el admin pueda verificar tu pago.</div>
            }

            {/* Upload comprobante */}
            <div style={{ border: "2px dashed #334155", borderRadius: 10, padding: "1.2rem", textAlign: "center", marginBottom: "1rem", cursor: "pointer" }}
              onClick={() => fileRef.current?.click()}>
              {comprobante
                ? <span style={{ color: "#4ade80", fontSize: 13 }}>✓ Imagen seleccionada (lista para subir)</span>
                : <span style={{ color: "#64748b", fontSize: 13 }}>Haz clic para seleccionar el comprobante (JPG/PNG/PDF, máx 1.6 MB)</span>
              }
              <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleFileChange} />
            </div>

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: "1rem" }}>{error}</div>}
            {success && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 14px", color: "#4ade80", fontSize: 13, marginBottom: "1rem" }}>{success}</div>}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={subirComprobante} disabled={!comprobante || uploading} style={{
                flex: 1, padding: "12px", borderRadius: 8, border: "none",
                background: comprobante ? "#3b82f6" : "#334155", color: "#fff", fontWeight: 700, cursor: comprobante ? "pointer" : "not-allowed",
              }}>
                {uploading ? "Subiendo..." : solicitud.comprobante_b64 ? "Actualizar comprobante" : "Subir comprobante"}
              </button>
              <button onClick={cancelarSolicitud} style={{
                padding: "12px 16px", borderRadius: 8, border: "1px solid #475569",
                background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13,
              }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PagoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <PagoContent />
    </Suspense>
  );
}
