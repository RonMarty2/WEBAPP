export default function TerminosPage() {
  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "var(--fg-primary)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        <a href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13, display: "inline-block", marginBottom: 32 }}>
          ← Volver al inicio
        </a>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Términos y Condiciones</h1>
        <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 40 }}>Última actualización: 30 de abril de 2026</p>

        {[
          {
            titulo: "1. Aceptación de los términos",
            contenido: `Al acceder y utilizar Laboratorio Académico ("el Servicio"), usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.`,
          },
          {
            titulo: "2. Descripción del servicio",
            contenido: `Laboratorio Académico es una plataforma de asistencia académica basada en inteligencia artificial que ayuda a generar monografías y trabajos de grado. El sistema produce contenido académico estructurado como apoyo a la redacción del usuario; no reemplaza el criterio académico ni la supervisión del tutor.`,
          },
          {
            titulo: "3. Uso permitido",
            contenido: `El Servicio está diseñado para:
• Asistir en la redacción y estructuración de trabajos académicos.
• Generar borradores que el usuario revisa, modifica y aprueba.
• Facilitar el cumplimiento de guías de estilo académico (APA 7, formatos universitarios).

El usuario es responsable del contenido final entregado a su institución.`,
          },
          {
            titulo: "4. Propiedad intelectual",
            contenido: `El contenido generado por el sistema a solicitud del usuario pertenece al usuario. Laboratorio Académico retiene los derechos sobre la plataforma, los prompts y la tecnología subyacente. El usuario declara que utilizará el contenido de forma ética y conforme a las políticas de integridad académica de su institución.`,
          },
          {
            titulo: "5. Limitación de responsabilidad",
            contenido: `Laboratorio Académico no garantiza:
• La aprobación del trabajo por parte de ninguna institución educativa.
• La originalidad absoluta del contenido generado (el usuario debe verificar con un detector de plagio si su institución lo exige).
• La precisión de todos los datos estadísticos generados (el sistema utiliza marcadores [DATO] cuando no tiene información verificable).

El usuario asume total responsabilidad por el uso del contenido generado.`,
          },
          {
            titulo: "6. Pagos y reembolsos",
            contenido: `El pago se realiza mediante transferencia bancaria o QR según las instrucciones del administrador. Una vez activado el acceso y generada la monografía, no se realizan reembolsos salvo falla técnica comprobable del sistema que impida la generación completa.`,
          },
          {
            titulo: "7. Confidencialidad de datos",
            contenido: `Los datos ingresados (tema, objetivos, bibliografía) se usan exclusivamente para generar el documento solicitado. No se comparten con terceros. Los datos se almacenan en sesión mientras el servidor esté activo (sistema in-memory); para persistencia configurada, aplica la política de privacidad de la base de datos conectada.`,
          },
          {
            titulo: "8. Modificaciones",
            contenido: `Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigor al publicarse en esta página. El uso continuado del Servicio implica aceptación de los términos actualizados.`,
          },
          {
            titulo: "9. Contacto",
            contenido: `Para consultas sobre estos términos, contáctenos a través del administrador del sistema.`,
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
