# W-10 · La landing pública — archivo

Los artefactos de la cadena, copiados el 2026-09-10 desde `outputs/`, que está
gitignored y se sobrescribe en cada corrida. Es la primera aplicación del paso
de archivado que introdujo el ítem 9 de `docs/mejoras-del-proceso.md`.

| Archivo                | Qué es                                                |
| ---------------------- | ----------------------------------------------------- |
| `spec.md`              | El plan, tal como quedó. Era `outputs/plan.md`        |
| `reporte_qa.md`        | El reporte del QA de la revisión 2                    |
| `revision_codigo.md`   | La revisión del Líder Técnico que cerró el ítem       |
| `gates.json`           | Ver el aviso de abajo                                 |

## Dos avisos, y los dos son el motivo de que este directorio exista

**1. El `gates.json` de aquí NO es el que citan los reportes.** El QA cita
`@ 2026-09-09T00:47:10.080Z` y el Líder Técnico `@ 2026-09-09T01:28:57.647Z`.
Ninguno de los dos existe: se sobrescribieron antes de que hubiera un paso de
archivado. El que se conserva es el del momento del archivo. La regla de «no
transcribir números, referenciarlos por su `timestamp`» es correcta, pero
mientras el destino de la referencia fue un archivo regenerable, las citas
apuntaban al vacío.

**2. El `spec.md` se contradice a sí mismo, y se archiva así a propósito.** La
«Revisión 2» se añadió como bloque al principio y el cuerpo se dejó intacto:
`§ Qué se construye` sigue prometiendo «los tipos de plan y sus datos
concretos» y el criterio de aceptación nº 1 sigue listando la sección de
planes, que esa misma revisión eliminó. De ahí salió el hallazgo **H-2** del
QA, y su diagnóstico fue exacto: «el conflicto es entre dos frases del propio
plan». No se corrige aquí —un archivo que se edita deja de ser evidencia—;
la corrección es la regla de enmienda de `specs/README.md`.

Tampoco hay `specs/W-10.md`: el ítem estaba terminado cuando se creó el
directorio, así que su contrato es historia y vive aquí. `specs/` empieza
limpio con el ítem siguiente.
