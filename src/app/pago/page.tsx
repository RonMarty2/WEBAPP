"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Plan = "estandar" | "pro";
type Metodo = "tigo_money" | "qr_bancario" | "transferencia";
type Estado = "pendiente" | "aprobado" | "rechazado";

interface Solicitud {
  id: string;
  plan: Plan;
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

const PLANES = {
  estandar: { label: "Plan Estándar", precio: 150, desc: "1 monografía completa · PDF + LaTeX · APA 7 · Soporte" },
  pro: { label: "Plan Pro", precio: 300, desc: "3 documentos/mes · Mejor modelo IA · Soporte 24/7" },
};

const METODOS_LABEL: Record<Metodo, string> = {
  tigo_money: "Tigo Money",
  qr_bancario: "QR Bancario (QR-BO)",
  transferencia: "Transferencia Bancaria",
};

function PagoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = (searchParams.get("plan") ?? "estandar") as Plan;

  const [plan, setPlan] = useState<Plan>(planParam);
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

  const planInfo = PLANES[plan];

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
            <div style={{ fontWeight: 800, fontSize: 18, color: "#4ade80" }}>¡Plan {PLANES[solicitud.plan].label} activado!</div>
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
            {/* Selector de plan */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              {(Object.keys(PLANES) as Plan[]).map(p => (
                <button key={p} onClick={() => setPlan(p)} style={{
                  padding: "1.2rem 1rem", borderRadius: 12, border: plan === p ? "2px solid #3b82f6" : "2px solid #334155",
                  background: plan === p ? "rgba(59,130,246,0.12)" : "rgba(30,41,59,0.8)", cursor: "pointer", textAlign: "left", color: "#f1f5f9",
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: plan === p ? "#60a5fa" : "#f1f5f9" }}>{PLANES[p].label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: plan === p ? "#3b82f6" : "#94a3b8" }}>Bs. {PLANES[p].precio}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{PLANES[p].desc}</div>
                </button>
              ))}
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
                  <div style={{ marginTop: 12, fontSize: 13, color: "#4ade80", fontWeight: 600 }}>Monto exacto: Bs. {planInfo.precio}</div>
                </div>
              )}

              {metodo === "qr_bancario" && (
                <div>
                  {config.qr_imagen_b64
                    ? <img src={`data:image/png;base64,${config.qr_imagen_b64}`} alt="QR de pago" style={{ width: 180, height: 180, border: "1px solid #334155", borderRadius: 8, background: "#fff" }} />
                    : <div style={{ color: "#64748b", fontSize: 13 }}>El QR bancario aún no está configurado. Usa otro método o contacta al admin.</div>
                  }
                  <div style={{ marginTop: 12, fontSize: 13, color: "#4ade80", fontWeight: 600 }}>Monto exacto: Bs. {planInfo.precio}</div>
                </div>
              )}

              {metodo === "transferencia" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {config.banco_nombre && <div style={{ fontSize: 13 }}>Banco: <strong>{config.banco_nombre}</strong></div>}
                  {config.banco_cuenta && <div style={{ fontSize: 13 }}>Cuenta: <strong style={{ color: "#60a5fa" }}>{config.banco_cuenta}</strong></div>}
                  {config.banco_titular && <div style={{ fontSize: 13 }}>Titular: <strong>{config.banco_titular}</strong></div>}
                  {config.banco_ci && <div style={{ fontSize: 13 }}>CI: <strong>{config.banco_ci}</strong></div>}
                  {!config.banco_cuenta && <div style={{ color: "#64748b", fontSize: 13 }}>Datos bancarios aún no configurados.</div>}
                  <div style={{ marginTop: 8, fontSize: 13, color: "#4ade80", fontWeight: 600 }}>Monto exacto: Bs. {planInfo.precio}</div>
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
              {sending ? "Creando solicitud..." : `Solicitar activación — Bs. ${planInfo.precio}`}
            </button>
          </>
        )}

        {/* Solicitud pendiente — subir comprobante */}
        {solicitud?.estado === "pendiente" && (
          <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #334155", borderRadius: 12, padding: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#facc15", marginBottom: 4 }}>⏳ Solicitud pendiente de verificación</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: "1.2rem" }}>
              Plan {PLANES[solicitud.plan].label} · Bs. {solicitud.monto_bs} · {METODOS_LABEL[solicitud.metodo]}
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
