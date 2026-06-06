'use client';

import { useParams } from 'next/navigation';
import { MatrizPonderada } from '@/components/estrategia/MatrizPonderada';

export default function PaginaMEFE() {
  const params = useParams<{ id: string }>();
  return (
    <MatrizPonderada
      proyectoId={params.id}
      campo="mefe"
      subtitulo="Evaluación de factores externos"
      titulo="Matriz MEFE"
      descripcion="Pondera las oportunidades y amenazas del entorno (puedes tomarlas de tu PESTEL). Mide qué tan bien tu proyecto responde a los factores externos."
      sugerencias={[
        'Demanda insatisfecha en el segmento objetivo',
        'Crecimiento del consumo en la zona',
        'Apps de delivery consolidadas',
        'Inflación de insumos',
        'Competencia establecida y fuerte',
        'Acceso a financiamiento blando',
      ]}
      tareaIA="Sugiere 4-5 factores EXTERNOS (oportunidades y amenazas) clave para una matriz MEFE de este proyecto en Bolivia. Uno por línea, concisos."
      interpretacion={{
        alto: 'Total ≥ 2.5: tu proyecto aprovecha bien las oportunidades y enfrenta las amenazas.',
        bajo: 'Total < 2.5: tu proyecto no está aprovechando las oportunidades del entorno. Revisa tu estrategia.',
      }}
    />
  );
}
