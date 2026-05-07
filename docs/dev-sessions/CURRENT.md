# Estado actual de desarrollo

## Ultima sesion

- [2026-05-07-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/WEBAPP/WEBAPP/docs/dev-sessions/2026-05-07-sesion-01.md)

## Estado actual

- El panel admin ya fue redisenado a una linea sobria tipo bunker estrategico.
- El flujo de proyectos del usuario diferencia entre ocultar, restaurar y eliminar definitivamente desde admin.
- La configuracion de IA por servicio ahora genera alertas para admin cuando un proveedor se queda sin tokens, cuota o capacidad, sin cambiar automaticamente a otra API.
- El flujo de `/projects/new` ya fue reforzado para no depender solo de memoria local cuando un proyecto nace en Supabase.
- `mono-001` quedo configurado manualmente con Groq `llama-3.3-70b-versatile` despues de probar que Gemini estaba sin cuota y OpenAI tenia key invalida.
- Las reglas editoriales globales del documento quedaron en `workspacePrompts.hilos` y son visibles/editables desde `Admin > Prompts del Workspace`.
- El admin ahora tiene prompt editable `Edicion por Chat`; el chat del workspace aplica observaciones puntuales con `/api/projects/edit-phase-section` cuando la fase ya tiene contenido, evitando regenerar todo el capitulo.
- El PDF ahora separa capitulos del documento final consolidado en hojas distintas, evita titulos huerfanos, deduplica referencias al renderizar y crea indices de tablas/figuras/graficos cuando detecta captions.
- El login admin ahora muestra error claro si `ADMIN_PASSWORD` no esta configurada en Vercel y confirma `/api/admin/auth/check` antes de navegar al panel.
- `mono-001` local ahora apunta a `LM Studio Local / google/gemma-4-e4b`, que coincide con el ID real del modelo cargado en LM Studio.

## Enfoques o reglas vigentes

- No hacer auto-switch de proveedor de IA. El sistema solo alerta; el cambio lo decide el admin.
- Borrado del usuario final significa ocultar/archivar, no destruir.
- El admin puede restaurar proyectos ocultados por usuario.
- El admin tambien puede eliminar definitivamente proyectos de prueba desde `Admin > Proyectos`.
- Esta carpeta debe actualizarse al cierre de cada bloque importante de trabajo.
- Registro de fallos/bugs conocidos: `.agent/skills/bug-registry/SKILL.md`.
- Para probar admin desde celular en Vercel, `ADMIN_PASSWORD` debe existir en el mismo environment del deploy usado: Preview para links `webapp-git-...`, Production para dominio final.

## Problemas abiertos

- Gemini `gemini-2.5-pro` respondio `429 RESOURCE_EXHAUSTED` por cuota free tier agotada.
- OpenAI `gpt-4o-mini` respondio key invalida con la key guardada actualmente.
- Seguir verificando estabilidad de Groq para generaciones mas largas, especialmente fases finales y bibliografia.
- Seguir observando el flujo `/projects/new` despues de los ajustes recientes para descartar otro borde entre Supabase y memoria.
- Extender el mismo lenguaje visual del nuevo admin a secciones que aun conservan estilo anterior.
- `npm run lint` sigue fallando por deuda amplia no abordada: incluye scripts dentro de `.agents/.claude` y reglas React/Next en paginas/componentes existentes.
- Admin login tiene historial `BUG-001`; causa nueva documentada: Vercel Preview puede tener `ADMIN_PASSWORD` ausente o distinta a `.env.local`.
- Proyecto borrado que reaparece quedo documentado como `BUG-006`; causa: memoria cacheada de proyectos no recargaba la marca persistida de oculto.
- Fase que genera solo referencias/anexos quedo documentada como `BUG-007`; causa: deteccion de fase de referencias miraba el prompt completo en vez del nombre de la fase.
- Si vuelve a aparecer error de LM Studio cargando modelo, revisar que el ID guardado sea exactamente el que muestra LM Studio, por ejemplo `google/gemma-4-e4b`.

## Siguiente paso recomendado

- En local, probar de nuevo `/projects/new` con LM Studio abierto. Si el servidor ya estaba corriendo con cache vieja, reiniciar `npm run dev` o guardar otra vez la config desde `Admin > Modelos & APIs`.

## Historial reciente

- [2026-05-07-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/WEBAPP/WEBAPP/docs/dev-sessions/2026-05-07-sesion-01.md)
- [2026-05-06-sesion-02.md](C:/Users/lmigu/Desktop/WEBAPP/WEBAPP/WEBAPP/docs/dev-sessions/2026-05-06-sesion-02.md)
- [2026-05-06-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/WEBAPP/WEBAPP/docs/dev-sessions/2026-05-06-sesion-01.md)
