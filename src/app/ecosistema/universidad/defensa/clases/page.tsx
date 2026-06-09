import { ClaseInteractiva } from '@/components/ecosistema/ClaseInteractiva';

export default function ClasesDefensa() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Clases — Defensa de Tesis y Proyectos</h1>
        <p className="mt-2 text-slate-600">
          Cuatro clases base para preparar tu defensa: tribunal, manejo de preguntas, metodología y
          comunicación no verbal.
        </p>
      </header>

      <ClaseInteractiva
        numero={1}
        titulo="Anatomía de un tribunal"
        duracion="10 min"
        contenido="En la mayoría de universidades bolivianas (UMSS, UMSA, UPB, UAJMS, Univalle), el tribunal de defensa lo forman 3 docentes con roles distintos. Primero el tutor o director: conoce tu proyecto al detalle, te apoya y suele hacer preguntas suaves para que destaques. Segundo el lector cercano al tema: docente del área específica de tu investigación, busca verificar profundidad técnica y dominio teórico. Tercero el lector externo crítico: docente de otra especialidad que evalúa rigor metodológico y consistencia general — es el más temido porque pregunta lo que tú nunca pensaste. Cada uno busca cosas diferentes: el tutor busca defenderte, el lector cercano busca dominio, el lector externo busca grietas. Conocer estos roles te permite anticipar quién preguntará qué."
        quiz={{
          pregunta: 'Si estás defendiendo un plan de negocio y tu tribunal incluye un docente de Finanzas conocido por su rigurosidad con las proyecciones, ¿cuál es su rol y qué busca?',
          opciones: [
            'Es tu tutor — busca defenderte ante el resto del tribunal',
            'Es el lector cercano — busca verificar dominio del tema específico',
            'Es el lector externo crítico — busca grietas en supuestos y consistencia metodológica',
            'Es solo un observador sin poder de calificación',
          ],
          correctaIndex: 2,
          explicacion: 'Un docente de Finanzas en una defensa de plan de negocio típicamente actúa como lector externo crítico. Su rol es estresar tus proyecciones financieras y supuestos (tasa de descuento, captura del mercado, inflación) buscando inconsistencias.',
        }}
      />

      <ClaseInteractiva
        numero={2}
        titulo="Cómo responder cuando no sabes (técnica del puente)"
        duracion="8 min"
        contenido="Nadie sabe todo. Cuando el tribunal te hace una pregunta que no esperabas o no manejas, la peor reacción es quedarte mudo o inventar. La técnica del puente tiene 3 pasos: 1) RECONOCER honestamente lo que sí sabes y lo que no — 'doctor, esa observación me lleva a un punto que no profundicé en mi tesis'; 2) REDIRIGIR hacia un terreno donde sí tienes dominio — 'sin embargo, sí trabajé este tema relacionado, donde encontré...'; 3) COMPROMETERTE a profundizarlo — 'tomaré nota para futuras versiones del trabajo'. El tribunal valora la honestidad más que el bluff. Inventar una respuesta que el tribunal puede comprobar te puede costar la defensa entera, mientras que reconocer un límite específico solo te cuesta esa pregunta."
        quiz={{
          pregunta: 'En tu defensa, el tribunal te pregunta sobre un autor que no leíste. ¿Cuál es la mejor respuesta?',
          opciones: [
            'Inventar una cita aproximada del autor y esperar que no lo verifiquen',
            'Quedarte en silencio hasta que pasen a la siguiente pregunta',
            'Reconocer que no profundizaste en ese autor específico, mencionar autores relacionados que sí trabajaste y comprometerte a estudiarlo',
            'Desviar la pregunta diciendo que no es relevante para tu tesis',
          ],
          correctaIndex: 2,
          explicacion: 'La técnica del puente: reconocer (no lo profundicé) + redirigir (sí trabajé autores relacionados como X e Y) + comprometerse (lo estudiaré). Inventar citas es el error más caro: si el tribunal lo detecta, tu credibilidad cae para el resto de la defensa.',
        }}
      />

      <ClaseInteractiva
        numero={3}
        titulo="Defender la metodología sin caer en defensiva"
        duracion="12 min"
        contenido="Las preguntas trampa más comunes atacan tu metodología: '¿por qué Cochran y no Slovin?', '¿por qué cualitativo y no mixto?', '¿por qué solo 30 entrevistas si tu población es de 50.000?'. El error fatal es ponerse defensivo y empezar a justificar como si te estuvieran acusando. La respuesta correcta tiene 3 partes: 1) VALIDAR la pregunta — 'doctor, esa es una observación pertinente y la trabajé en mi sección metodológica'; 2) EXPLICAR el criterio de decisión — 'opté por X porque el contexto de mi investigación cumple las condiciones A y B, y X tiene la ventaja Y'; 3) RECONOCER el trade-off — 'la alternativa Z hubiera dado el beneficio W pero implicaba el costo C que mi presupuesto/tiempo no permitía'. Reconocer que toda decisión metodológica tiene trade-offs muestra madurez investigativa, no debilidad."
        quiz={{
          pregunta: 'El tribunal te pregunta: "¿Por qué hizo solo 30 entrevistas en profundidad si su población es de 50.000 personas?". ¿Cuál es la mejor respuesta?',
          opciones: [
            '"Porque era lo único que podía pagar con mi presupuesto"',
            '"Porque las entrevistas en profundidad son cualitativas y buscan saturación teórica, no representatividad estadística — con 30 entrevistas alcancé saturación al no surgir nuevas categorías; si hubiera querido inferencia estadística habría usado encuesta cuantitativa con muestra Cochran"',
            '"Porque en un estudio cualitativo el tamaño no importa, solo importa la profundidad"',
            '"Porque mi tutora me dijo que 30 era suficiente"',
          ],
          correctaIndex: 1,
          explicacion: 'La respuesta correcta valida (cualitativo busca saturación, no representatividad), explica (saturación alcanzada con 30) y reconoce el trade-off (si quisiera inferencia estadística usaría otra técnica). Justificarse con presupuesto o tutora es debilidad; decir "el tamaño no importa" es metodológicamente falso.',
        }}
      />

      <ClaseInteractiva
        numero={4}
        titulo="Postura, voz, gestos: comunicación no verbal"
        duracion="10 min"
        contenido="Estudios de psicología social muestran que la comunicación no verbal pesa entre 55% y 65% en la percepción del interlocutor. En una defensa, eso significa que tu postura y voz transmiten tanta autoridad como tus argumentos. Reglas concretas: 1) POSTURA — espalda recta, hombros relajados, pies firmes; no te apoyes en la mesa ni cruces los brazos; 2) MIRADA — barre los 3 miembros del tribunal en lugar de fijar la vista solo en el tutor; mira a los ojos cuando respondes a quien preguntó; 3) VOZ — habla más lento de lo que crees necesario; las pausas dan peso a tus argumentos; baja medio tono al final de las afirmaciones para no sonar inseguro; 4) MANOS — visibles, gesto natural; evitar tocarte la cara o el cuello (es señal clara de inseguridad). Antes de entrar a la sala, respira profundo 4 veces (4 segundos inspirar, 4 sostener, 4 exhalar) — baja el cortisol y la voz suena más estable."
        quiz={{
          pregunta: '¿Cuál de estas conductas durante una defensa transmite MAYOR inseguridad al tribunal?',
          opciones: [
            'Pausar 2 segundos antes de responder una pregunta difícil',
            'Tocarte repetidamente el cuello o la cara mientras respondes',
            'Barrer la mirada entre los 3 miembros del tribunal',
            'Mantener las manos visibles sobre la mesa',
          ],
          correctaIndex: 1,
          explicacion: 'Tocarse el cuello/cara es uno de los gestos de autoprotección más estudiados en comunicación no verbal — el tribunal lo percibe como inseguridad inmediata. Las pausas antes de responder, en cambio, transmiten reflexión y peso argumental.',
        }}
      />
    </div>
  );
}
