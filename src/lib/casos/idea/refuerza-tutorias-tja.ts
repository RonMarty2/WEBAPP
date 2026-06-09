import type { CasoIdea } from "../types";

/**
 * Caso 5 — Tutorías virtuales grupales para colegio fiscal en Tarija.
 *
 * **Dificultad intermedia.** Caso EdTech low-cost que muestra:
 *   - Cómo bajar el costo unitario sin destruir calidad (grupales).
 *   - El reto del compromiso/asistencia en familias NSE medio-bajo.
 *   - El uso de WhatsApp + Zoom como pila tecnológica gratis.
 *
 * Útil porque ilustra el patrón "vendí barato pero gasté en retención".
 */

export const casoRefuerzaTutoriasTja: CasoIdea = {
  slug: "refuerza-tutorias-tja",
  modulo: "idea",
  titulo: "Refuerza",
  tagline: "Tutorías virtuales grupales de Bs 15/hora para estudiantes de colegio fiscal en Tarija.",
  zona: "Distrito 5 y 7, Tarija",
  rubro: "Educación / EdTech",
  dificultad: "intermedio",
  emoji: "📚",
  emprendedor: {
    nombre: "Patricia Ovando",
    edad: 26,
    rol: "Licenciada en Educación con mención en Matemática (UAJMS, 2024). Trabaja medio tiempo en un instituto privado. Quiere atender al estudiante de colegio fiscal que su instituto no atiende.",
  },
  contexto: [
    "Patricia daba clases de refuerzo en un instituto privado donde la hora costaba Bs 35-50. La mayoría de sus alumnos venían de colegios privados. En su barrio (Distrito 7), las mamás de colegio fiscal le pedían 'darle apoyo a mi hijo' pero al escuchar el precio, retrocedían.",
    "Hizo cuentas: una mamá con ingreso Bs 2.500/mes no puede pagar Bs 50 por hora 2 veces por semana (Bs 400/mes). Es el 16% de su ingreso. Pero podría pagar Bs 15/hora 2 veces por semana (Bs 120/mes), 4.8% de su ingreso. El reto: hacer la economía cerrar para Patricia con Bs 15.",
    "La clave fue el modelo grupal: 6 estudiantes por sesión vía Zoom = Bs 90 por hora de Patricia, no Bs 15. Patricia decidió validar en pequeño con 2 grupos durante 1 mes antes de promocionar más.",
  ],
  problema: "Padres NSE medio-bajo en Tarija necesitan refuerzo escolar para sus hijos pero no pueden pagar tutorías individuales de Bs 35-50/hora; los colegios fiscales no ofrecen apoyo personalizado.",
  segmento: "Padres con hijos de 10-16 años en colegios fiscales del Distrito 5/7 de Tarija, NSE C, ingreso familiar Bs 2.500-5.000/mes.",
  lean_canvas: {
    problema: [
      "Tutorías individuales cuestan Bs 35-50/hora = inaccesible para colegio fiscal.",
      "Profesores del colegio no tienen tiempo de dar atención individual a 35 estudiantes por curso.",
      "YouTube tiene contenido pero el niño se distrae y nadie verifica que entendió.",
      "Las mamás trabajan y no pueden ayudar con tareas a la tarde.",
    ],
    segmento: "Padres con hijo de 10-16 años en colegio fiscal, mamá trabaja, padre opcional, valoran educación como ascenso social.",
    propuesta_unica: "Tutorías por Zoom en grupos pequeños (máximo 6) a Bs 15/hora — un tercio del precio individual. Patricia da seguimiento personal por WhatsApp a cada estudiante.",
    solucion: [
      "Grupos de 6 estudiantes por nivel y materia (matemática, lenguaje, naturales).",
      "2 sesiones por semana de 60 minutos vía Zoom.",
      "WhatsApp grupal para tareas y dudas entre sesiones.",
      "Mini-evaluación quincenal con reporte para los padres.",
    ],
    canales: [
      "WhatsApp en juntas de padres (las mamás se conocen y refieren).",
      "Cartelera del colegio si la dirección lo permite.",
      "Voz a voz por barrio (mamá habla con vecina).",
    ],
    flujo_ingresos: [
      "Cuota mensual Bs 120 por estudiante (2 sesiones/semana × 4 semanas).",
      "Paquete familiar (2 hermanos) Bs 220.",
      "Intensivo de exámenes (2 semanas) Bs 80.",
      "Cobranza primer lunes de cada mes vía depósito banco.",
    ],
    estructura_costos: [
      "Tiempo de Patricia: Bs 90/hora valorizado.",
      "Plataforma Zoom Pro: Bs 110/mes.",
      "Material didáctico digital (PDF/quizzes): Bs 50/mes.",
      "Costos fijos totales: Bs 160/mes + tiempo.",
      "Punto de equilibrio: 12 estudiantes pagando Bs 120 = Bs 1.440 ingresos vs Bs 720 tiempo + Bs 160 fijos.",
    ],
    metricas_clave: [
      "Estudiantes activos por grupo (mantener ≥4 para que sea rentable).",
      "Tasa de asistencia (la gran amenaza — si baja del 70% el padre cancela).",
      "Tasa de renovación mensual (>75% indica producto sólido).",
      "Mejora académica reportada por padres en encuesta trimestral.",
    ],
    ventaja_competitiva: "Patricia conoce los planes de estudio fiscales (vino del sistema fiscal). Un profesor de colegio privado no sabe qué tema da cuarto medio fiscal en agosto. Esa adaptación es invisible pero crítica.",
  },
  propuesta_valor: {
    trabajos_cliente: [
      "Que su hijo no se atrase ni reprueba.",
      "Que su hijo entienda y le guste estudiar (no solo apruebe).",
      "Que él (el padre) no tenga que hacer las tareas con el hijo.",
    ],
    dolores: [
      "No puede pagar Bs 400/mes por tutoría individual.",
      "No tiene tiempo de revisar tareas a la noche.",
      "Hijo mete cabeza en celular y nadie verifica si estudia.",
      "Si reprueba materia, repite el año (estigma social y costo).",
    ],
    ganancias: [
      "Hijo mejora notas sin necesidad de presión constante.",
      "Padre 'cumple' su rol de cuidar la educación.",
      "Hijo desarrolla disciplina de estudio.",
      "Hijo conoce amigos del grupo (efecto social positivo).",
    ],
    productos: [
      "8 sesiones grupales por mes vía Zoom.",
      "Seguimiento por WhatsApp.",
      "Reporte mensual para los padres.",
    ],
    aliviadores: [
      "Bs 15/hora = 1/3 del precio individual.",
      "Online = sin transporte ni inseguridad nocturna.",
      "Reporte para los padres = saben que el dinero rinde.",
      "Patricia conoce el currículo fiscal = el contenido encaja con el colegio.",
    ],
    creadores: [
      "Pequeño grupo de 6 = el hijo se siente parte, no solo escucha.",
      "Patricia conoce sus nombres y dificultades = motivación adicional.",
      "Mejora visible en libreta = padres orgullosos y referidores.",
    ],
  },
  validacion: {
    hipotesis: [
      {
        hipotesis: "Las mamás del barrio pagarían Bs 120/mes por refuerzo grupal online.",
        experimento: "Patricia ofrece 2 sesiones de prueba gratis en agosto. Pide compromiso de cuota si gusta.",
        metrica: "≥12 inscripciones pagadas al final del periodo de prueba.",
        resultado_esperado: "Si <8, hay que ajustar precio o paquetería.",
      },
      {
        hipotesis: "La asistencia se mantiene arriba del 70% si Patricia recuerda por WhatsApp 1 hora antes.",
        experimento: "Patricia manda recordatorio 60 min antes a cada padre. Mide asistencia durante 4 semanas.",
        metrica: "Asistencia promedio ≥70%.",
        resultado_esperado: "Si <60%, hay que cambiar estructura (sesiones más cortas, horario diferente).",
      },
      {
        hipotesis: "Los padres renuevan si ven una mejora aunque sea modesta.",
        experimento: "Encuesta a los 30 días: '¿notas mejora?'. Comparar con renovación.",
        metrica: "≥75% de los que reportan mejora renuevan.",
        resultado_esperado: "Si renovación <60%, el problema no es percepción sino realidad.",
      },
    ],
    resultado: "Hipótesis 1 VERDADERA: 14 inscripciones pagadas. Hipótesis 2 PARCIALMENTE FALSA: asistencia promedio 62% (no 70%). El recordatorio ayudó pero los lunes a las 19:00 muchos estudiantes ya estaban cansados o tenían otra actividad. Patricia movió a sábado 9:00 AM y subió a 78%. Hipótesis 3 VERDADERA: 82% renovaron el mes 2.",
  },
  scorecard: {
    deseabilidad: 4,
    factibilidad: 4,
    viabilidad: 3,
    nota: "Deseabilidad alta (resuelve dolor real). Factibilidad alta (Patricia tiene tiempo + skills). Viabilidad media: el margen por estudiante es bajo, depende 100% de mantener grupos llenos (6/6). Si un grupo cae a 3 estudiantes, ya no es rentable; hay que mantener disciplina de canalizar a otros grupos.",
  },
  conclusion: "Idea **viable con cuello operativo**. El producto funciona y los padres pagan. El reto es operacional: mantener la asistencia y el llenado de grupos. Patricia con 4 grupos de 6 (24 estudiantes) factura Bs 2.880/mes con costo Bs 400 + 8 horas/semana de tiempo. Bs 2.480 neto trabajando part-time es excelente para Tarija. Crecimiento depende de contratar otra profe (no escalar ella sola).",
  lecciones: [
    "Precio bajo + volumen agrupado puede ser igual o más rentable que precio alto + clientes individuales.",
    "El horario de los niños no es opinable: si los lunes 19:00 no funciona, no insistas — muévelo.",
    "Recordatorios WhatsApp son el motor de retención más barato y efectivo en EdTech low-cost.",
    "El reporte mensual a los padres es la herramienta de retención clave: lo que el padre VE es lo que el padre paga.",
    "Para escalar EdTech grupal hay que contratar profes, no estirar al fundador — el cuello es el tiempo.",
  ],
  errores_evitados: [
    "No alquilar local físico para tutorías — destruye la propuesta de precio low-cost.",
    "No mezclar niveles (10 años con 16 años) — la dinámica se rompe.",
    "No usar plataforma que la mamá no entienda (Zoom es estándar, no inventes algo nuevo).",
    "No prometer 'subir 30 puntos en un mes' — promesa irreal mata la confianza al primer mes.",
    "No cobrar contra resultado — el negocio no aguanta el cashflow.",
  ],
  tags: ["educacion", "EdTech", "low-cost", "B2C", "Tarija", "grupal", "Zoom"],
};
