import { ClaseInteractiva } from '@/components/ecosistema/ClaseInteractiva';

export default function ClasesMercados() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Clases — Investigación de Mercados</h1>
        <p className="mt-2 text-slate-600">Aprende los conceptos, hazlo en la calculadora, valida con un mini-quiz.</p>
      </header>

      <ClaseInteractiva
        numero={1}
        titulo="¿Qué es el tamaño de muestra y por qué importa?"
        duracion="8 min"
        contenido="Calcular el tamaño correcto de una muestra te da resultados estadísticamente significativos. Una muestra muy pequeña genera conclusiones poco confiables; una muy grande gasta tu tiempo y dinero sin agregar precisión. Las fórmulas más usadas son Cochran (para proporciones) y Slovin (para poblaciones conocidas)."
        quiz={{
          pregunta: 'Si tu población es de 50,000 personas y quieres un IC del 95% con margen de error del 5%, ¿qué tamaño de muestra necesitas aproximadamente?',
          opciones: ['100 personas', '200 personas', '384 personas', '1,000 personas'],
          correctaIndex: 2,
          explicacion: 'Para poblaciones grandes con IC 95% y error 5%, la fórmula de Cochran da ~384 sin importar mucho el tamaño exacto de la población.',
        }}
      />

      <ClaseInteractiva
        numero={2}
        titulo="Tipos de muestreo: aleatorio, estratificado, por conveniencia"
        duracion="12 min"
        contenido="No todos los muestreos son iguales. El aleatorio simple da la misma probabilidad a cada persona. El estratificado divide la población en subgrupos (estratos) y muestrea proporcionalmente cada uno — ideal cuando hay diferencias claras (edad, género, zona). El por conveniencia es rápido pero sesgado."
        quiz={{
          pregunta: 'Para estudiar consumo de café en Cochabamba norte con segmentos universitarios, profesionales y familias, ¿qué muestreo es mejor?',
          opciones: ['Aleatorio simple', 'Estratificado proporcional', 'Por conveniencia', 'Bola de nieve'],
          correctaIndex: 1,
          explicacion: 'El estratificado proporcional asegura que los 3 segmentos estén representados en la misma proporción que en la población real.',
        }}
      />
    </div>
  );
}
