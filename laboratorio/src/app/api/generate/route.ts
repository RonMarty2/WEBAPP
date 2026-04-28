import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tema } = await req.json();

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
            content: "Actúa como un experto en metodología de investigación para Bolivia."
          },
          {
            role: "user",
            content: `Genera 3 títulos de proyectos de grado para el tema: "${tema}"`
          }
        ]
      })
    });

    const data = await response.json();

    // AQUÍ ESTÁ LA MAGIA: Si Groq falla, mostramos su excusa exacta
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Detalle del proveedor: ${data.error?.message || "Rechazo desconocido"}` 
      }, { status: 500 });
    }

    return NextResponse.json({ text: data.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: `Fallo del sistema: ${error.message}` }, { status: 500 });
  }
}