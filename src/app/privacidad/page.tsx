export default function PrivacidadPage() {
  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "var(--fg-primary)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        <a href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13, display: "inline-block", marginBottom: 32 }}>
          ← Volver al inicio
        </a>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Política de Privacidad</h1>
        <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 40 }}>Última actualización: 30 de abril de 2026</p>

        {[
          {
            titulo: "1. Información que recopilamos",
            contenido: `Al usar el Servicio, podemos recopilar:

• Datos de contenido académico: tema de investigación, objetivos, bibliografía proporcionada, documentos subidos voluntariamente.
• Datos de uso: etapas completadas, tiempo de sesión, número de generaciones.
• Datos de identificación de sesión: identificadores de sesión generados automáticamente (no vinculados a datos personales por defecto).

No solicitamos nombre, correo electrónico, número de cédula ni datos de pago a través de la plataforma. El pago se coordina fuera del sistema.`,
          },
          {
            titulo: "2. Cómo usamos la información",
            contenido: `Los datos recopilados se usan para:
• Generar el documento académico solicitado mediante llamadas a la API de IA.
• Mantener el estado de la sesión durante la generación.
• Generar estadísticas agregadas y anónimas de uso (número de monografías, etapas completadas).

No usamos los datos para publicidad, perfilado ni venta a terceros.`,
          },
          {
            titulo: "3. Almacenamiento y retención",
            contenido: `Los datos se almacenan en memoria del servidor (in-memory). Se eliminan automáticamente cuando el servidor se reinicia. En la configuración con base de datos (Supabase), los datos se retienen según la configuración del administrador.

Los documentos subidos por el usuario se procesan en el momento y no se almacenan de forma permanente en la configuración base.`,
          },
          {
            titulo: "4. Proveedores de IA",
            contenido: `El sistema utiliza APIs de inteligencia artificial de terceros para generar contenido:
• Groq (proveedor principal): groq.com — su política de privacidad aplica al procesamiento de prompts.
• Anthropic (fallback): anthropic.com — su política de privacidad aplica cuando se usa como respaldo.
• OpenAI (fallback secundario): openai.com — su política aplica como segundo respaldo.

Los prompts enviados a estas APIs incluyen el contenido académico que el usuario ingresa. No incluyen datos de identificación personal.`,
          },
          {
            titulo: "5. Derechos del usuario",
            contenido: `Usted tiene derecho a:
• Solicitar la eliminación de sus datos (en la configuración con BD, contactar al administrador).
• Conocer qué datos se almacenan sobre su sesión.
• Exportar el contenido generado en cualquier momento descargando el PDF o LaTeX.

Para ejercer estos derechos, contacte al administrador del sistema.`,
          },
          {
            titulo: "6. Seguridad",
            contenido: `Implementamos medidas técnicas básicas para proteger los datos:
• Comunicación HTTPS en producción.
• Acceso al panel de administración protegido con credenciales.
• Sin almacenamiento de contraseñas en texto plano.

Sin embargo, ningún sistema es completamente seguro. No almacene información extremadamente sensible en los campos del formulario.`,
          },
          {
            titulo: "7. Cambios en esta política",
            contenido: `Esta política puede actualizarse. Los cambios se publicarán en esta página con la fecha de actualización. El uso continuado del Servicio implica aceptación de la política vigente.`,
          },
          {
            titulo: "8. Contacto",
            contenido: `Para consultas sobre privacidad, contacte al administrador del sistema a través de los canales indicados al momento de la contratación.`,
          },
        ].map(sec => (
          <div key={sec.titulo} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--accent)", marginBottom: 10 }}>{sec.titulo}</h2>
            <p style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-line" }}>{sec.contenido}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 20, fontSize: 12, color: "var(--fg-muted)" }}>
          Laboratorio Académico · Sistema de generación de monografías con IA · Bolivia
        </div>
      </div>
    </div>
  );
}
