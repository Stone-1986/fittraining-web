#!/bin/sh
# PostToolUse (Write|Edit): formatea con Prettier el archivo recien escrito.
#
# Por que existe: `format:check` es uno de los cinco gates, y un error de
# Prettier cuesta una vuelta entera Implementador -> QA -> LT por algo que no
# es un defecto. Formateando al escribir, el error nunca llega a existir. El
# gate sigue siendo el juez; esto es la red.
#
# Recibe el JSON del evento por stdin y solo usa tool_input.file_path.
# NUNCA bloquea (PostToolUse no puede deshacer un Write) y nunca falla el
# turno: cualquier problema sale con exit 0.
file=$(node -e '
  let d = "";
  process.stdin.on("data", (c) => (d += c));
  process.stdin.on("end", () => {
    try { process.stdout.write(JSON.parse(d).tool_input?.file_path ?? ""); } catch {}
  });
')
[ -n "$file" ] || exit 0

# Solo lo que Prettier entiende y el repo formatea.
case "$file" in
  *.ts|*.tsx|*.css|*.md|*.json|*.mjs) ;;
  *) exit 0 ;;
esac

# Solo dentro del repo. Una ruta absoluta de fuera no se toca.
rel=${file#"$PWD"/}
case "$rel" in
  /*) exit 0 ;;
  node_modules/*|.next/*|outputs/*|coverage/*) exit 0 ;;
esac

[ -f "$file" ] || exit 0
npx prettier --write "$file" >/dev/null 2>&1 || true
exit 0
