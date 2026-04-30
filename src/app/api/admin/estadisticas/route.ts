import { NextResponse } from "next/server";
import { getAggregateStats } from "@/lib/memoryStore";

// GET /api/admin/estadisticas
export async function GET() {
  const stats = getAggregateStats();
  return NextResponse.json(stats);
}
