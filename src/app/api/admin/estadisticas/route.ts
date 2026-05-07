import { NextResponse } from "next/server";
import { dbGetAggregateStats } from "@/lib/db";

// GET /api/admin/estadisticas
export async function GET() {
  const stats = dbGetAggregateStats();
  return NextResponse.json(stats);
}
