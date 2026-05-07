import type { PlanPersonalizado } from "./types";

export const axiomPDF = {
  generatePlanPDF(plan: PlanPersonalizado): Buffer {
    const content = `
═══════════════════════════════════════
PLAN PERSONALIZADO DE PREPARACIÓN
Axiom - Simulador UMSS
═══════════════════════════════════════

Área de enfoque: ${plan.area_debil}

RUTINA DE PREPARACIÓN:
${plan.dias
  .map(
    (dia) => `
Día ${dia.dia}: ${dia.tema}
- Tiempo: ${dia.tiempo_minutos} minutos
- Ejercicios: ${dia.ejercicios}
- Descripción: ${dia.descripcion}
  `
  )
  .join("\n")}

═══════════════════════════════════════
Generado en: Axiom
Acceder a más planes: https://axiom.edu.bo
QR WhatsApp: [QR_PLACEHOLDER]

Confidencial - Usuario: ${plan.usuario_id}
═══════════════════════════════════════
    `;

    return Buffer.from(content, "utf-8");
  },

  async savePlanToStorage(
    buffer: Buffer,
    planId: string
  ): Promise<string> {
    // TODO: Upload to S3 or similar
    return `https://axiom.s3.../plans/${planId}.pdf`;
  },
};
