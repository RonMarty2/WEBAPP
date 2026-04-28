import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { programa, modulos, interes } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [
          
          // =========================================================================
          // ---> AQUÍ EMPIEZA EL PROMPT MAESTRO (INSTRUCCIONES DEL SISTEMA) <---
          // Puedes cambiar cualquier palabra de esta caja de 'content' cuando quieras.
          // =========================================================================
          {
            role: "system",
            content: `Eres un coordinador académico riguroso de posgrado evaluando perfiles de tesis. 
            Tu tarea es generar 3 propuestas de títulos de investigación relacionando el programa académico, las materias y el área de interés del estudiante.
            
            REGLAS ESTRICTAS DE TRANSFORMACIÓN (¡MUY IMPORTANTE!):
            1. Si el "Área de interés" es un pasatiempo, algo trivial (ej: videojuegos, cigarros, gatos) o poco académico, NO hagas un tema sobre el pasatiempo en sí. Debes anclar ese interés a las materias cursadas de forma profesional. (Ejemplo: Si le gustan los 'cigarros' y estudia 'Finanzas', el tema debe ser sobre el impacto impositivo o rentabilidad en la industria tabacalera).
            2. Si el "Área de interés" dice la palabra clave "SORPRENDEME" o está vacía, ignora el interés y actúa de forma creativa: inventa 3 temas altamente innovadores y viables basados ÚNICAMENTE en el programa y las materias cursadas.
            
            REGLAS DE FORMATO:
            1. Máximo 20 palabras por título.
            2. Deben ser sugerentes, estilizados y formales.
            3. Presenta solo los 3 títulos numerados.
            4. Debajo de cada uno, explica en 2 líneas cómo se aplica al mundo real y qué materias usaría.`
          },
          // =========================================================================
          // ---> AQUÍ TERMINA EL PROMPT MAESTRO <---
          // =========================================================================

          {
            role: "user",
            content: `Programa: ${programa}\nMódulos cursados: ${modulos}\nÁrea de interés: ${interes}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: `Detalle del proveedor: ${data.error?.message || "Rechazo desconocido"}` }, { status: 500 });
    }

    return NextResponse.json({ text: data.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: `Fallo del sistema: ${error.message}` }, { status: 500 });
  }
}