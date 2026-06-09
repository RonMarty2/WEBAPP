import { ClaseInteractiva } from '@/components/ecosistema/ClaseInteractiva';

export default function ClasesOrganizacion() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Clases — Organización & RRHH</h1>
        <p className="mt-2 text-slate-600">
          Estructura legal, costo real del personal, organigrama y plan técnico — siempre aterrizado
          en el marco normativo boliviano (FUNDEMPRESA, AFP, SENASAG).
        </p>
      </header>

      <ClaseInteractiva
        numero={1}
        titulo="Estructura legal: SRL, Unipersonal, SA"
        duracion="12 min"
        contenido="En Bolivia, las tres figuras más usadas para emprendimientos son la Empresa Unipersonal (1 sola persona, trámite rápido en FUNDEMPRESA, sin separación patrimonial), la SRL (mínimo 2 socios, máximo 25, responsabilidad limitada a los aportes, capital mínimo flexible) y la SA (3 o más socios, capital dividido en acciones, gobierno más complejo). La SRL es la opción más común para emprendimientos de 2 a 5 socios porque protege el patrimonio personal y los trámites son razonables. La Unipersonal sirve para freelancers o pequeños comercios sin socios. La SA solo tiene sentido si planeas captar inversores externos o cotizar acciones."
        quiz={{
          pregunta: 'Tres compañeros de carrera quieren abrir una cafetería en Cochabamba con un capital combinado de Bs 50.000. Quieren proteger su patrimonio personal y mantener trámites simples. ¿Qué figura legal eligen?',
          opciones: [
            'Empresa Unipersonal a nombre de uno de los socios',
            'Sociedad de Responsabilidad Limitada (SRL)',
            'Sociedad Anónima (SA)',
            'Asociación civil sin fines de lucro',
          ],
          correctaIndex: 1,
          explicacion: 'La SRL encaja perfecto: permite 2 a 25 socios, responsabilidad limitada al aporte (protege el patrimonio personal), y los trámites en FUNDEMPRESA son razonables (1 a 2 semanas). La Unipersonal no permite 3 socios y mezcla el patrimonio personal. La SA es excesiva para Bs 50.000.',
        }}
      />

      <ClaseInteractiva
        numero={2}
        titulo="Costo real de un empleado en Bolivia"
        duracion="10 min"
        contenido="Cuando contratas a alguien con un salario líquido de Bs 3.000, la empresa no paga Bs 3.000: paga eso más los aportes patronales (aproximadamente 16,71% que incluye Caja Nacional de Salud 10%, AFP aporte patronal 1,71%, INFOCAL 1%, Pro-Vivienda 2% y aportes específicos). Adicionalmente debes provisionar mensualmente el aguinaldo (1 sueldo extra al año, equivalente al 8,33% mensual). Suma de aportes patronales + provisión de aguinaldo da un costo extra real cercano al 25% sobre el salario líquido. Si además provisionas indemnización (otro mes por año), el costo extra sube a ~33%. Olvidar esto destruye la rentabilidad de cualquier plan financiero."
        quiz={{
          pregunta: 'Si pagas un salario líquido de Bs 4.000 mensuales, ¿cuál es el costo total aproximado para la empresa por mes (incluyendo aportes patronales y provisión de aguinaldo)?',
          opciones: [
            'Bs 4.000 (es lo mismo que el salario líquido)',
            'Bs 4.400 (un 10% más)',
            'Bs 5.000 (un 25% más, ~Bs 1.000 entre aportes y aguinaldo)',
            'Bs 6.500 (un 60% más)',
          ],
          correctaIndex: 2,
          explicacion: 'Aportes patronales ~16,71% sobre Bs 4.000 = Bs 668. Provisión mensual de aguinaldo (8,33%) = Bs 333. Total ~Bs 5.001. Por eso 1 empleado de Bs 4.000 líquidos te cuesta ~Bs 5.000 mensuales reales.',
        }}
      />

      <ClaseInteractiva
        numero={3}
        titulo="Organigrama: vertical vs matricial vs plano"
        duracion="8 min"
        contenido="El organigrama vertical clásico es jerárquico: gerencia arriba, jefaturas en medio, operativos abajo. Funciona bien en empresas con 20+ personas y procesos estables. El organigrama matricial cruza áreas funcionales (marketing, ventas, producción) con proyectos o productos — exige doble reporte y es típico de consultoras o empresas multi-producto. El organigrama plano (o circular) tiene 1 o 2 niveles: todos reportan al fundador, las decisiones se toman rápido y la comunicación es horizontal. Para startups y emprendimientos de menos de 10 personas, el plano casi siempre gana: mantiene la agilidad y evita sobrecargar al fundador con gerencias intermedias que no necesita todavía."
        quiz={{
          pregunta: 'Una startup boliviana de tecnología tiene 5 personas: 1 fundador-CEO, 1 desarrollador, 1 diseñador, 1 community manager y 1 vendedor. ¿Qué organigrama encaja mejor?',
          opciones: [
            'Vertical con 3 niveles (CEO, gerentes de área, operativos)',
            'Matricial con doble línea de reporte por proyecto',
            'Plano con todos reportando al CEO',
            'Circular con coordinaciones rotativas mensuales',
          ],
          correctaIndex: 2,
          explicacion: 'Con 5 personas, un organigrama plano (todos reportan al CEO) es lo más ágil. Crear gerencias intermedias entre 5 personas es burocrático y caro. La matricial solo tiene sentido con 15+ personas y múltiples proyectos paralelos.',
        }}
      />

      <ClaseInteractiva
        numero={4}
        titulo="Manual de funciones: para qué sirve y qué incluir"
        duracion="10 min"
        contenido="El manual de funciones (o descripción de puestos) define qué hace cada cargo, a quién reporta, qué autoridad tiene y qué resultados se esperan. No es burocracia — es lo que evita las dos quejas típicas en empresas pequeñas: 'eso no es mi trabajo' y 'nadie me dijo que tenía que hacerlo'. Un buen manual de funciones incluye, por cada cargo: 1) nombre del cargo y dependencia jerárquica, 2) misión del puesto en 1 oración, 3) responsabilidades principales (5 a 8 ítems), 4) requisitos del perfil (formación, experiencia, competencias), 5) indicadores de desempeño (KPIs medibles). En Bolivia es además respaldo legal en caso de juicio laboral por despido."
        quiz={{
          pregunta: '¿Cuál de estos NO debería ir en un manual de funciones del cargo "Encargado de mostrador" de una cafetería?',
          opciones: [
            'Misión del puesto: atender al cliente y procesar ventas',
            'Reporta directamente al Gerente General',
            'Responsabilidad: operar caja registradora, preparar bebidas, mantener limpieza',
            'Salario líquido mensual exacto y fecha de pago',
          ],
          correctaIndex: 3,
          explicacion: 'El salario y la fecha de pago van en el contrato laboral, no en el manual de funciones. El manual define QUÉ hace el cargo, no CUÁNTO le pagan. Mezclarlos genera filtración de información salarial entre empleados.',
        }}
      />

      <ClaseInteractiva
        numero={5}
        titulo="Plan técnico: capacidad instalada y cuello de botella"
        duracion="12 min"
        contenido="El plan técnico define cuánto puedes producir o atender realmente. La capacidad instalada es el máximo teórico (ej. 200 cafés/día con tu máquina). La capacidad utilizada es lo que realmente atiendes (ej. 120/día). El cuello de botella es el paso del proceso que limita todo lo demás — si tu barista solo puede preparar 15 cafés/hora pero tu máquina aguanta 30, tu cuello de botella es el barista, no la máquina. Identificar el cuello de botella es clave porque ahí debes invertir primero (contratar otro barista, automatizar el paso). Una norma boliviana relevante: para alimentos, SENASAG exige condiciones técnicas mínimas (zona de cocina separada, control de temperatura, registro sanitario) que deben quedar reflejadas en tu plan técnico."
        quiz={{
          pregunta: 'Una panadería tiene 1 horno con capacidad de 80 panes/hora, 2 maestros panaderos que producen 30 panes/hora cada uno y 1 vendedora que despacha 100 panes/hora. ¿Cuál es el cuello de botella y la capacidad real del sistema?',
          opciones: [
            'El horno · 80 panes/hora',
            'Los maestros panaderos juntos · 60 panes/hora',
            'La vendedora · 100 panes/hora',
            'No hay cuello de botella · 100 panes/hora',
          ],
          correctaIndex: 1,
          explicacion: 'Los 2 maestros producen 60 panes/hora combinados. El horno aguanta 80, la vendedora 100, pero como los panaderos solo producen 60, el sistema completo no puede pasar de 60 panes/hora. Ese es el cuello de botella: ahí hay que invertir (contratar un 3er panadero) si quieres crecer.',
        }}
      />
    </div>
  );
}
