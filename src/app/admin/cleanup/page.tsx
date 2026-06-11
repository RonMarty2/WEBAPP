"use client";

import { useState } from "react";

type StepResult = {
  step: string;
  ok?: boolean;
  error?: string;
  [k: string]: unknown;
};

type CleanupReport = {
  startedAt: string;
  finishedAt?: string;
  steps?: StepResult[];
  errors?: StepResult[];
  summary?: {
    totalSteps: number;
    totalErrors: number;
    success: boolean;
  };
  error?: string;
};

type HealthSnapshot = {
  data?: {
    usersCount: number | string;
    projectsCount: number | string;
    allUsers?: Array<{ id: string; email: string; role?: string }>;
    allProjects?: Array<{
      id: string;
      user_id: string;
      titulo: string | null;
      tipo: string | null;
      phases_with_content?: number;
      total_chars?: number;
    }>;
  };
};

export default function CleanupPage() {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<CleanupReport | null>(null);
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runCleanup = async () => {
    setRunning(true);
    setReport(null);
    setHealth(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/seed-cleanup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "yes-cleanup-prod-supabase" }),
      });
      const json: CleanupReport = await res.json();
      setReport(json);

      if (res.status === 401) {
        setErrorMsg(
          "Tu sesión no tiene permisos de admin. Cierra sesión y vuelve a entrar como admin.",
        );
      }

      // Después del cleanup, refrescar el estado para ver cómo quedó
      try {
        const hRes = await fetch("/api/health?detail=full", { credentials: "include" });
        const hJson: HealthSnapshot = await hRes.json();
        setHealth(hJson);
      } catch {
        // Silencioso — si /api/health falla no es bloqueante
      }
    } catch (e) {
      setErrorMsg(`Error de red: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  const refreshHealth = async () => {
    setHealth(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/health?detail=full", { credentials: "include" });
      const json: HealthSnapshot = await res.json();
      setHealth(json);
    } catch (e) {
      setErrorMsg(`Error consultando estado: ${(e as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cleanup de Supabase
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Reasigna los 2 proyectos buenos a{" "}
            <strong>ronaldmartinezjimenes@gmail.com</strong> (admin), degrada{" "}
            <strong>rnd261190@gmail.com</strong> a estudiante y borra los 7
            proyectos huérfanos.
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-8">
          <button
            type="button"
            onClick={runCleanup}
            disabled={running}
            className={`w-full py-6 text-xl font-bold rounded-lg transition ${
              running
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white shadow-lg"
            }`}
          >
            {running ? "Ejecutando cleanup..." : "EJECUTAR CLEANUP AHORA"}
          </button>

          <button
            type="button"
            onClick={refreshHealth}
            className="mt-4 w-full py-3 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Refrescar estado actual (sin ejecutar nada)
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 font-medium">{errorMsg}</p>
          </div>
        )}

        {report && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Resultado del cleanup
            </h2>
            {report.summary && (
              <div
                className={`p-4 rounded-lg mb-4 ${
                  report.summary.success
                    ? "bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                    : "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"
                }`}
              >
                <p className="font-bold text-lg">
                  {report.summary.success ? "EXITOSO" : "CON ERRORES PARCIALES"}
                </p>
                <p className="text-sm mt-1">
                  {report.summary.totalSteps} pasos completados,{" "}
                  {report.summary.totalErrors} errores
                </p>
              </div>
            )}

            {report.steps && report.steps.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Pasos ejecutados
                </h3>
                <ul className="space-y-2">
                  {report.steps.map((s, i) => {
                    const ok = s.ok !== false; // si no viene "ok", asumimos true
                    return (
                      <li
                        key={i}
                        className={`flex items-start gap-2 text-sm p-2 rounded ${
                          ok
                            ? "bg-gray-50 dark:bg-gray-700/50"
                            : "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"
                        }`}
                      >
                        <span
                          className={`font-bold shrink-0 ${
                            ok
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {ok ? "OK" : "FAIL"}
                        </span>
                        <span className="text-gray-800 dark:text-gray-200 break-all">
                          <strong>{s.step}</strong>:{" "}
                          {s.projectId ? `proyecto ${s.projectId}` : ""}{" "}
                          {s.titulo ? `(${String(s.titulo).slice(0, 80)}...)` : ""}{" "}
                          {s.source ? `[${s.source}]` : ""}{" "}
                          {s.adminId ? `→ ${s.adminId}` : ""}{" "}
                          {s.note ? `· ${s.note}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {report.errors && report.errors.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                  Errores
                </h3>
                <ul className="space-y-2">
                  {report.errors.map((e, i) => (
                    <li
                      key={i}
                      className="text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded text-red-800 dark:text-red-200"
                    >
                      <strong>{e.step}</strong>:{" "}
                      {e.projectId ? `${e.projectId} — ` : ""}
                      {e.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {report.error}
                </p>
              </div>
            )}
          </div>
        )}

        {health?.data && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Estado actual de la base de datos
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  Usuarios
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {String(health.data.usersCount)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded">
                <p className="text-purple-700 dark:text-purple-300 font-medium">
                  Proyectos
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {String(health.data.projectsCount)}
                </p>
              </div>
            </div>

            {health.data.allUsers && health.data.allUsers.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Usuarios
                </h3>
                <ul className="space-y-1 text-sm">
                  {health.data.allUsers.map((u) => (
                    <li
                      key={u.id}
                      className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded flex justify-between"
                    >
                      <span className="text-gray-800 dark:text-gray-200">
                        {u.email}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
                            : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                        }`}
                      >
                        {u.role ?? "(sin rol)"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {health.data.allProjects && health.data.allProjects.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Proyectos ({health.data.allProjects.length})
                </h3>
                <ul className="space-y-2 text-sm">
                  {health.data.allProjects.map((p) => (
                    <li
                      key={p.id}
                      className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded"
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <strong className="text-gray-900 dark:text-white">
                          {p.titulo ?? "(sin título)"}
                        </strong>
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded shrink-0">
                          {p.tipo}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                        user_id: <code>{p.user_id || "(huérfano)"}</code> ·{" "}
                        {p.phases_with_content ?? 0} fases ·{" "}
                        {p.total_chars?.toLocaleString() ?? 0} chars
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
