#!/bin/bash
set -e
cd /home/alejandro/Escritorio/app_restaurante

echo "=== Configurando git ==="
git config user.name "alejandro"
git config user.email "alejandro@localhost"

echo "=== Verificando .gitignore ==="
cat .gitignore | head -5

echo "=== Agregando archivos ==="
git add -A
git status --short | head -30

echo "=== Commit inicial ==="
git commit -m "feat: inicialización del proyecto Restaurante Pro

- Frontend: Expo (React Native + TypeScript) con estructura por roles
- Backend: Supabase (PostgreSQL + Auth + RLS + Realtime)
- 4 migraciones: schema, RLS, seed, backend fixes
- config.toml del Supabase CLI
- Realtime habilitado para orders, tables, payments, notifications
- RPCs: invite_staff_user y claim_restaurant_admin
- order_number seguro con advisory lock"

echo "=== Estado final ==="
git log --oneline
git status
