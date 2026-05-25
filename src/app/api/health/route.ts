/**
 * GET /api/health
 *
 * Diagnóstico rápido del estado del backend en producción.
 * Devuelve:
 *   - backend usado (supabase / local in-memory)
 *   - presencia de variables de entorno clave (sin exponer valores)
 *   - conteos de usuarios y proyectos
 *   - si existe el usuario consultado (?email=...)
 *
 * NO expone secretos. Solo flags booleanos y conteos.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  dbBackend,
  dbListAllProyectos,
  dbListProyectos,
  dbListUsers,
} from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const emailQuery = url.searchParams.get("email")?.toLowerCase().trim() ?? null;

  const backend = dbBackend();
  const supabaseConfigured = isSupabaseConfigured();

  // Variables de entorno: solo flag de presencia, no el valor
  const envFlags = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    GROQ_API_KEY: Boolean(process.env.GROQ_API_KEY),
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    MOCK_AI: process.env.MOCK_AI ?? null,
    JWT_SECRET: Boolean(process.env.JWT_SECRET),
    GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
  };

  // Pista del URL de Supabase (primeros caracteres) para verificar dominio sin exponer key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseUrlHint = supabaseUrl
    ? supabaseUrl.replace(/^(https?:\/\/[^.]{4})[^.]*/, "$1***")
    : null;

  let usersCount: number | string = "unknown";
  let projectsCount: number | string = "unknown";
  let userFound: { exists: boolean; projectCount: number } | null = null;

  try {
    const users = await dbListUsers();
    usersCount = users.length;

    if (emailQuery) {
      const user = users.find((u) => u.email?.toLowerCase() === emailQuery);
      if (user) {
        const userProjects = await dbListProyectos(user.id);
        userFound = { exists: true, projectCount: userProjects.length };
      } else {
        userFound = { exists: false, projectCount: 0 };
      }
    }
  } catch (e) {
    usersCount = `error: ${(e as Error).message}`;
  }

  try {
    const projects = await dbListAllProyectos();
    projectsCount = projects.length;
  } catch (e) {
    projectsCount = `error: ${(e as Error).message}`;
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    deployment: process.env.VERCEL_ENV ?? "local",
    region: process.env.VERCEL_REGION ?? null,
    backend,
    supabaseConfigured,
    supabaseUrlHint,
    envFlags,
    data: {
      usersCount,
      projectsCount,
      userFound,
    },
    note: "Si backend = 'local' los datos NO persisten entre cold starts ni deploys. Conectar Supabase resuelve esto.",
  });
}
