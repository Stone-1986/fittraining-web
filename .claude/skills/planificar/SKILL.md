---
name: planificar
description: Convierte un ítem de trabajo (W-XX) en un plan de implementación concreto que el humano aprueba antes de que nadie escriba código. Fase 1 del flujo. Usar antes de /implementar.
---

# Skill: /planificar — Fase 1

```
/planificar W-10
/planificar "la landing pública"
```

Produce **`outputs/plan.md`** y se detiene en un checkpoint humano. No escribe
ni una línea de código.

---

## Por qué existe un checkpoint antes de implementar

Porque corregir un plan cuesta un párrafo y corregir una implementación cuesta
tres ciclos de agentes. La cadena `/implementar` es cara y mecánica: hace bien
lo que se le dice. Si lo que se le dice está mal, hace mal tres veces.

Este skill es deliberadamente **ligero**. En el repo de la API la fase de
planificación involucra cuatro agentes (Analista, Arquitecto, DBA,
Documentador) porque allí hay un contrato OpenAPI, un schema de base de datos
y obligaciones legales que validar. Aquí no hay nada de eso: hay pantallas.
Montar el mismo aparato sería exactamente la sobre-ingeniería que
`rulesFrontend.md` prohíbe.

---

## Proceso

### 1. Entender qué se pide

Leer, en este orden:

- `.claude/rules/rulesFrontend.md`
- `src/app/globals.css` — qué tokens existen ya
- `src/components/ui/` — qué primitivos existen ya
- `docs/sistema_diseño/` — el canvas: la intención visual de la pieza
- `docs/sistema-de-diseno.md` — el porqué de las reglas
- El backlog o la definición del ítem, si existe

**Abrir `/estilo` es parte de este paso.** Es el sistema funcionando, y la
mitad de las veces la respuesta a «¿existe ya algo que sirva?» se ve ahí en
diez segundos.

**Preguntar al humano lo que no se pueda deducir.** Es el momento barato para
hacerlo. Preguntas típicas: ¿qué entra y qué no en esta pantalla?, ¿de dónde
salen los datos?, ¿hay un estado vacío o de error que mostrar?

### 2. Inventariar antes de proponer

La causa número uno de código duplicado es no haber mirado. Antes de proponer
un componente nuevo, buscar si ya existe algo que sirva.

### 3. Detectar lo que el sistema no cubre todavía

Si la pantalla necesita un token, un primitivo o una dependencia que no
existen, eso **es parte del plan** y necesita decisión del humano. No es un
detalle de implementación: añadir un token es una decisión del sistema.

Aquí es donde se comprueba la pieza contra el canvas. Tres preguntas
concretas, y las tres se contestan mirando, no recordando:

- ¿El canvas dibuja esta pieza? Si sí, el plan la referencia por su sección
  («§ 07, tarjeta de plan») en vez de describirla otra vez
- ¿Todo lo que pide tiene token? Un color, un tamaño de texto, un tracking o
  un radio sin token es una decisión del sistema que sube al checkpoint
- ¿El canvas se contradice consigo mismo o con WCAG? Ya pasó tres veces (ver
  § Accesibilidad de las reglas). Si vuelve a pasar, el plan lo dice y propone
  la corrección; no lo hereda en silencio

### 3.b El contraste, si hay color nuevo

Si el plan añade o cambia un color, **medir el contraste es parte del plan**,
no del QA. Mínimo AA: 4.5:1 texto normal, 3:1 texto grande y límites de
controles. Un token que llega al Implementador sin su número medido llega a
producción sin él.

### 4. Escribir `outputs/plan.md`

```markdown
# Plan — <W-XX> <título>

## Qué se construye

Dos o tres frases. Qué ve el usuario y para qué sirve.

## Qué NO entra

Lo que deliberadamente queda fuera. Evita que la cadena lo agregue por su cuenta.

## Rutas

| Ruta | Tipo | Notas |
| ---- | ---- | ----- |

## Componentes

### Ya existen y se reutilizan

- `Button`, `Container`, ...

### Nuevos

| Componente | Ubicación | Servidor/Cliente | Por qué |
| ---------- | --------- | ---------------- | ------- |

Si alguno es de cliente, justificar por qué no se resuelve con CSS o HTML nativo.

## Datos

De dónde salen. Si vienen de la API, qué módulo de `src/lib/api/` los expone.
Si todavía no hay API, decirlo explícitamente.

## Lo que el sistema de diseño no cubre

- <token / primitivo / dependencia que falta y hay que decidir>
- <contradicción entre el canvas y las reglas, con la corrección propuesta>

## Tono

Confirmar que la copy tutea (el producto tutea; solo `content/legal/` va en
«usted») y que las mayúsculas completas se quedan en botones, etiquetas y
metadatos.

## Criterios de aceptación

Lo que el QA va a verificar. Concretos y comprobables.

- [ ] ...
- [ ] Accesibilidad: <lo específico de esta pantalla>

## Riesgos

Lo que puede salir mal y qué haríamos.
```

### 5. Presentar y parar

Mostrar el plan al humano en la terminal, resumido. **CHECKPOINT: no invocar
`/implementar` por iniciativa propia.** El humano aprueba, corrige o rechaza.

---

## Cuándo NO usar este skill

Para un cambio de una línea, un arreglo de formato o un ajuste de copy.
Planificar eso cuesta más que hacerlo. El flujo de agentes es para trabajo de
tamaño pantalla, no para cualquier edición.

---

## Restricciones

- NUNCA escribir código en esta fase
- NUNCA invocar `/implementar` sin aprobación explícita del humano
- NUNCA dar por supuesto un token o un componente sin haber verificado que existe
- NUNCA copiar un hexadecimal del canvas al plan: el canvas es una maqueta. Se
  nombra el token, y si no hay token, se dice que falta
- NUNCA proponer copy en «usted» para una pantalla de producto
- NUNCA proponer una dependencia nueva sin decir qué problema resuelve y qué
  alternativa sin dependencia se descartó
