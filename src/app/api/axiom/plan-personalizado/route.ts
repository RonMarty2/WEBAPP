import { NextRequest, NextResponse } from "next/server";
import { axiomDB } from "@/lib/axiom/db";
import { axiomPDF } from "@/lib/axiom/pdf-builder";
import type { PlanPersonalizado } from "@/lib/axiom/types";

interface DiaPlan {
  dia: number;
  tema: string;
  tiempo_minutos: number;
  ejercicios: number;
  descripcion: string;
}

interface PlanPersonalizadoInternal extends PlanPersonalizado {
  dias: DiaPlan[];
  pdf_url?: string;
}

interface CreatePlanRequest {
  simuladorId: string;
  usuarioId?: string;
}

interface CreatePlanResponse {
  plan: PlanPersonalizadoInternal;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: CreatePlanRequest = await req.json();
    const { simuladorId, usuarioId } = body;

    if (!simuladorId) {
      return NextResponse.json(
        { error: "simuladorId is required" },
        { status: 400 }
      );
    }

    const simulador = await axiomDB.getSimuladorById(simuladorId);
    if (!simulador) {
      return NextResponse.json(
        { error: "Simulador not found" },
        { status: 404 }
      );
    }

    const desglose = simulador.desglose || {};
    const areaDébilEntry = Object.entries(desglose).sort(
      ([, a], [, b]) => (a as number) - (b as number)
    )[0];
    const areaDébil = areaDébilEntry ? (areaDébilEntry[0] as string) : "Matemáticas";

    const dias: DiaPlan[] = [
      {
        dia: 1,
        tema: `${areaDébil} básico`,
        tiempo_minutos: 30,
        ejercicios: 10,
        descripcion: "Conceptos fundamentales",
      },
      {
        dia: 2,
        tema: `${areaDébil} intermedio`,
        tiempo_minutos: 40,
        ejercicios: 8,
        descripcion: "Problemas más complejos",
      },
      {
        dia: 3,
        tema: `${areaDébil} avanzado`,
        tiempo_minutos: 50,
        ejercicios: 6,
        descripcion: "Ejercicios de examen",
      },
    ];

    const plan: PlanPersonalizadoInternal = {
      id: `plan-${Date.now()}`,
      simulador_id: simuladorId,
      usuario_id: usuarioId || "demo-user",
      area_debil: areaDébil,
      dias: dias,
      generado: new Date().toISOString(),
    };

    try {
      const pdfBuffer = axiomPDF.generatePlanPDF(plan);
      const pdfUrl = await axiomPDF.savePlanToStorage(pdfBuffer, plan.id);
      plan.pdf_url = pdfUrl;
    } catch (pdfError) {
      console.warn("PDF generation failed, continuing without PDF:", pdfError);
    }

    const savedPlan = await axiomDB.createPlan(plan);

    const response: CreatePlanResponse = { plan: savedPlan as PlanPersonalizadoInternal };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
