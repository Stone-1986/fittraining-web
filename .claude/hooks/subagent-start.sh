#!/bin/sh
# SubagentStart: deja un marcador con la hora de arranque del subagente.
#
# Solo sirve para una cosa, y es la que hace posible el gate de salida: el
# subagent-stop compara el mtime del artefacto contra ESTE marcador. Sin el,
# un reporte de la tarea anterior que siga en disco pasaria por trabajo nuevo.
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
: > ".claude/tmp/start-$id"
printf '%s start agent=%s id=%s\n' "$(date -Iseconds)" "$agent" "$id" >> .claude/tmp/hooks.log
exit 0
