# Estado actual de desarrollo

## Ultima sesion

- [2026-05-06-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/docs/dev-sessions/2026-05-06-sesion-01.md)

## Estado actual

- El panel admin ya fue redisenado a una linea sobria tipo bunker estrategico.
- El flujo de proyectos del usuario diferencia entre ocultar, restaurar y eliminar definitivamente desde admin.
- La configuracion de IA por servicio ahora genera alertas para admin cuando un proveedor se queda sin tokens, cuota o capacidad, sin cambiar automaticamente a otra API.
- El flujo de `/projects/new` ya fue reforzado para no depender solo de memoria local cuando un proyecto nace en Supabase.

## Enfoques o reglas vigentes

- No hacer auto-switch de proveedor de IA. El sistema solo alerta; el cambio lo decide el admin.
- Borrado del usuario final significa ocultar/archivar, no destruir.
- El admin puede restaurar proyectos ocultados por usuario.
- El admin tambien puede eliminar definitivamente proyectos de prueba desde `Admin > Proyectos`.
- Esta carpeta debe actualizarse al cierre de cada bloque importante de trabajo.

## Problemas abiertos

- Verificar en uso real que Gemini o el proveedor elegido responda estable para `mono-001`.
- Seguir observando el flujo `/projects/new` despues de los ajustes recientes para descartar otro borde entre Supabase y memoria.
- Extender el mismo lenguaje visual del nuevo admin a secciones que aun conservan estilo anterior.

## Siguiente paso recomendado

- Probar de punta a punta `Admin > Modelos & APIs` y luego `/projects/new` para confirmar que el proveedor activo ya permite generar rutas sin errores de acceso ni de modelo.

## Historial reciente

- [2026-05-06-sesion-01.md](C:/Users/lmigu/Desktop/WEBAPP/docs/dev-sessions/2026-05-06-sesion-01.md)
