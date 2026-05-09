# Estado actual de desarrollo

## Ultima sesion

- [2026-05-09-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/WEBAPP/WEBAPP/docs/dev-sessions/2026-05-09-sesion-01.md)

## Estado actual

- El panel admin ya fue redisenado a una linea sobria tipo bunker estrategico.
- El flujo de proyectos del usuario diferencia entre ocultar, restaurar y eliminar definitivamente desde admin.
- La configuracion de IA por servicio ahora genera alertas para admin cuando un proveedor se queda sin tokens, cuota o capacidad, sin cambiar automaticamente a otra API.
- El flujo de `/projects/new` ya fue reforzado para no depender solo de memoria local cuando un proyecto nace en Supabase.
- `mono-001` quedo configurado manualmente con Groq `llama-3.3-70b-versatile` despues de probar que Gemini estaba sin cuota y OpenAI tenia key invalida.
- La prueba por API de `/api/projects/route-options` devolvio 3 rutas validas con Groq y `/api/projects/select-route` guardo correctamente la ruta elegida.
- `npm run build` pasa despues de corregir errores de tipado en referencias, generacion/finalizacion de proyectos, shape de servicios locales e incidentes de IA.
- Borrar proyectos desde `/dashboard` ya persiste la marca local `oculto_por_usuario` y `/api/projects` recarga `.store/data.json` antes de listar, para que no reaparezcan al refrescar.
- La generacion de fases ya no confunde Capitulo I con la fase de referencias solo porque el prompt maestro menciona bibliografia APA o `REFERENCIAS_ETAPA`.
- Para pruebas locales sin limites de Groq, el admin ahora tiene proveedor `LM Studio Local` apuntando a `http://localhost:1234/v1/chat/completions` con modelo `gemma-4-e4b-uncensored-hauhaucs-aggressive`.
- Solo `mono-001` quedo temporalmente configurado en admin para usar `LM Studio Local`. No asignar modelos a otros servicios sin instruccion explicita del usuario.
- Las reglas editoriales globales del documento quedaron en `workspacePrompts.hilos` y son visibles/editables desde `Admin > Prompts del Workspace`.
- El admin ahora tiene prompt editable `Edicion por Chat`; el chat del workspace aplica observaciones puntuales con `/api/projects/edit-phase-section` cuando la fase ya tiene contenido, evitando regenerar todo el capitulo.
- El PDF ahora separa capitulos del documento final consolidado en hojas distintas, evita titulos huerfanos, deduplica referencias al renderizar y crea indices de tablas/figuras/graficos cuando detecta captions.
- SCRIBE ahora incluye el tipo predefinido `Demostracion de competencias`, con fases propias, formulario inicial para materia/reto/competencias/problematica/evidencias, tarjeta visible en `/dashboard` y deep link `/projects/new?tipo=tipo-demostracion-competencias`. No se creo un hijo nuevo de NUCLEO.
- `npm run build` vuelve a pasar completo en local despues de restaurar la coherencia del flujo guiado en `workspace/page.tsx` y `/api/projects/generate-phase`: la UI acepta `tipo`/`feedback`, los borradores se guardan como `phase_id_borrador` y la version final incorpora feedback.

## Enfoques o reglas vigentes

- No hacer auto-switch de proveedor de IA. El sistema solo alerta; el cambio lo decide el admin.
- Borrado del usuario final significa ocultar/archivar, no destruir.
- El admin puede restaurar proyectos ocultados por usuario.
- El admin tambien puede eliminar definitivamente proyectos de prueba desde `Admin > Proyectos`.
- Esta carpeta debe actualizarse al cierre de cada bloque importante de trabajo.
- Registro de fallos/bugs conocidos: `.agent/skills/bug-registry/SKILL.md`.

## Problemas abiertos

- Gemini `gemini-2.5-pro` respondio `429 RESOURCE_EXHAUSTED` por cuota free tier agotada.
- OpenAI `gpt-4o-mini` respondio key invalida con la key guardada actualmente.
- Seguir verificando estabilidad de Groq para generaciones mas largas, especialmente fases finales y bibliografia.
- Seguir observando el flujo `/projects/new` despues de los ajustes recientes para descartar otro borde entre Supabase y memoria.
- Extender el mismo lenguaje visual del nuevo admin a secciones que aun conservan estilo anterior.
- `npm run lint` sigue fallando por deuda amplia no abordada en esta sesion: incluye scripts dentro de `.agents/.claude` y reglas React/Next en paginas/componentes existentes.
- Admin login tenia bug recurrente documentado como `BUG-001`: `localStorage.adminAuthed` podia quedar viejo aunque la cookie `admin_session` ya no existiera, causando bucle `/admin` -> `/admin/login`.
- Proyecto borrado que reaparece quedo documentado como `BUG-006`; causa: memoria cacheada de proyectos no recargaba la marca persistida de oculto.
- Fase que genera solo referencias/anexos quedo documentada como `BUG-007`; causa: deteccion de fase de referencias miraba el prompt completo en vez del nombre de la fase.
- Esta configuracion LM Studio es solo para desarrollo local. Para produccion, el usuario decide desde `Admin > Modelos & APIs` que proveedor/modelo usa cada servicio con su API real.
- `BUG-008` documenta el nuevo flujo de edicion puntual por chat y los problemas de PDF: titulos huerfanos, referencias repetidas e indices incompletos.
- `npx tsc --noEmit` sigue reportando deuda fuera del build en `tests/axiom/evaluador.test.ts`: faltan tipos/globals de runner para `describe`, `it` y `expect`.

## Siguiente paso recomendado

- Reintentar el deploy en Vercel y, despues, probar desde la UI la creacion de un documento de demostracion de competencias, cargar evidencias y generar borrador/final en modo guiado.

## Historial reciente

- [2026-05-09-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/WEBAPP/WEBAPP/docs/dev-sessions/2026-05-09-sesion-01.md)
- [2026-05-08-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/docs/dev-sessions/2026-05-08-sesion-01.md)
- [2026-05-06-sesion-02.md](C:/Users/lmigu/Desktop/WEBAPP/WEBAPP/WEBAPP/docs/dev-sessions/2026-05-06-sesion-02.md)
- [2026-05-06-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/WEBAPP/WEBAPP/docs/dev-sessions/2026-05-06-sesion-01.md)
