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
          {
            role: "system",
            content: `Eres un coordinador académico riguroso de posgrado en Bolivia evaluando perfiles de tesis. 
            Tu tarea es generar 3 propuestas de títulos de investigación estrictamente basadas en la relación entre el programa académico del estudiante, las materias que cursó y su área de interés.
            
            Reglas estrictas para los títulos:
            1. Máximo 20 palabras por título.
            2. Deben ser sugerentes, estilizados y formales.
            3. Deben mostrar clara aplicación de los módulos cursados al área de interés.
            
            Formato de salida:
            Presenta solo los 3 títulos numerados, y debajo de cada uno, explica en una breve oración de 2 líneas por qué ese título justifica el uso de los módulos cursados.`
          },
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