#!/bin/sh
# SubagentStop: un agente no puede terminar si no hizo lo que reporta.
#
#   implementador -> `pnpm run gates:check` debe pasar: outputs/gates.json
#                    fresco (posterior a todo src/, scripts/, config) y en verde.
#   qa            -> outputs/reporte_qa.md con mtime POSTERIOR a su arranque.
#   lider-tecnico -> outputs/revision_codigo.md, idem.
#
# POR QUE ESTO ES UN HOOK Y NO UNA LINEA MAS EN LAS REGLAS: en el repo de la
# API la regla "verifica contra el disco antes de reportar" estaba escrita, y
# aun asi nueve agentes reportaron trabajo que no habian escrito — seis de
# ellos en una sola epica. Ninguno se detecto por sus reportes; todos por
# verificacion externa. Una regla en prosa que ya fallo no mejora por
# repetirse: se mecaniza o no existe.
#
# exit 2 + stderr = Claude Code NO deja terminar al subagente y le entrega el
# texto como siguiente mensaje, asi que el agente puede corregir en el momento.
#
# Tope de 2 bloqueos por agente: al tercer intento se deja pasar para que un
# caso legitimo no quede en bucle. El humano sigue verificando por su cuenta;
# esto solo quita los casos obvios.
input=$(cat)
eval "$(printf '%s' "$input" | node -e '
  let d = "";
  process.stdin.on("data", (c) => (d += c));
  process.stdin.on("end", () => {
    let j = {};
    try { j = JSON.parse(d); } catch {}
    const q = (s) => "\x27" + String(s ?? "").replace(/\x27/g, "") + "\x27";
    process.stdout.write(`agent=${q(j.agent_type)}; id=${q(j.agent_id)}\n`);
  });
')"
mkdir -p .claude/tmp
printf '%s stop agent=%s id=%s\n' "$(date -Iseconds)" "$agent" "$id" >> .claude/tmp/hooks.log

blocked=".claude/tmp/blocked-$id"
count=0
[ -f "$blocked" ] && count=$(cat "$blocked")
if [ "$count" -ge 2 ]; then
  echo "subagent-stop: $agent ya fue bloqueado $count veces; se deja terminar. Verificar su entrega a mano." >&2
  exit 0
fi

block() {
  echo $((count + 1)) > "$blocked"
  echo "$1" >&2
  exit 2
}

# El artefacto tiene que ser MAS NUEVO que el arranque del agente. Un archivo
# de la tarea anterior que siga en disco no cuenta como entrega.
newer_than_start() {
  [ -f "$1" ] || return 1
  marker=".claude/tmp/start-$id"
  [ -f "$marker" ] || return 0   # sin marcador no se puede comparar: no bloquear
  [ "$1" -nt "$marker" ]
}

case "$agent" in
  implementador)
    if ! pnpm run gates:check >/dev/null 2>&1; then
      detalle=$(pnpm run gates:check 2>&1 | grep 'gates --check:' | head -1)
      block "No podes terminar: los gates no estan frescos y en verde.
$detalle
Corre \`pnpm run gates\`, arregla lo que salga en rojo y volve a intentarlo.
Un gate que no corre es indistinguible de uno que pasa."
    fi
    ;;
  qa)
    newer_than_start outputs/reporte_qa.md || block \
"No podes terminar: outputs/reporte_qa.md no existe o es anterior a tu arranque.
Escribi el reporte y confirmalo con un Read antes de cerrar."
    ;;
  lider-tecnico)
    newer_than_start outputs/revision_codigo.md || block \
"No podes terminar: outputs/revision_codigo.md no existe o es anterior a tu arranque.
Escribi la revision y confirmala con un Read antes de cerrar."
    ;;
esac

exit 0
