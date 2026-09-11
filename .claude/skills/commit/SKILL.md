---
name: commit
description: Crea commits estandarizados de fittraining-web con Conventional Commits, staging revisado y trazabilidad del ítem de trabajo (W-XX). Usar para cualquier commit del repo.
---

# Skill: /commit — Commits estandarizados

## Uso

```
/commit                 # Interactivo — pregunta tipo, scope y descripción
/commit feat W-10       # Directo — feat(W-10), descripción por definir
/commit fix legal       # Directo — fix(legal)
```

---

## Por qué este skill ejecuta git y ningún agente lo hace

`rulesFrontend.md § Git` dice que git lo opera exclusivamente el humano.
`/commit` es la **única excepción**, y lo es por un motivo concreto: lo invoca
el humano de forma explícita, con un `/`, y no puede dispararse desde dentro de
una cadena de agentes. La excepción está en la invocación, no en el permiso.

---

## Tipos (Conventional Commits)

| Prefijo           | Uso                                                    |
| ----------------- | ------------------------------------------------------ |
| `feat(scope)`     | Funcionalidad nueva                                    |
| `fix(scope)`      | Corrección de un defecto                               |
| `refactor(scope)` | Cambio interno sin cambio de comportamiento            |
| `docs(scope)`     | Documentación                                          |
| `chore(scope)`    | Mantenimiento, dependencias, configuración             |
| `test(scope)`     | Tests                                                  |
| `style(scope)`    | Solo formato o sistema de diseño, sin cambio funcional |

**Scope:** el ítem de trabajo (`W-10`, `W-D3`) cuando el commit cierra uno; si
no, el área tocada (`legal`, `ui`, `amplify`, `deps`).

---

## Flujo paso a paso

```
1. `git status` y `git diff --stat`. Mostrar el estado al humano.
   Si no hay nada que commitear, informar y salir.

2. `git branch --show-current`.
   Si es `main`, AVISAR: el trabajo va en `develop` y llega a `main` por PR.
   Preguntar si continuar o cambiar de rama.

3. Preguntar tipo y scope (AskUserQuestion), salvo que vengan como argumento.

4. Proponer la descripción leyendo el diff. En español, minúsculas, sin punto
   final, máximo 72 caracteres en la primera línea.

5. Determinar los archivos a stagear y FILTRAR los prohibidos:
   - `outputs/`     (gitignored: se regenera, su valor es el mtime local)
   - `coverage/`    (gitignored)
   - `.next/`, `node_modules/`, `*.tsbuildinfo`, `*.log`
   - Cualquier `.env` con valores reales
   - `*:Zone.Identifier`

6. Si el commit CIERRA un ítem (W-XX), archivar antes (ver abajo).

7. Mostrar el resumen completo: archivos, mensaje, rama.
   Pedir confirmación (AskUserQuestion: Confirmar / Cancelar).

8. Si confirma: `git add <archivos>` y `git commit`.
   Mostrar el resultado.
```

---

## Al cerrar un ítem: archivar la evidencia

Cuando el commit **cierra** un ítem de trabajo —no en cada commit del ítem, solo
en el último— sus artefactos se copian a `docs/evidencia/W-XX/`, que está en
git, y entran en ese mismo commit:

```bash
mkdir -p docs/evidencia/W-XX
cp specs/W-XX.md            docs/evidencia/W-XX/spec.md
cp outputs/reporte_qa.md    docs/evidencia/W-XX/reporte_qa.md
cp outputs/revision_codigo.md docs/evidencia/W-XX/revision_codigo.md
cp outputs/gates.json       docs/evidencia/W-XX/gates.json
```

**Por qué.** Los tres artefactos de `outputs/` se sobrescriben en la corrida
siguiente, y los reportes se citan entre sí por `timestamp`. Sin este paso, un
reporte que dice «gates.json @ 00:47:10Z» apunta a un archivo que ya no existe
—ya pasó, con los dos reportes de W-10— y la revisión de un ítem deja de poder
auditarse en cuanto empieza el siguiente.

Copiar el `gates.json` **que los reportes citan**, no el último: si no
coinciden, el archivo lo dice y eso también es información.

El `spec.md` se archiva y **se retira de `specs/`** en el mismo commit:
`specs/` es para lo vivo.

---

## Antes de commitear código: los gates

Este repo **no tiene hook de pre-commit**. Nada impide mecánicamente commitear
algo roto: el gate vive en CI (`.github/workflows/gates.yml`), que corre en
cada push a `develop` y en cada PR a `main`.

Por eso, si el commit toca `src/`, `scripts/` o configuración:

1. Comprobar `pnpm run gates:check`
2. Si dice que el JSON está viejo o en rojo → **avisar al humano y ofrecer
   correr `pnpm run gates`** antes de commitear
3. Si el humano decide commitear igual, se respeta: es su repo y CI lo
   atrapará. Pero se le dice qué está en rojo, no se calla

Un commit de solo documentación, de `.claude/` o de `docs/` no necesita gates.

---

## Formato de los mensajes

```
<tipo>(<scope>): <descripción>
```

Reglas:

- `tipo` en minúsculas
- `descripción` en español, en minúsculas, sin punto final
- Máximo 72 caracteres la primera línea
- Cuerpo opcional: el **porqué**, no el qué. El qué ya está en el diff

Ejemplos reales del repo:

```
feat(W-11): publicar los cinco documentos en un solo hub
feat(W-D3): definir el sistema de diseño y sus tokens
chore(ci): correr los gates en cada PR y adoptar la rama develop
docs(amplify): un cambio de caché tarda dos builds en verse
test(legal): cubrir el borrado de comentarios internos
fix(ui): el h1 del índice legal usaba tamaño de párrafo
```

---

## Protecciones

- NUNCA stagear `.env` con valores reales, `node_modules/`, `.next/`,
  `outputs/`, `coverage/` ni `*.tsbuildinfo`. La **copia** en
  `docs/evidencia/W-XX/` sí se commitea: ahí está el sentido de copiarla
- SIEMPRE mostrar `git status` y el resumen ANTES de pedir confirmación
- NUNCA usar `git commit --no-verify`
- NUNCA hacer `git push` sin que el humano lo pida de forma explícita
- NUNCA hacer `git add -A` a ciegas: se listan los archivos y se muestran
- Si no hay cambios, informar y salir sin hacer nada
