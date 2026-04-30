/**
 * El Guardián
 *
 * Usa llama-3.1-8b-instant (modelo rápido/barato) como clasificador binario.
 * Evalúa si la petición del usuario es coherente con el tema aprobado del proyecto.
 * Retorna true (petición válida) o false (fuera de contexto).
 *
 * Si Groq no está disponible, retorna true (permisivo) para no bloquear al usuario.
 */

const GUARDIAN_SYSTEM = `Eres un guardián de coherencia académica.
Tu ÚNICA función es evaluar si la petición del usuario es coherente con su tema de investigación aprobado.
Responde ÚNICAMENTE con la palabra "true" o "false". Sin explicaciones, sin puntuación extra.
- true  → la petición está relacionada con el tema y es académicamente válida.
- false → la petición es irrelevante al tema, absurda, o fuera de lugar.`;

export interface GuardianResult {
  permitido: boolean;
  razon?: string;
}

export async function validarCoherencia(
  mensajeUsuario: string,
  temaAprobado: string
): Promise<GuardianResult> {
  const apiKey = process.env.GROQ_API_KEY;

  // Sin clave configurada: modo permisivo
  if (!apiKey) return { permitido: true, razon: "guardian_desactivado" };

  const userContent = `TEMA DEL PROYECTO: "${temaAprobado}"
PETICIÓN DEL USUARIO: "${mensajeUsuario}"
¿La petición es coherente con el tema? Responde solo true o false.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: GUARDIAN_SYSTEM },
          { role: "user", content: userContent },
        ],
        temperature: 0,
        max_tokens: 5,   // solo necesita "true" o "false"
      }),
    });

    if (!res.ok) return { permitido: true, razon: "guardian_error_api" };

    const data = await res.json();
    const respuesta = (data.choices?.[0]?.message?.content ?? "")
      .trim()
      .toLowerCase();

    const permitido = respuesta.startsWith("true");
    return { permitido, razon: permitido ? "coherente" : "fuera_de_tema" };
  } catch {
    return { permitido: true, razon: "guardian_excepcion" };
  }
}
