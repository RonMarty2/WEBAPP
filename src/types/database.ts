// ============================================================
//  Laboratorio Académico SaaS — Tipos de Base de Datos V4.0
//  Uso: import type { Database } from "@/types/database";
//       import type { Tables } from "@/types/database";
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Tipos auxiliares de conveniencia ─────────────────────────

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// ── Tipos de dominio reutilizables ───────────────────────────

export type UserRol  = "admin" | "user";
export type UserPlan = "estandar" | "pro";
export type EstadoFase = 0 | 1 | 2 | 3 | 4 | 5;

// ── Schema completo ───────────────────────────────────────────

export interface Database {
  public: {
    Tables: {

      perfiles_audiencia: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      servicios: {
        Row: {
          id: string;
          audiencia_id: string;
          nombre: string;
          descripcion: string | null;
          activo: boolean;
          orden: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          audiencia_id: string;
          nombre: string;
          descripcion?: string | null;
          activo?: boolean;
          orden?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          audiencia_id?: string;
          nombre?: string;
          descripcion?: string | null;
          activo?: boolean;
          orden?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "servicios_audiencia_id_fkey";
            columns: ["audiencia_id"];
            isOneToOne: false;
            referencedRelation: "perfiles_audiencia";
            referencedColumns: ["id"];
          }
        ];
      };

      usuarios_y_creditos: {
        Row: {
          id: string;
          rol: UserRol;
          tipo_audiencia_id: string | null;
          plan: UserPlan | null;
          creditos_disponibles: number;
          activo: boolean;
          email: string | null;
          nombre: string | null;
          avatar_url: string | null;
          created_at: string;
          activated_at: string | null;
        };
        Insert: {
          id: string;
          rol?: UserRol;
          tipo_audiencia_id?: string | null;
          plan?: UserPlan | null;
          creditos_disponibles?: number;
          activo?: boolean;
          email?: string | null;
          nombre?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          activated_at?: string | null;
        };
        Update: {
          id?: string;
          rol?: UserRol;
          tipo_audiencia_id?: string | null;
          plan?: UserPlan | null;
          creditos_disponibles?: number;
          activo?: boolean;
          email?: string | null;
          nombre?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          activated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "usuarios_y_creditos_tipo_audiencia_id_fkey";
            columns: ["tipo_audiencia_id"];
            isOneToOne: false;
            referencedRelation: "perfiles_audiencia";
            referencedColumns: ["id"];
          }
        ];
      };

      prompts_maestros: {
        Row: {
          id: string;
          servicio_id: string;
          fase_numero: EstadoFase;
          nombre_fase: string | null;
          contenido_prompt: string;
          version: number;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          servicio_id: string;
          fase_numero: EstadoFase;
          nombre_fase?: string | null;
          contenido_prompt: string;
          version?: number;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          servicio_id?: string;
          fase_numero?: EstadoFase;
          nombre_fase?: string | null;
          contenido_prompt?: string;
          version?: number;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_maestros_servicio_id_fkey";
            columns: ["servicio_id"];
            isOneToOne: false;
            referencedRelation: "servicios";
            referencedColumns: ["id"];
          }
        ];
      };

      hilos_conductores: {
        Row: {
          id: string;
          servicio_id: string;
          regla_inmutable: string;
          descripcion: string | null;
          orden: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          servicio_id: string;
          regla_inmutable: string;
          descripcion?: string | null;
          orden?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          servicio_id?: string;
          regla_inmutable?: string;
          descripcion?: string | null;
          orden?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hilos_conductores_servicio_id_fkey";
            columns: ["servicio_id"];
            isOneToOne: false;
            referencedRelation: "servicios";
            referencedColumns: ["id"];
          }
        ];
      };

      proyectos_fases: {
        Row: {
          id: string;
          usuario_id: string;
          servicio_id: string;
          tema_aprobado: string | null;
          titulo_provisional: string | null;
          estado_fase: EstadoFase;
          completado: boolean;
          contenido_fase_0: string | null;
          contenido_fase_1: string | null;
          contenido_fase_2: string | null;
          contenido_fase_3: string | null;
          contenido_fase_4: string | null;
          contenido_fase_5: string | null;
          datos_fase_0: Json | null;
          datos_fase_1: Json | null;
          datos_fase_2: Json | null;
          datos_fase_3: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          servicio_id: string;
          tema_aprobado?: string | null;
          titulo_provisional?: string | null;
          estado_fase?: EstadoFase;
          completado?: boolean;
          contenido_fase_0?: string | null;
          contenido_fase_1?: string | null;
          contenido_fase_2?: string | null;
          contenido_fase_3?: string | null;
          contenido_fase_4?: string | null;
          contenido_fase_5?: string | null;
          datos_fase_0?: Json | null;
          datos_fase_1?: Json | null;
          datos_fase_2?: Json | null;
          datos_fase_3?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          servicio_id?: string;
          tema_aprobado?: string | null;
          titulo_provisional?: string | null;
          estado_fase?: EstadoFase;
          completado?: boolean;
          contenido_fase_0?: string | null;
          contenido_fase_1?: string | null;
          contenido_fase_2?: string | null;
          contenido_fase_3?: string | null;
          contenido_fase_4?: string | null;
          contenido_fase_5?: string | null;
          datos_fase_0?: Json | null;
          datos_fase_1?: Json | null;
          datos_fase_2?: Json | null;
          datos_fase_3?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "proyectos_fases_servicio_id_fkey";
            columns: ["servicio_id"];
            isOneToOne: false;
            referencedRelation: "servicios";
            referencedColumns: ["id"];
          }
        ];
      };

      auditoria_chats: {
        Row: {
          id: string;
          usuario_id: string;
          proyecto_id: string | null;
          fase_numero: number | null;
          servicio_id: string | null;
          mensaje_usuario: string;
          respuesta_ia: string | null;
          modelo_usado: string | null;
          tokens_usados: number | null;
          duracion_ms: number | null;
          fecha: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          proyecto_id?: string | null;
          fase_numero?: number | null;
          servicio_id?: string | null;
          mensaje_usuario: string;
          respuesta_ia?: string | null;
          modelo_usado?: string | null;
          tokens_usados?: number | null;
          duracion_ms?: number | null;
          fecha?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          proyecto_id?: string | null;
          fase_numero?: number | null;
          servicio_id?: string | null;
          mensaje_usuario?: string;
          respuesta_ia?: string | null;
          modelo_usado?: string | null;
          tokens_usados?: number | null;
          duracion_ms?: number | null;
          fecha?: string;
        };
        Relationships: [
          {
            foreignKeyName: "auditoria_chats_proyecto_id_fkey";
            columns: ["proyecto_id"];
            isOneToOne: false;
            referencedRelation: "proyectos_fases";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: Record<string, never>;

    Functions: {
      es_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };

    Enums: Record<string, never>;

    CompositeTypes: Record<string, never>;
  };
}

// ── Shortcuts de filas individuales ──────────────────────────

export type PerfilAudiencia = Tables<"perfiles_audiencia">;
export type Servicio        = Tables<"servicios">;
export type UsuarioCreditos = Tables<"usuarios_y_creditos">;
export type PromptMaestro   = Tables<"prompts_maestros">;
export type HiloConductor   = Tables<"hilos_conductores">;
export type ProyectoFases   = Tables<"proyectos_fases">;
export type AuditoriaChat   = Tables<"auditoria_chats">;

// ── Tipos enriquecidos ────────────────────────────────────────

export type ServicioConAudiencia = Servicio & {
  perfiles_audiencia: PerfilAudiencia;
};

export type UsuarioAdmin = UsuarioCreditos & {
  perfiles_audiencia: PerfilAudiencia | null;
};
