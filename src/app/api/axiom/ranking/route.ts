import { NextRequest, NextResponse } from "next/server";

// In-memory ranking store - in production, this would come from Supabase
const rankingStore: Array<{
  id: string;
  usuario_id: string;
  nombre: string;
  email: string;
  nota: number;
  fecha: string;
}> = [];

// Initialize with some demo data
function initializeDemoRanking() {
  if (rankingStore.length === 0) {
    rankingStore.push(
      {
        id: "rank-1",
        usuario_id: "user-1",
        nombre: "María González",
        email: "maria@example.com",
        nota: 92,
        fecha: new Date().toISOString(),
      },
      {
        id: "rank-2",
        usuario_id: "user-2",
        nombre: "Carlos López",
        email: "carlos@example.com",
        nota: 88,
        fecha: new Date().toISOString(),
      },
      {
        id: "rank-3",
        usuario_id: "user-3",
        nombre: "Ana Martínez",
        email: "ana@example.com",
        nota: 85,
        fecha: new Date().toISOString(),
      },
      {
        id: "rank-4",
        usuario_id: "user-4",
        nombre: "Roberto Díaz",
        email: "roberto@example.com",
        nota: 81,
        fecha: new Date().toISOString(),
      },
      {
        id: "rank-5",
        usuario_id: "user-5",
        nombre: "Laura Fernández",
        email: "laura@example.com",
        nota: 79,
        fecha: new Date().toISOString(),
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    initializeDemoRanking();

    // Sort by nota descending and get top 5
    const topRanking = rankingStore
      .sort((a, b) => b.nota - a.nota)
      .slice(0, 5)
      .map((item) => ({
        id: item.usuario_id,
        nombre: item.nombre,
        email: item.email,
        nota: item.nota,
      }));

    return NextResponse.json({ ranking: topRanking });
  } catch (error) {
    console.error("Error fetching ranking:", error);
    return NextResponse.json({ ranking: [], error: "Failed to fetch ranking" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario_id, nombre, email, nota } = body;

    if (!usuario_id || !nombre || !email || nota === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    initializeDemoRanking();

    // Check if user already has a better score
    const existingIndex = rankingStore.findIndex(
      (r) => r.usuario_id === usuario_id
    );

    if (existingIndex >= 0) {
      // Update if new score is better
      if (nota > rankingStore[existingIndex].nota) {
        rankingStore[existingIndex].nota = nota;
        rankingStore[existingIndex].fecha = new Date().toISOString();
      }
    } else {
      // Add new entry
      rankingStore.push({
        id: `rank-${Date.now()}-${Math.random()}`,
        usuario_id,
        nombre,
        email,
        nota,
        fecha: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Score recorded successfully",
    });
  } catch (error) {
    console.error("Error recording score:", error);
    return NextResponse.json(
      { error: "Failed to record score" },
      { status: 500 }
    );
  }
}
