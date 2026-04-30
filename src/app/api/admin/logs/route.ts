import { NextResponse } from "next/server";
import { getErrorLogs, errorLogsStore, type ErrorLogEntry } from "@/lib/memoryStore";

// GET /api/admin/logs?nivel=critical|warning|info&limit=50
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nivel = searchParams.get("nivel") as ErrorLogEntry["nivel"] | null;
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  const logs = getErrorLogs(nivel ?? undefined, limit);
  return NextResponse.json({
    total: errorLogsStore.length,
    retornados: logs.length,
    logs,
  });
}

// DELETE /api/admin/logs — limpiar logs
export async function DELETE() {
  errorLogsStore.splice(0, errorLogsStore.length);
  return NextResponse.json({ cleared: true });
}
