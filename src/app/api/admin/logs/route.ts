import { NextResponse } from "next/server";
import { dbGetErrorLogs } from "@/lib/db";
import { errorLogsStore, type ErrorLogEntry } from "@/lib/memoryStore";
import { requireAdmin, AuthError } from "@/lib/api-auth";

// GET /api/admin/logs?nivel=critical|warning|info&limit=50
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const nivel = searchParams.get("nivel") as ErrorLogEntry["nivel"] | null;
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const logs = await dbGetErrorLogs(nivel ?? undefined, limit);
    return NextResponse.json({
      total: errorLogsStore.length,
      retornados: logs.length,
      logs,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE /api/admin/logs — limpiar logs
export async function DELETE() {
  try {
    await requireAdmin();
    errorLogsStore.splice(0, errorLogsStore.length);
    return NextResponse.json({ cleared: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
