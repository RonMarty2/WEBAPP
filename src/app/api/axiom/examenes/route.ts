import { NextResponse } from "next/server";

interface Examen {
  id: string;
  fecha: string;
  area: string;
  cantidad_preguntas: number;
  resuelto: boolean;
}

interface ExamenesResponse {
  examenes: Examen[];
}

export async function GET(): Promise<NextResponse<ExamenesResponse>> {
  const examenes: Examen[] = [
    {
      id: "exam-2025-01",
      fecha: "2025-01-15",
      area: "Todas",
      cantidad_preguntas: 100,
      resuelto: true,
    },
    {
      id: "exam-2024-12",
      fecha: "2024-12-10",
      area: "Todas",
      cantidad_preguntas: 100,
      resuelto: true,
    },
    {
      id: "exam-2024-11",
      fecha: "2024-11-20",
      area: "Todas",
      cantidad_preguntas: 100,
      resuelto: true,
    },
  ];

  return NextResponse.json({ examenes });
}
