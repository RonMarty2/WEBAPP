# Diseño: Bitácora de handoff por fecha y sesión

Fecha: 2026-05-06
Estado: propuesto y listo para revisión

## Objetivo

Crear una convención de trabajo dentro del repositorio para que, al cambiar entre PC y portátil, exista un rastro claro de:

- qué se hizo en cada bloque importante;
- qué decisiones se tomaron;
- qué quedó pendiente;
- qué cosas no debemos romper;
- cuál es el siguiente paso recomendado.

Esto no forma parte del SaaS ni de la experiencia del usuario final. Es una capa de continuidad para el proceso de desarrollo del SaaS.

## Alcance

La solución cubre:

- una carpeta dedicada a sesiones de desarrollo;
- un archivo por sesión con fecha y número de sesión;
- un índice vivo con el estado actual del proyecto;
- una convención de actualización al cierre de cada bloque importante.

La solución no cubre por ahora:

- automatización por git hooks;
- detección automática del dispositivo;
- sincronización externa fuera del repositorio;
- integración con el panel admin o con la app web.

## Estructura propuesta

Se agregará esta estructura:

```text
docs/
  dev-sessions/
    CURRENT.md
    2026-05-06-sesion-01.md
```

### `CURRENT.md`

Será el punto de entrada rápido cuando se abra el proyecto desde otro equipo. Debe responder en menos de un minuto:

- cuál es la última sesión activa;
- qué estado general tiene el proyecto;
- qué problemas siguen abiertos;
- qué tarea conviene retomar primero;
- qué alertas o decisiones delicadas siguen vigentes.

### Archivos por sesión

Formato:

```text
YYYY-MM-DD-sesion-NN.md
```

Ejemplos:

- `2026-05-06-sesion-01.md`
- `2026-05-06-sesion-02.md`

Cada archivo representa una tanda real de trabajo. No debe convertirse en un diario caótico; debe ser un handoff técnico legible.

## Plantilla de sesión

Cada archivo de sesión usará estas secciones:

1. `Contexto de inicio`
2. `Qué hicimos`
3. `Decisiones tomadas`
4. `Bugs resueltos`
5. `Pendientes`
6. `Riesgos / no romper`
7. `Próximo paso recomendado`

Reglas de escritura:

- lenguaje corto y técnico;
- nada de narración innecesaria;
- referenciar archivos o rutas cuando ayude;
- dejar muy claro qué quedó estable y qué sigue frágil;
- si hubo una decisión importante, anotar la razón.

## Plantilla de `CURRENT.md`

`CURRENT.md` tendrá estas secciones:

1. `Última sesión`
2. `Estado actual`
3. `Enfoques o reglas vigentes`
4. `Problemas abiertos`
5. `Siguiente paso recomendado`
6. `Historial reciente`

`Historial reciente` solo enlaza las últimas sesiones; no duplica todo el contenido.

## Flujo operativo

### Al cierre de un bloque importante

Se hará lo siguiente:

1. crear o actualizar el archivo de sesión del bloque actual;
2. resumir lo importante en formato de handoff;
3. actualizar `CURRENT.md` para que apunte a esa sesión;
4. dejar explícito el siguiente paso recomendado.

### Al retomar en otro equipo

Se hará lo siguiente:

1. abrir `docs/dev-sessions/CURRENT.md`;
2. revisar la última sesión enlazada;
3. usar ese contexto como base para continuar sin perder el hilo.

## Criterios de éxito

La solución será correcta si:

- al abrir el repo en otro equipo, el punto de entrada es obvio;
- la última sesión permite entender el estado real sin leer todo el código;
- las decisiones delicadas quedan registradas;
- el hábito es lo bastante liviano como para sostenerse de forma constante.

## Riesgos y mitigaciones

### Riesgo: el log se abandona

Mitigación:

- mantener el formato breve;
- usarlo solo al cierre de bloques importantes;
- centralizar el arranque en `CURRENT.md`.

### Riesgo: demasiada verbosidad

Mitigación:

- priorizar decisiones, pendientes y riesgos;
- evitar copiar salidas completas de terminal;
- enlazar archivos relevantes en vez de repetir demasiado contexto.

### Riesgo: una sola sesión termine mezclando demasiadas cosas

Mitigación:

- abrir una nueva sesión si cambia el foco del trabajo o si el bloque crece demasiado;
- mantener numeración por fecha.

## Implementación recomendada

La implementación inicial debe hacer solo esto:

1. crear `docs/dev-sessions/`;
2. crear `docs/dev-sessions/CURRENT.md`;
3. crear la primera sesión base de hoy;
4. adoptar la convención como hábito de cierre.

No hace falta automatización todavía. Primero debemos probar que el formato realmente ayude al cambio entre dispositivos.

## Decisión recomendada

Adoptar la solución con:

- sesiones por fecha y número;
- `CURRENT.md` como punto de entrada;
- actualización manual como hábito al cierre de bloques importantes.

Es la opción con mejor equilibrio entre utilidad real, claridad y bajo costo de mantenimiento.
