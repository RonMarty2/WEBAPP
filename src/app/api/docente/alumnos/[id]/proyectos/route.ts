/**
 * GET /api/docente/alumnos/[id]/proyectos
 *
 * Devuelve un agregado de TODOS los proyectos del alumno, agrupados por
 * módulo (idea, mercados, estrategia, marketing, organización, defensa,
 * proyecto maestro). Es la columna vertebral de la Wave 2 del panel
 * docente: "ver qué tiene mi alumno en cada módulo".
 *
 * Seguridad: solo accesible al docente DUEÑO del vínculo. Si otro docente
 * intenta consultar este `id`, recibe 404 (mismo error que si el vínculo
 * no existe, para no filtrar información).
 *
 * [id] es el id del vínculo `docente_alumno_vinculos.id` (NO el alumno_id),
 * para que la verificación de propiedad sea una sola query.
 *
 * FINANZAS — bridge por email (sesión 12): Finanzas usa Supabase Auth con
 * id UUID, los demás módulos usan el TEXT del JWT propio. El puente es el
 * EMAIL: `finanzas_perfiles.email` es UNIQUE NOT NULL y el vínculo guarda
 * `alumno_email` como snapshot. Buscamos el perfil de Finanzas por email
 * y con su UUID consultamos `finanzas_proyectos`. Si el alumno usó otro
 * correo en Finanzas, no matchea y devolvemos sin_finanzas=true (la UI
 * mantiene el aviso ámbar).
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);

interface ProyectoResumen {
  id: string;
  titulo: string;
  estado: string | null;
  actualizado_en: string | null;
  ruta: string; // a dónde llevaría al alumno (informativo; el docente NO entra a la UI del alumno)
}

interface ModuloResumen {
  modulo: string;
  nombre: string;
  emoji: string;
  ruta: string; // ruta del módulo (informativa)
  proyectos: ProyectoResumen[];
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    if (!ROLES_PERMITIDOS.has(user.role)) {
      return NextResponse.json({ error: "Solo docentes" }, { status: 403 });
    }
    const { id: vinculoId } = await params;
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // 1) Verifica propiedad del vínculo. Si no es del docente logueado,
    //    o no existe, devuelve 404 (no se filtra la diferencia).
    const { data: vinculo } = await sb
      .from("docente_alumno_vinculos")
      .select("id, alumno_id, alumno_nombre, alumno_email, alumno_universidad, codigo_usado, vinculado_en, nota_docente, archivado")
      .eq("id", vinculoId)
      .eq("docente_id", user.id)
      .maybeSingle();

    if (!vinculo) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    const alumnoId = vinculo.alumno_id as string;

    // 2) Trae en paralelo los proyectos de cada módulo. Cada query es
    //    independiente: si una tabla no existe (migración faltante) la
    //    capturamos en su catch y devolvemos arreglo vacío para ese
    //    módulo, sin tirar abajo toda la respuesta.
    const select = "id, titulo, estado, actualizado_en";

    async function tabla(t: string): Promise<Array<Record<string, string | null>>> {
      try {
        const { data, error } = await sb
          .from(t)
          .select(select)
          .eq("estudiante_id", alumnoId)
          .order("actualizado_en", { ascending: false });
        if (error) return [];
        return (data ?? []) as Array<Record<string, string | null>>;
      } catch {
        return [];
      }
    }

    // El maestro usa nombres distintos (sin estado, sin actualizado_en
    // tan limpio; reusa creado_en como fallback).
    async function tablaMaestro(): Promise<Array<Record<string, string | null>>> {
      try {
        const { data, error } = await sb
          .from("proyecto_maestro")
          .select("id, titulo, sector, actualizado_en")
          .eq("estudiante_id", alumnoId)
          .order("actualizado_en", { ascending: false });
        if (error) return [];
        // Mapeamos para tener una "estado" sintética (el sector da contexto).
        return ((data ?? []) as Array<{ id: string; titulo: string; sector: string | null; actualizado_en: string }>).map(
          (m) => ({
            id: m.id,
            titulo: m.titulo,
            estado: m.sector,
            actualizado_en: m.actualizado_en,
          }),
        );
      } catch {
        return [];
      }
    }

    // Finanzas: bridge por email. finanzas_proyectos usa `nombre` (no
    // `titulo`) y estudiante_id UUID de finanzas_perfiles.
    async function tablaFinanzas(): Promise<{ rows: Array<Record<string, string | null>>; sinPerfil: boolean }> {
      try {
        const email = (vinculo.alumno_email as string | null)?.trim().toLowerCase();
        if (!email) return { rows: [], sinPerfil: true };
        const { data: perfil } = await sb
          .from("finanzas_perfiles")
          .select("id")
          .ilike("email", email)
          .maybeSingle();
        if (!perfil?.id) return { rows: [], sinPerfil: true };
        const { data, error } = await sb
          .from("finanzas_proyectos")
          .select("id, nombre, estado, actualizado_en")
          .eq("estudiante_id", perfil.id)
          .order("actualizado_en", { ascending: false });
        if (error) return { rows: [], sinPerfil: false };
        return {
          rows: ((data ?? []) as Array<{ id: string; nombre: string; estado: string | null; actualizado_en: string | null }>).map((p) => ({
            id: p.id,
            titulo: p.nombre,
            estado: p.estado,
            actualizado_en: p.actualizado_en,
          })),
          sinPerfil: false,
        };
      } catch {
        return { rows: [], sinPerfil: true };
      }
    }

    const [idea, mercados, estrategia, marketing, organizacion, defensa, maestro, finanzas] = await Promise.all([
      tabla("idea_proyectos"),
      tabla("mercados_proyectos"),
      tabla("estrategia_proyectos"),
      tabla("marketing_planes"),
      tabla("organizacion_proyectos"),
      tabla("defensa_proyectos"),
      tablaMaestro(),
      tablaFinanzas(),
    ]);

    function pack(modulo: string, nombre: string, emoji: string, ruta: string, rows: Array<Record<string, string | null>>): ModuloResumen {
      return {
        modulo,
        nombre,
        emoji,
        ruta,
        proyectos: rows.map((r) => ({
          id: String(r.id),
          titulo: String(r.titulo ?? "(sin título)"),
          estado: r.estado != null ? String(r.estado) : null,
          actualizado_en: r.actualizado_en != null ? String(r.actualizado_en) : null,
          ruta,
        })),
      };
    }

    const modulos: ModuloResumen[] = [
      pack("idea",         "Idea / Pre-validación", "💡", "/idea/proyectos", idea),
      pack("mercados",     "Mercados",              "📊", "/mercados/proyecto", mercados),
      pack("estrategia",   "Estrategia",            "🎯", "/estrategia/analisis", estrategia),
      pack("marketing",    "Marketing",             "📣", "/marketing/planes", marketing),
      pack("organizacion", "Organización",          "🏢", "/organizacion/proyectos", organizacion),
      pack("finanzas",     "Finanzas (simulador)",  "💰", "/finanzas", finanzas.rows),
      pack("defensa",      "Defensa",               "🎓", "/defensa/proyectos", defensa),
      pack("generador",    "Proyecto Maestro / Generador", "✨", "/generador", maestro),
    ];

    const totalProyectos = modulos.reduce((s, m) => s + m.proyectos.length, 0);

    // Lee el consentimiento del alumno para ESTE docente. La UI muestra
    // "solo metadatos" hasta que el alumno active el toggle. Antes el
    // toggle era 100% cosmético: NUNCA se leía en backend. Ahora se
    // expone el flag para que el frontend confirme la promesa.
    let consentimientoVerContenido = false;
    try {
      const { data: cons } = await sb
        .from("docente_consentimientos")
        .select("permitir_ver_contenido")
        .eq("alumno_id", alumnoId)
        .eq("docente_id", user.id)
        .maybeSingle();
      consentimientoVerContenido = !!cons?.permitir_ver_contenido;
    } catch {
      // tabla no existe (migración pendiente) → tratamos como false
    }

    return NextResponse.json({
      alumno: {
        vinculo_id: vinculo.id,
        alumno_id: alumnoId,
        nombre: vinculo.alumno_nombre,
        email: vinculo.alumno_email,
        universidad: vinculo.alumno_universidad,
        codigo_usado: vinculo.codigo_usado,
        vinculado_en: vinculo.vinculado_en,
        nota_docente: vinculo.nota_docente,
        archivado: vinculo.archivado,
      },
      total_proyectos: totalProyectos,
      modulos,
      // El alumno permite ver contenido completo (no solo metadatos).
      // Wave 4 expondrá el contenido real condicional a este flag.
      consentimiento_ver_contenido: consentimientoVerContenido,
      // true SOLO si no se encontró perfil de Finanzas con el email del
      // alumno (usó otro correo o nunca entró al simulador). La UI
      // mantiene el aviso ámbar en ese caso.
      sin_finanzas: finanzas.sinPerfil,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
