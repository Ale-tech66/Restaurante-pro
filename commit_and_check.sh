#!/bin/bash
set -e
cd /home/alejandro/Escritorio/app_restaurante

echo "=== Haciendo commit del fix de TypeScript ==="
git add -A
git commit -m "fix: corregir useFocusEffect async en product-edit.tsx

useFocusEffect no acepta callbacks que devuelvan Promise.
Se envuelve loadData en un useCallback que devuelve void."

echo "=== Verificando gh CLI ==="
if command -v gh &>/dev/null; then
  echo "gh encontrado"
  GH_BIN="gh"
else
  echo "gh no encontrado en PATH, buscando..."
  GH_BIN=$(find /home/alejandro -name "gh" -type f 2>/dev/null | head -1)
  if [ -z "$GH_BIN" ]; then
    echo "gh CLI no instalado. Se usará git remote + push directo."
  fi
fi

echo "=== DONE ==="
git log --oneline
