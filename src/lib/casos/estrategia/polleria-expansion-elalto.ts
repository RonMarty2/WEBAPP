import type { CasoEstrategia } from "../types";

/**
 * Caso 4 — Análisis estratégico para una pollería familiar de El Alto
 * que evalúa abrir 3 sucursales adicionales tras 11 años con un solo
 * local exitoso.
 *
 * Caso **intermedio**: PESTEL con precio del pollo y normativa
 * SENASAG, Porter con rivalidad altísima en el sector (1 pollería
 * cada 3 cuadras), MPC con competidores hiperlocales, FODA con
 * tensión generacional padre-hijo, matriz Ansoff (penetración vs
 * desarrollo), MCPE compara 3 modelos: 3 locales propios, franquicia,
 * delivery virtual.
 */

export const casoPolleriaExpansionElalto: CasoEstrategia = {
  slug: "polleria-expansion-elalto",
  modulo: "estrategia",
  titulo: "Pollería familiar que quiere abrir 3 sucursales",
  tagline: "Plan de expansión para Pollos Mamani: del local único en Ceja El Alto hacia red de 4 puntos con menú estandarizado.",
  zona: "El Alto + La Paz",
  rubro: "Alimentación / restaurantes",
  dificultad: "intermedio",
  emoji: "🍗",
  emprendedor: {
    nombre: "Familia Mamani (Don Eulogio y Marco)",
    edad: 58,
    rol: "Don Eulogio Mamani (58), fundador. Inició Pollos Mamani en 2014 en Ceja El Alto con un local 35 m² alquilado. Hoy factura Bs 12.000/mes promedio con margen neto 22-28%. Su hijo Marco Mamani (32), técnico en gastronomía (Hotelería ITA Sucre), trabaja en el local desde 2020 y quiere expandir; el padre tiene miedo de 'perder lo que tenemos'.",
  },
  contexto: [
    "Pollos Mamani es una historia familiar típica de El Alto. Don Eulogio dejó Caquiaviri (provincia Pacajes) en 2002 buscando mejor vida, trabajó 8 años como ayudante en distintas pollerías antes de juntar capital para abrir el suyo en 2014. Sirve pollo al horno con papas fritas, arroz y ensalada, precio popular (Bs 14-22 según porción). El cliente típico: trabajador de construcción, comerciante de Ceja, estudiantes UPEA. El local es chico pero está ubicado en una esquina con paso intenso de minibuses.",
    "Marco regresó de Sucre en 2020 después de terminar técnico en gastronomía. Vio inmediatamente que el negocio podía crecer pero su padre era reacio. En cinco años Marco ha logrado: estandarizar 11 recetas (control de tiempos y porciones), digitalizar las cuentas (Excel + sistema POS básico), abrir cuenta empresarial BNB y obtener registro SENASAG (que el padre nunca había tramitado en 11 años). Eso permitió a la familia obtener un préstamo BDP de Bs 180.000 en 2024 que renovaron parcialmente con resultados sólidos.",
    "Ahora Marco quiere abrir 3 sucursales más: una en Río Seco (El Alto, zona en expansión con 110.000 habitantes), una en Villa Adela (clase media-baja con poder adquisitivo creciente) y una en Sopocachi (La Paz, segmento estudiantil y oficinista). Don Eulogio teme que el negocio se diluya, que la calidad caiga y que terminen perdiendo el local original. La pregunta estratégica es: ¿abrir 3 locales propios, franquiciar la marca o lanzar 'dark kitchens' (cocinas solo delivery)?",
  ],
  problema: "Pollos Mamani genera flujo estable con 1 local pero tiene capacidad ociosa de marca y procesos; la familia debate cómo crecer sin perder el control de calidad y sin sobre-endeudarse, en un mercado con rivalidad altísima donde abrir mal puede liquidar al negocio original.",
  segmento: "Trabajadores y familias de clase media-baja y media de El Alto (Ceja, Villa Adela, Río Seco) y estudiantes/oficinistas de Sopocachi La Paz; ticket promedio Bs 18-32 por comida, frecuencia 2-3 veces/semana, sensibles al precio pero valoran porción y consistencia.",
  pestel: {
    politico: [
      {
        nombre: "Subsidio gasolina y diesel para transporte",
        descripcion: "Bolivia mantiene subsidio a hidrocarburos: gasolina Bs 3,74/L, diesel Bs 3,72/L (precios 2026). Esto reduce costos logísticos en el delivery propio y en el transporte de insumos. Pero el subsidio está bajo presión fiscal y podría reducirse.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Aprovechar mientras dure pero modelar escenario sin subsidio (gasolina USD 1,20/L como mercado vecino) para verificar resistencia del modelo.",
      },
      {
        nombre: "GAM El Alto y patente municipal",
        descripcion: "El GAM El Alto cobra patente municipal Bs 1.450/año para restaurantes pequeños + licencia funcionamiento Bs 800. SEDES El Alto cobra inspección sanitaria anual Bs 600.",
        impacto: "neutro",
        intensidad: 2,
        implicacion: "Costo total tributario municipal Bs 2.850/local. Manejable. Cada nuevo local tramita licencias 60-90 días antes de apertura.",
      },
    ],
    economico: [
      {
        nombre: "Precio del pollo al productor",
        descripcion: "El precio mayorista pollo entero en Bolivia fluctúa Bs 13-17/kg según temporada. Aves Cochabamba e Imba lideran proveedores. Subió 23% entre 2023-2025 por inflación de balanceado importado. ADA (Asociación de Avicultores) intenta estabilizar pero con éxito parcial.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "El pollo es 38-42% del costo total del plato. Cualquier suba erosiona margen. Cerrar contrato anual con 1-2 proveedores grandes para fijar precio 6 meses adelantado.",
      },
      {
        nombre: "Inflación de alquileres comerciales en zonas en expansión",
        descripcion: "Alquileres comerciales en Río Seco subieron 35% entre 2022-2026 por crecimiento poblacional. Local 50 m² esquina principal: Bs 4.800-6.500/mes (vs Bs 3.200 hace 4 años).",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Negociar contratos 3 años con cláusula fija + revisión al año 2. No alquilar locales sin negociación; el primer precio siempre es 10-20% por encima del cierre.",
      },
      {
        nombre: "Crecimiento de poder adquisitivo en El Alto",
        descripcion: "El Alto tiene 1,2 millones de habitantes (Censo 2024) y un PIB per cápita que creció 38% real entre 2014-2024 según Fundación Aru. Zonas como Villa Adela y Río Seco son hoy 'clase media baja' con consumo regular en restaurantes locales.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Demanda de pollerías formales con higiene y consistencia crece más rápido que oferta. Espacio para escalar antes que entren cadenas formales (Pollos Copacabana, Don Lucho).",
      },
    ],
    social: [
      {
        nombre: "Consumo del pollo como proteína dominante",
        descripcion: "El pollo es la proteína más consumida en Bolivia: 47 kg/persona/año (2024) vs carne vacuna 18 kg. En El Alto la diferencia es aún mayor (52 kg/persona/año pollo).",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "Demanda estructural a favor. Mercado grande y consolidado. La pregunta no es si hay demanda sino cómo competir con la oferta saturada.",
      },
      {
        nombre: "Estilo de vida acelerado y delivery",
        descripcion: "PedidosYa lanzó en El Alto en 2022; cubre Ceja, Villa Adela y Río Seco. 38% de los pedidos son comida 'pollería/parrilla' (datos PedidosYa 2024). Crece 15% anual.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Habilitar delivery con PedidosYa desde día 1 en cada nuevo local. Comisión 23% pero alcance multiplica ventas en 30-50%.",
      },
      {
        nombre: "Lealtad de cliente recurrente del local fundador",
        descripcion: "El cliente histórico del local Ceja conoce a Don Eulogio personalmente. La identidad familiar es activo de marca. Estudio informal: 70% de clientes vienen >1 vez/semana.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Mantener al fundador visible en el local original. La expansión NO puede sacrificar la operación del local 1 — es la 'caja de marca' del negocio.",
      },
    ],
    tecnologico: [
      {
        nombre: "Sistema POS y gestión de inventario en restaurantes pequeños",
        descripcion: "Soluciones tipo Square o sistemas locales (POS Bolivia, KFC Sistemas) dan control de ventas, inventario y costo unitario. Costo Bs 250-450/mes por terminal.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Marco ya implementó POS básico en local 1. Replicar en 3 nuevos locales con software igual para consolidar reportes diariamente.",
      },
      {
        nombre: "Apps de delivery (PedidosYa, Rappi, Yaigo)",
        descripcion: "Tres apps principales en La Paz/El Alto. PedidosYa lidera con 55% del market share. Comisión 18-25% sobre venta + costo delivery a cargo del cliente.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Estar en las 3 apps. Asignar 1 zona de cocina dedicada exclusiva a pedidos delivery cuando volumen supere 30/día.",
      },
    ],
    ecologico: [
      {
        nombre: "Manejo de residuos y aceite usado",
        descripcion: "El aceite usado de pollería es residuo peligroso si se vierte. Empresas como Recybol pagan Bs 1,50/L y certifican manejo correcto. Algunos GAM ya exigen certificado de manejo.",
        impacto: "neutro",
        intensidad: 2,
        implicacion: "Implementar acopio de aceite usado con Recybol (genera ingreso menor y cumple normativa). Aceite usado de los 4 locales: ~600 L/mes = Bs 900 ingreso adicional.",
      },
    ],
    legal: [
      {
        nombre: "Registro SENASAG para restaurantes",
        descripcion: "SENASAG exige registro sanitario para todo establecimiento de alimentos. Inspección anual. Sin SENASAG no se puede facturar a empresas ni inscribirse en PedidosYa formal. Costo: Bs 1.800 inicial + Bs 1.200 anual.",
        impacto: "neutro",
        intensidad: 4,
        implicacion: "Local 1 ya tiene SENASAG (Marco lo tramitó en 2021). Cada nuevo local tramita su registro paralelo a habilitación municipal.",
      },
      {
        nombre: "Ley General del Trabajo y costos laborales",
        descripcion: "Cocineros con LGT: salario mínimo Bs 2.500 + aportes AFP/CNS 14,7% + segundo aguinaldo cuando PIB crece >4,5%. Mozos: con propina + sueldo base Bs 2.500. Mayor costo total: ~Bs 3.250/empleado base.",
        impacto: "neutro",
        intensidad: 3,
        implicacion: "Modelar planilla por local: 1 cocinero + 1 ayudante + 1 mozo + 1 cajero = Bs 13.000/local en planilla. 4 locales = Bs 52.000/mes planilla total.",
      },
      {
        nombre: "Régimen Tributario Simplificado vs General",
        descripcion: "Restaurantes con ventas <Bs 184.000/año pueden estar en Régimen Simplificado (cuota fija Bs 47-1.200/mes). Pollos Mamani factura ~Bs 144.000/año en local 1 — está en Simplificado. Al expandirse a 4 locales superará el límite y debe pasar a Régimen General (IVA 13% + IT 3%).",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Planificar transición a Régimen General con contador. El IVA bien manejado se recupera de proveedores formales, no es pérdida completa pero requiere disciplina.",
      },
    ],
  },
  porter: {
    rivalidad: {
      intensidad: "alto",
      justificacion: [
        "Pollerías en El Alto: censo informal estima 1 cada 3-4 cuadras en zonas comerciales. Solo en Ceja hay 28+ pollerías en radio 600 m.",
        "Cadenas formales (Pollos Copacabana, Don Lucho, Pollo Stop) están expandiendo agresivamente en La Paz y El Alto desde 2022.",
        "Diferenciación de producto baja: pollo al horno con papas y ensalada es commodity gastronómica.",
      ],
      estrategia: "Diferenciarse por consistencia (sabor y porción idénticos en los 4 locales) + identidad familiar visible + delivery confiable. Estandarización de procesos como fortaleza, no como rigidez.",
    },
    nuevos_entrantes: {
      intensidad: "alto",
      justificacion: [
        "Capital de entrada bajísimo: Bs 80.000-120.000 alcanza para abrir una pollería pequeña con horno gas básico.",
        "Saber-hacer culinario poco diferenciado: cualquier ayudante de cocina con 2 años de experiencia puede replicar el plato.",
        "Esta barrera baja explica por qué hay tantos competidores y por qué la rivalidad es alta.",
      ],
      estrategia: "Convertir 'Mamani' en marca reconocida con identidad visual coherente. Estandarización de recetas, uniformes, empaque y comunicación crea barrera de marca que la pollería esquinera no puede igualar.",
    },
    sustitutos: {
      intensidad: "alto",
      justificacion: [
        "Anticucho y silpancho son sustitutos directos en proteína de calle.",
        "Parrillas familiares, hamburgueserías, salteñerías compiten por el mismo ticket Bs 18-32.",
        "Cocina casera: muchas familias siguen prefiriendo comer en casa el almuerzo.",
      ],
      estrategia: "Combo familiar (4 personas, Bs 95) para captar familias que dudan entre cocinar y comprar. Servicio rápido para llevar (<6 min orden + entrega) para captar al cliente con prisa.",
    },
    poder_proveedores: {
      intensidad: "medio",
      justificacion: [
        "Proveedores grandes de pollo (Aves Cochabamba, Imba, Aves del Sur) son varios; poder bajo individualmente.",
        "Productos complementarios (papa, aceite, sazonadores) tienen 30+ proveedores en mercado mayorista La Paz/El Alto.",
        "Gas natural en El Alto: monopolio YPFB, sin alternativa.",
      ],
      estrategia: "Negociar contratos anuales con 2 proveedores de pollo (volumen total ~600 kg/semana entre 4 locales) para conseguir precio fijo 6 meses. Diversificar proveedores complementarios.",
    },
    poder_clientes: {
      intensidad: "medio",
      justificacion: [
        "El cliente individual tiene poder bajo (no negocia precio), pero el segmento como grupo puede migrar fácilmente a competidor a 100 m.",
        "Sensibilidad a precio alta: una subida de Bs 2 en porción puede perder 15% del tráfico.",
        "Lealtad real existe cuando hay relación personal (local fundador) o consistencia muy alta.",
      ],
      estrategia: "No subir precios bruscamente. Programa de fidelización simple: 9 pollos = 1 gratis con tarjeta sellada. Mantener consistencia de sabor como compromiso operativo.",
    },
    atractivo_sector: 2,
    conclusion: "Sector poco atractivo en términos generales: rivalidad altísima, barreras de entrada bajas, sustitutos múltiples, sensibilidad de precio. Sin embargo, Pollos Mamani tiene ventaja relativa al estar consolidada con 11 años de historia, registro SENASAG, sistema POS, e identidad de marca incipiente. La expansión es viable SI la estandarización funciona y SI no se sobre-extienden financieramente.",
  },
  mpc: {
    factores: [
      { nombre: "Consistencia de sabor entre locales", peso: 0.20 },
      { nombre: "Precio competitivo por porción", peso: 0.20 },
      { nombre: "Ubicación y tráfico de paso", peso: 0.15 },
      { nombre: "Velocidad de atención", peso: 0.15 },
      { nombre: "Identidad de marca / reconocimiento", peso: 0.15 },
      { nombre: "Delivery disponible (PedidosYa, Rappi)", peso: 0.15 },
    ],
    competidores: [
      {
        nombre: "Pollos Mamani (con expansión 4 locales)",
        notas: [3, 3, 3, 3, 3, 3],
        total_ponderado: 3.00,
      },
      {
        nombre: "Pollos Copacabana (cadena formal en expansión)",
        notas: [4, 3, 4, 4, 4, 4],
        total_ponderado: 3.80,
      },
      {
        nombre: "Pollería esquinera promedio Ceja",
        notas: [2, 4, 4, 3, 1, 2],
        total_ponderado: 2.65,
      },
      {
        nombre: "Don Lucho (cadena establecida)",
        notas: [4, 3, 3, 3, 4, 4],
        total_ponderado: 3.50,
      },
    ],
    conclusion: "Pollos Mamani supera a la pollería esquinera promedio (3,00 vs 2,65) pero queda 0,80 puntos por debajo de Pollos Copacabana y 0,50 por debajo de Don Lucho. Donde Mamani gana frente a la esquinera: consistencia, identidad y delivery. Donde pierde frente a cadenas grandes: precisamente lo mismo, pero con menor escala. La expansión a 4 locales con estandarización es la única forma de cerrar la brecha con cadenas formales antes de que estas saturen El Alto. Si Pollos Mamani se queda en 1 local, queda a merced de cualquier cadena que abra cerca.",
  },
  foda: {
    fortalezas: [
      "11 años de operación con margen neto sostenido 22-28%, sin nunca quebrar — historia operacional sólida.",
      "Marco con técnico en gastronomía + 5 años de operación interna; conoce recetas y procesos al detalle.",
      "Local fundador en esquina con paso intenso de minibuses — ubicación irreemplazable.",
      "Registro SENASAG, NIT activo, cuenta BNB con historial — apto para préstamos bancarios formales.",
      "Recetas estandarizadas (11 platos) y sistema POS funcionando hace 3 años.",
      "Relación de proveeduría 7+ años con Aves Cochabamba (descuento 6% y crédito 30 días).",
      "Cliente recurrente del local 1: 70% viene >1 vez/semana, base de prueba para nueva marca.",
    ],
    oportunidades: [
      "Crecimiento poblacional de El Alto (Río Seco: 110.000 habitantes, todavía con poca oferta formal).",
      "Crecimiento del delivery 15% anual en El Alto.",
      "Sopocachi: 4.200 oficinistas + estudiantes UMSA cerca, sin cadena formal de pollería en zona.",
      "Cadenas formales aún no penetran zonas periféricas de El Alto donde Pollos Mamani puede llegar primero.",
      "Préstamos PyMe BDP y Banco Sol disponibles para expansión avalada con flujo histórico.",
    ],
    debilidades: [
      "Don Eulogio (58 años) con resistencia psicológica fuerte al cambio; conflicto generacional padre-hijo.",
      "Equipo de gestión limitado: si Marco se enferma, no hay quien decida. No hay gerente operativo.",
      "Sin manual operativo formal escrito — los procesos están en cabezas, no en papel.",
      "Sin sistema de costos por plato — saben margen agregado pero no por línea de menú.",
      "Marca 'Pollos Mamani' es reconocida solo en Ceja El Alto, no fuera de esa zona.",
      "Capital propio limitado: Bs 95.000 ahorro familiar + flujo del local 1 + endeudamiento previo BDP.",
    ],
    amenazas: [
      "Rivalidad altísima: 28+ pollerías en Ceja sola; cualquier zona nueva tendrá competencia ya instalada.",
      "Cadenas formales (Pollos Copacabana, Don Lucho) expandiéndose agresivamente.",
      "Precio del pollo subió 23% en 2 años — puede seguir subiendo.",
      "Si fracasa una sucursal, el endeudamiento podría arrastrar al local fundador.",
      "Salida del subsidio a combustible encarecería delivery propio y transporte de insumos.",
      "Cualquier escándalo sanitario en una sucursal contamina la marca completa (riesgo de marca compartida).",
    ],
  },
  foda_cruzado: {
    fo: [
      "Aprovechar 11 años de track record + crecimiento Río Seco para abrir primer local nuevo en zona con poca oferta formal, replicando recetas exactas del local fundador.",
      "Usar registro SENASAG + sistema POS + NIT como diferencial vs pollerías esquineras al postular a contratos con empresas (almuerzos para personal de fábricas Vinco, Inti, etc.).",
      "Capitalizar la curva de crecimiento de delivery: cada local nuevo tiene PedidosYa activo desde día 1 (no esperar 3-6 meses como hizo el local 1).",
    ],
    do: [
      "Antes de abrir local 2 (Río Seco), Marco escribe manual operativo formal (50-80 páginas: recetas, tiempos, porciones, manejo de quejas, procedimiento de cierre).",
      "Contratar gerente operativo junior (Bs 4.200/mes) que asuma operación día-a-día del local 1 a partir del mes 3, liberando a Marco para abrir local 2.",
      "Crear sistema de costo por plato con contador (3 sesiones, Bs 1.500 total) para tomar decisiones de precios con datos.",
    ],
    fa: [
      "Diferenciarse contra cadenas formales con identidad familiar 'Pollos Mamani' visible: foto familiar en cada local, historia en empaque, Don Eulogio como cara visible.",
      "Cerrar contrato anual con 2 proveedores de pollo (volumen 600 kg/semana) para fijar precio 6 meses adelantado, protegiendo contra subas bruscas.",
      "Asegurar cada local independiente legalmente como sucursal del mismo NIT pero con contabilidad separada — si una falla, el resto sobrevive.",
    ],
    da: [
      "No abrir los 3 locales en simultáneo — secuenciar: local 2 en mes 6, local 3 en mes 14, local 4 en mes 24, validando cada uno antes del siguiente.",
      "No exceder endeudamiento 35% del flujo mensual — mantener capacidad de pago aún si una sucursal subdesempeña.",
      "No replicar local fundador sin adaptarlo a zona — Sopocachi requiere ajuste (presentación más cuidada, opción de combo individual) vs Río Seco (combo familiar).",
    ],
  },
  matriz_nivel3: {
    tipo: "Ansoff",
    posicion: "Penetración de mercado + Desarrollo de mercado (estrategia dual secuencial)",
    justificacion: "El producto (pollo al horno y línea de menú actual) no cambia; lo que cambia es a quién se lo entrega. Río Seco y Villa Adela son DESARROLLO DE MERCADO porque son zonas geográficas distintas con segmento similar al actual (clase media-baja). Sopocachi es DESARROLLO DE MERCADO más complejo porque cambia el segmento (oficinistas/estudiantes urbanos vs trabajadores periféricos). Local fundador permanece como PENETRACIÓN: con delivery más fuerte y combos familiares puede crecer su market share local en Ceja.",
    implicacion: "Asignación estratégica: 25% de esfuerzo en penetrar más profundo el mercado actual (local 1 con delivery y combos), 75% en abrir los 3 nuevos locales. Riesgo: si todos los recursos van a expansión, el local fundador puede declinar; cuidar también la 'gallina de los huevos de oro'.",
  },
  mcpe: {
    factores: [
      { nombre: "Mercado El Alto en crecimiento poblacional", peso: 0.15 },
      { nombre: "Rivalidad altísima sector pollería", peso: 0.15 },
      { nombre: "Capital limitado (debilidad)", peso: 0.15 },
      { nombre: "Sin manual operativo formal (debilidad)", peso: 0.10 },
      { nombre: "Track record financiero sólido (fortaleza)", peso: 0.15 },
      { nombre: "Don Eulogio resistente al cambio", peso: 0.10 },
      { nombre: "Crecimiento delivery 15% anual", peso: 0.10 },
      { nombre: "Precio pollo volátil (amenaza)", peso: 0.10 },
    ],
    filas: [
      {
        estrategia: "Abrir 3 sucursales propias secuencialmente (modelo retail tradicional)",
        notas: [4, 3, 2, 3, 4, 3, 3, 3],
        total: 3.10,
      },
      {
        estrategia: "Franquiciar la marca Pollos Mamani a 3 inversionistas externos",
        notas: [3, 4, 4, 2, 3, 4, 2, 3],
        total: 3.10,
      },
      {
        estrategia: "Dark kitchens (3 cocinas solo delivery sin local físico)",
        notas: [3, 3, 4, 3, 3, 4, 4, 3],
        total: 3.35,
      },
    ],
    estrategia_elegida: "Mixta: 1 dark kitchen (Río Seco) + 2 locales propios secuenciales (Villa Adela año 1, Sopocachi año 2)",
    justificacion: "Las tres estrategias puras tienen méritos. La dark kitchen ganó técnicamente porque optimiza capital limitado y delivery en crecimiento. La franquicia genera flujo de regalías pero diluye control de calidad — riesgo alto para una marca incipiente. Los 3 locales propios secuenciales son la opción más conservadora pero consumen capital. La recomendación final es una estrategia mixta: una dark kitchen en Río Seco (Bs 35.000 inversión, 100% delivery, validar zona con bajo riesgo) + un local físico en Villa Adela (Bs 95.000 inversión año 1, formato tradicional) + Sopocachi local físico año 2 si la validación funciona. Esto distribuye riesgo, valida zonas antes de comprometer capital alto, y conserva el control de calidad que es no-negociable para una marca familiar.",
  },
  plan_accion: [
    "Mes 1-2: Marco escribe manual operativo formal (recetas con gramajes, tiempos, controles de calidad, procedimientos de queja, cierre de caja). 60-80 páginas. Contratar consultor de operaciones restaurantes para revisión (Bs 3.500).",
    "Mes 2: Contratar gerente operativo junior para local 1 (Bs 4.200/mes liquido). Período de transferencia de conocimiento con Marco 6 semanas.",
    "Mes 3: Establecer contrato anual con 2 proveedores de pollo. Aves Cochabamba 70% + Imba 30%. Precio fijo 6 meses. Crédito 30 días.",
    "Mes 3-4: Aplicar préstamo BDP ampliado Bs 250.000 a 48 meses (a la línea existente). Garantía: maquinaria + aval del local rentado.",
    "Mes 4-5: Lanzar dark kitchen Río Seco. Alquilar cocina industrial pequeña (35 m² sin frente comercial, Bs 2.200/mes). Inversión total Bs 35.000 (equipamiento básico + permisos + capital inicial). 100% pedidos por PedidosYa, Rappi, Yaigo. Marca como 'Pollos Mamani Río Seco'.",
    "Mes 6-8: Validar dark kitchen Río Seco. Métrica de éxito: 25 pedidos/día y break-even en mes 4. Si supera, mantener; si no, evaluar cierre o reconvertir.",
    "Mes 9-11: Apertura local físico Villa Adela. Inversión Bs 95.000 (acondicionamiento + equipamiento + capital inicial). Manual operativo aplicado desde día 1.",
    "Mes 12: Evaluación integral año 1. KPIs: facturación consolidada Bs 480.000 anual entre 3 puntos, margen neto >18%, sin retroceso del local 1.",
    "Mes 14-18: Si validación es positiva, planificar apertura local Sopocachi año 2. Sopocachi requiere formato adaptado: presentación más cuidada, combo individual ejecutivo, menos énfasis en familiar.",
    "Año 2-3: Migrar a Régimen Tributario General cuando ventas consolidadas superen Bs 184.000/año. Contratar contador externo full-time (Bs 2.200/mes). Considerar marca registrada en SENAPI para Pollos Mamani.",
  ],
  conclusion: "Pollos Mamani está en una situación poco común: un negocio familiar pequeño con todos los fundamentos en orden (NIT, SENASAG, POS, margen sólido, dos generaciones operativas) listo para escalar. Pero el sector es brutalmente competitivo y la expansión mal ejecutada puede destruir el activo principal: el local fundador. La estrategia mixta (dark kitchen primero + locales físicos secuenciales) es la única que conserva capital, valida zonas, y mantiene control de calidad. El conflicto generacional padre-hijo debe resolverse: Don Eulogio permanece como cara visible del local fundador (su valor intangible), Marco lidera la expansión con autonomía. Si ejecutan disciplinadamente, en 3 años pueden tener 4 puntos facturando Bs 800.000-1.100.000 anuales con planilla de 16-20 personas. Si abren los 3 locales simultáneos sin manual operativo y sin validación, en 18 meses pueden estar quebrados.",
  lecciones: [
    "En sectores con rivalidad altísima y barreras de entrada bajas, la diferenciación viene de DENTRO (procesos, marca, identidad) no de fuera (precio, ubicación). Marca = la única barrera defendible.",
    "Antes de abrir el segundo local, escribir manual operativo formal. Sin manual, el segundo local no replica al primero, solo lo imita mal. El manual es el activo más subvalorado por restaurantes familiares.",
    "Estrategia mixta (dark kitchen + locales físicos) reduce riesgo de capital y valida zonas antes de comprometer Bs 80-100k por local. Es 'expansión con frenos'.",
    "El conflicto generacional padre-hijo en negocios familiares se resuelve con división de roles: el fundador mantiene el activo de marca (su presencia en el local original), la generación joven lidera lo nuevo. Ambos ganan.",
    "Validar zonas con un formato barato (dark kitchen Bs 35k) antes de un formato caro (local físico Bs 95k) es regla de oro de expansión retail. Lo que aplica a SaaS (MVP barato) aplica también a restaurantes.",
  ],
  errores_evitados: [
    "No abrir los 3 locales en simultáneo — si uno falla, contamina a los otros con problemas de gestión y rotación de personal.",
    "No replicar el formato del local fundador en Sopocachi sin adaptación — el oficinista urbano no se atrae con el mismo storytelling que el trabajador de Ceja.",
    "No franquiciar antes de tener manual operativo blindado — un franquiciado mal capacitado destruye la marca en una zona.",
    "No descuidar el local fundador durante la expansión — es la 'gallina' que financia el crecimiento; si baja, todo se cae.",
    "No comprar locales en lugar de alquilarlos en año 1 — inmoviliza capital crítico para operación y marketing.",
  ],
  tags: ["expansion", "restaurante", "El-Alto", "Ansoff", "franquicia-vs-propio", "dark-kitchen", "familiar", "intermedio"],
};
