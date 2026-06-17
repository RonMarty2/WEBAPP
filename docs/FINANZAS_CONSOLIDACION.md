# Consolidacion financiera WEBAPP -> simuladorPRO

Fecha: 2026-06-17

## Decision arquitectonica

WEBAPP conserva la interfaz financiera y academica, pero deja de tener un
cerebro financiero propio. La fuente oficial de calculos es `simuladorPRO`.

WEBAPP no debe calcular localmente:

- VAN
- TIR
- WACC
- flujo de caja
- punto de equilibrio
- amortizacion
- payback
- sensibilidad o escenarios recalibrados
- IVA, IT, IUE ni saldos de credito fiscal

## Que se migro hacia simuladorPRO

| Mejora que existia en WEBAPP | Destino |
|---|---|
| TIR con fallback robusto | `simuladorPRO/src/lib/calculo-financiero.ts` |
| Payback descontado | `simuladorPRO/src/lib/calculo-financiero.ts` |
| Punto de equilibrio | `simuladorPRO/src/lib/calculo-financiero.ts` |
| Amortizacion francesa, alemana y americana | `simuladorPRO/src/lib/calculo-financiero.ts` |
| Flujo libre academico | `simuladorPRO/src/lib/finanzas/proyecto-financiero.ts` |
| Sensibilidad con escenarios alternativos | `simuladorPRO/src/lib/finanzas/sensibilidad.ts` |
| Helper runtime financiero | `simuladorPRO/src/lib/finanzas/api-contract.ts` |
| Separacion tributaria IVA/IT/IUE en flujo financiero | `simuladorPRO/src/lib/calculo-financiero.ts` y `simuladorPRO/src/lib/finanzas/proyecto-financiero.ts` |

## Que ya existia en simuladorPRO

- Aportes patronales Bolivia.
- IUE, IT e IVA. Se reforzo el motor para separar IT e IUE en resultado e
  IVA neto como efecto de caja con credito fiscal.
- Prestamo de activo fijo y prestamo de capital de trabajo.
- Costos directos por producto.
- IR, TRC, RBC y servicio de deuda.
- Simulacion de eventos y comparativo final.

## Que se elimino de WEBAPP

- `src/lib/proyectoGrado/calculos.ts`
- `src/lib/proyectoGrado/calculos.test.ts`
- `src/lib/finanzas/*` excepto `simuladorProClient.ts`.
- `src/components/finanzas/*` excepto `SimuladorProBridge.tsx`.
- `src/types/finanzas/*`, `src/stores/finanzas/*` y `src/hooks/finanzas/*`.
- `src/app/api/finanzas/perfil/route.ts`.

## Que queda en WEBAPP

- UI academica.
- Entrada `/finanzas/*` como bridge visual hacia `simuladorPRO`.
- Prompts y renderizado de Cap. 4f / Cap. 4g.
- Adaptador cliente en `src/lib/finanzas/simuladorProClient.ts`.
- `runtime-helpers.ts` como orquestador, no como calculadora.

Ese adaptador es el unico rastro tecnico permitido del cerebro financiero en
WEBAPP: no contiene formulas, solo prepara la llamada al motor externo.

## Como debe conectarse WEBAPP con simuladorPRO

Configurar:

```txt
NEXT_PUBLIC_SIMULADOR_PRO_FINANZAS_URL=https://...simulador-pro...
```

WEBAPP debe llamar:

```txt
POST /api/finanzas/evaluar
```

Ese endpoint ya existe en `simuladorPRO/api/finanzas/evaluar.ts`; WEBAPP solo
necesita la URL publica de despliegue de `simuladorPRO`.

Payload:

```ts
{
  version?: "2026-06-17",
  proyecto: unknown,
  incluirSensibilidad?: boolean
}
```

Mientras la URL publica no este configurada, el adaptador devuelve un mock
temporal sin calculos. Ese mock solo sirve para mostrar estado pendiente de
conexion.

## Archivos modificados en WEBAPP

- `.env.example`
- `docs/FINANZAS_CONSOLIDACION.md`
- `docs/PATRON_PROYECTO_GRADO.md`
- `src/lib/finanzas/simuladorProClient.ts`
- `src/components/finanzas/SimuladorProBridge.tsx`
- `src/app/finanzas/**`
- `src/lib/proyectoGrado/runtime-helpers.ts`
- `src/lib/prompts/proyectoGrado/cap4f-financiero.ts`
- `src/lib/prompts/proyectoGrado/cap4g-evaluacion.ts`

## Pendiente

- Desplegar `simuladorPRO` con `/api/finanzas/evaluar`.
- Configurar `NEXT_PUBLIC_SIMULADOR_PRO_FINANZAS_URL` en WEBAPP.
- Sustituir el parser markdown del selector de sensibilidad por datos
  estructurados del contrato cuando el endpoint este disponible.
