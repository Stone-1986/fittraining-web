---
name: implementar
description: Orquesta la cadena de implementación de fittraining-web — Implementador → QA → Líder Técnico, máximo 3 ciclos — sobre un plan ya aprobado por el humano. Fase 2 del flujo. Usar después de /planificar.
---

# Skill: /implementar — Fase 2

```
/implementar
```

Requiere **`outputs/plan.md` aprobado por el humano**. Si no existe, este
skill se detiene y pide correr `/planificar` primero.

---

## La cadena

```
        ┌──────────────────────────────────────────────┐
        │  outputs/plan.md  (aprobado por el humano)   │
        └──────────────────────┬───────────────────────┘
                               ▼
   ┌───────────────┐    ┌──────────┐    ┌─────────────────┐
   │ Implementador │ →  │    QA    │ →  │ Líder Técnico   │
   │  escribe src/ │    │  tests   │    │ revisa, decide  │
   └───────────────┘    └──────────┘    └────────┬────────┘
           ▲                                     │
           │         RECHAZADO (ciclo < 3)       │
           └─────────────────────────────────────┤
                                                 │ APROBADO
                                                 ▼
                                        CHECKPOINT 2 (humano)
```

Los tres corren **como subagentes** (herramienta Agent), nunca como teammates.
`settings.json` fija `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0`.

El motivo está medido en el repo de la API (EPICA-06): un teammate corre sin
los `skills:` de su frontmatter, sin `maxTurns` y **sin que disparen los hooks
`SubagentStart`/`SubagentStop`** — que aquí son justamente lo que impide que un
agente reporte trabajo que no hizo. Además, esta cadena es secuencial por
diseño y se comunica por artefactos en disco; no necesita debatir.

---

## Proceso

### Paso 0 — Verificar que se puede empezar

- ¿Existe `outputs/plan.md`? Si no → parar y pedir `/planificar`
- ¿El humano lo aprobó? Si no consta → **preguntar**, no suponer
- `git branch --show-current`: si es `main`, avisar antes de tocar nada
- `pnpm run gates` para partir de un estado conocido y limpio

### Paso 1 — Implementador

Lanzar el subagente `implementador` con: el plan, el número de ciclo y —desde
el ciclo 2— `outputs/revision_codigo.md`.

El hook `SubagentStop` no lo deja terminar si `pnpm run gates:check` no pasa.
Si el hook lo bloquea, **no relanzarlo desde cero**: usar `SendMessage` a su
nombre, que reanuda con su contexto.

### Paso 2 — QA

Lanzar el subagente `qa`. Escribe tests, valida cobertura y accesibilidad, y
produce `outputs/reporte_qa.md`.

### Paso 3 — Líder Técnico

Lanzar el subagente `lider-tecnico`. Lee `gates.json` y el reporte del QA,
revisa contra las reglas y produce `outputs/revision_codigo.md` con estado
APROBADO o RECHAZADO.

### Paso 4 — Decidir

- **APROBADO** → Paso 5
- **RECHAZADO** y ciclo < 3 → volver al Paso 1 con las instrucciones del LT
- **RECHAZADO** y ciclo = 3 → **ESCALAR AL HUMANO**. No hay ciclo 4

### Paso 4.5 — Ruta rápida

Si lo que queda es trivial y evidente (un import sin usar, un typo en una
cadena de texto), el orquestador puede corregirlo directamente en vez de gastar
un ciclo entero de tres agentes.

**Pero entonces:** volver a correr `pnpm run gates` y asegurarse de que
`reporte_qa.md` y `revision_codigo.md` queden AMBOS en `APROBADO` antes del
checkpoint. En el repo de la API se commitearon dos veces reportes en
`RECHAZADO` sobre código ya aprobado, y el historial quedó mintiendo.

### Paso 5 — Verificación del orquestador

**No confiar en los reportes.** Comprobar por cuenta propia:

```bash
pnpm run gates:check          # ¿fresco y en verde?
git status --short            # ¿qué cambió de verdad?
git diff --stat               # ¿el tamaño del cambio tiene sentido?

# Lo que `lint` NO cubre del sistema de diseño. Todo lo demás —colores,
# valores sueltos, dark:, warm, radios, sombras— ya es error de lint desde
# que existe eslint-rules/design-system.mjs, asi que si los gates estan en
# verde no hace falta buscarlo:
grep -rnE '#[0-9a-fA-F]{6}\b' src/ --include='*.css' | grep -v globals.css
grep -rn 'usted' src/app src/components --include='*.tsx'
```

Esos dos `grep` son lo único que queda sin automatizar. El primero cubre el
CSS, que ESLint no lee. El segundo el tono: un «usted» en una pantalla de
producto es un defecto, pero en `content/legal/` es lo correcto, y ninguna
regla puede distinguirlo sola.

Y leer `outputs/revision_codigo.md` con un `Read` — no fiarse del resumen que
dio el agente en su mensaje final.

Esto no es desconfianza decorativa: es la lección más cara del repo de la API,
donde nueve agentes reportaron trabajo que no habían escrito y **ninguno se
detectó por sus reportes**.

### Paso 6 — CHECKPOINT 2

Presentar al humano:

- Qué se construyó, en dos frases
- `git diff --stat`
- Los gates: `outputs/gates.json` por su `timestamp`
- **La tabla de criterios del reporte del QA**, y separada de ella la lista de
  los `[humano]` —los que la cadena no puede cerrar—, uno por línea, como
  casillas que el humano marca. Ninguno se da por bueno en su nombre
- Hallazgos no bloqueantes que quedaron documentados
- Cómo verlo: `pnpm run dev` y la ruta concreta. Y si hay criterios
  `[navegador]`, las capturas que ya existen en `outputs/capturas/`

**Parar aquí.** El commit lo decide el humano con `/commit`. Este skill nunca
ejecuta git.

---

## Gestión de ciclos

```
Ciclo 1: Implementador → QA → LT
Ciclo 2: correcciones → QA re-valida → LT re-revisa
Ciclo 3: último intento
Ciclo 4: NO EXISTE — se escala
```

Al escalar, presentar: qué error persiste, qué se instruyó en cada ciclo, qué
resultó, y la hipótesis de causa raíz del LT.

**Si el mismo error aparece en dos tareas distintas, la causa es una regla que
falta, no código que corregir.** Proponer al humano el texto para
`rulesFrontend.md`.

---

## Restricciones

- NUNCA empezar sin `outputs/plan.md` aprobado
- NUNCA lanzar los agentes como teammates
- NUNCA intentar un ciclo 4
- NUNCA ejecutar comandos git — ni el orquestador ni los agentes
- NUNCA cerrar el checkpoint con los gates en rojo o con `gates.json` viejo
- NUNCA dar por cumplido un criterio `[navegador]` o `[humano]` sin que alguien
  lo haya mirado. Se presentan abiertos; los cierra el humano
- NUNCA aceptar el resumen de un agente como evidencia de que escribió algo
- Si un agente pide instalar una dependencia → **escalar al humano**, siempre
