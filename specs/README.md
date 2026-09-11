# specs/ — el contrato de cada ítem de trabajo

Aquí vive el plan de cada ítem (`W-10.md`, `W-12.md`), **en git**, desde que
`/planificar` lo escribe hasta que el ítem se cierra. Es el documento contra
el que el QA verifica y contra el que el Líder Técnico revisa.

## Por qué está en git y no en `outputs/`

Porque `outputs/` está en `.gitignore` y se regenera. Mientras el plan vivió
ahí pasaron tres cosas, y las tres están medidas:

1. **Las citas dejaron de resolver.** El QA y el Líder Técnico referenciaban
   `gates.json @ 00:47:10Z` y una excepción en `plan.md:281`. Hoy ninguno de
   los dos existe: el JSON se sobrescribió y la línea 281 del plan habla de
   otra cosa desde que se enmendó.
2. **El plan se contradijo a sí mismo y nadie lo vio.** La «Revisión 2» de
   W-10 borró la sección de planes prefijando un bloque al principio y dejando
   el cuerpo intacto, así que `§ Qué se construye` siguió prometiendo «los
   tipos de plan y sus datos concretos» y el criterio nº 1 siguió listándolos.
   De esa contradicción salió el hallazgo H-2 del QA — un texto de producto que
   afirmaba un plan inventado— y el QA acertó al diagnosticarlo: «el conflicto
   es entre dos frases del propio plan».
3. **Las decisiones se perdieron.** D-5 aprobó el logotipo a `text-h4` y una
   decisión posterior lo cambió a tokens propios. La única memoria de por qué
   acabaron siendo dos tokens son los comentarios del CSS, porque el plan que
   lo explicaba se iba a regenerar.

## Una sola copia, y se edita

**No hay «borrador» aparte.** Dos copias del mismo contrato es la deriva que
este directorio existe para evitar: acaba una diciendo una cosa y la otra otra,
y nadie sabe cuál manda.

**Una enmienda se edita EN EL CUERPO, nunca se prefija.** Si el alcance cambia:

- Se reescribe la sección afectada, no se añade un bloque al principio que diga
  «lo de abajo ya no vale».
- Una decisión superada se marca **en su sitio**, con fecha y con lo que la
  sustituye: `**D-5 · SUPERSEDIDA el 2026-09-09 por …**`. No se borra: quien
  lea el spec dentro de un mes necesita saber que se intentó.
- Los criterios de aceptación afectados se reescriben con su verificador. Un
  criterio que sobrevive a un cambio de alcance sin revisarse es el mecanismo
  exacto de H-2.

El spec debe poder leerse de arriba abajo sin producir un defecto. Si al
terminar de leerlo alguien construiría algo que ya no se quiere, está mal
enmendado.

## Ciclo de vida

```
/planificar  →  specs/W-XX.md            (borrador; el humano aprueba o corrige)
               ↓  CHECKPOINT 1
/implementar →  la cadena trabaja contra él
               ↓  CHECKPOINT 2
/commit      →  docs/evidencia/W-XX/     (se archiva al cerrar el ítem)
```

Al cerrar, el spec y los artefactos de la cadena —`reporte_qa.md`,
`revision_codigo.md` y el `gates.json` que citan— se copian a
`docs/evidencia/W-XX/`. El spec **se queda también aquí** mientras el ítem
siga vivo; se retira de `specs/` cuando esté cerrado y archivado.

## Lo que NO vive aquí

- **Los artefactos de cada corrida** —`gates.json`, `reporte_qa.md`,
  `revision_codigo.md`—. Se regeneran en cada ciclo y su valor es el `mtime`
  local; siguen en `outputs/`, y solo se archivan al cerrar.
- **Las reglas del repo.** Un spec dice qué se construye en un ítem; lo que es
  válido siempre está en `.claude/rules/rulesFrontend.md`.
- **Las decisiones de diseño del sistema.** Esas van a
  `docs/sistema-de-diseno.md`, que no se regenera.
