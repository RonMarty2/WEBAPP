import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { dbGetAggregateStats } from "@/lib/db";

// GET /api/admin/estadisticas
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const stats = dbGetAggregateStats();
  return NextResponse.json(stats);
}
