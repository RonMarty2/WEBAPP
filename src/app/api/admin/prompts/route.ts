import { NextResponse } from "next/server";
import { DEFAULT_PROMPTS } from "@/lib/data";

// In production, these would be stored in Supabase
// For now they're stored in memory (persisted via localStorage on the client for admin edits)
let promptsStore = { ...DEFAULT_PROMPTS };

export async function GET() {
  return NextResponse.json(Object.values(promptsStore));
}

export async function PUT(req: Request) {
  try {
    const { section_key, system_prompt, user_template, model_demo, model_standard, model_pro } = await req.json();

    if (!section_key || !promptsStore[section_key]) {
      return NextResponse.json({ error: "Sección no encontrada." }, { status: 404 });
    }

    promptsStore[section_key] = {
      ...promptsStore[section_key],
      system_prompt,
      user_template,
      model_demo,
      model_standard,
      model_pro,
    };

    return NextResponse.json({ success: true, prompt: promptsStore[section_key] });
  } catch {
    return NextResponse.json({ error: "Error al actualizar el prompt." }, { status: 500 });
  }
}
