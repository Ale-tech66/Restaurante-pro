#!/bin/bash
set -e
cd /home/alejandro/Escritorio/app_restaurante

echo "=== Limpiando remote (quitar token embebido) ==="
git remote set-url origin https://github.com/Ale-tech66/Restaurante-pro.git

echo "=== Eliminando scripts temporales ==="
rm -f setup.sh commit_and_check.sh

echo "=== Commit limpieza ==="
git add -A
git commit -m "chore: limpiar scripts temporales de setup" 2>&1 || echo "Nada que commitear"

echo "=== Estado final ==="
git remote -v
git log --oneline
git status
