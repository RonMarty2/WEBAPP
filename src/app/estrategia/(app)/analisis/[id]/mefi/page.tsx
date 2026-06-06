'use client';

import { useParams } from 'next/navigation';
import { MatrizPonderada } from '@/components/estrategia/MatrizPonderada';

export default function PaginaMEFI() {
  const params = useParams<{ id: string }>();
  return (
    <MatrizPonderada
      proyectoId={params.id}
      campo="mefi"
      subtitulo="Evaluación de factores internos"
      titulo="Matriz MEFI"
      descripcion="Pondera las fortalezas y debilidades internas de tu proyecto. Mide qué tan sólida es tu posición interna."
      sugerencias={[
        'Ubicación estratégica',
        'Personal capacitado / barista certificado',
        'Producto diferenciado de origen local',
        'Capital de trabajo limitado',
        'Marca aún desconocida',
        'Procesos no estandarizados',
      ]}
      tareaIA="Sugiere 4-5 factores INTERNOS (fortalezas y debilidades) clave para una matriz MEFI de este proyecto. Uno por línea, concisos."
      interpretacion={{
        alto: 'Total ≥ 2.5: posición interna fuerte; tus fortalezas superan tus debilidades.',
        bajo: 'Total < 2.5: posición interna débil; trabaja en reducir tus debilidades clave.',
      }}
    />
  );
}
