# Restaurante Pro

Sistema profesional de pedidos y gestión para restaurantes (multi-restaurante).

Stack:
- **Frontend:** Expo (React Native + TypeScript)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage + RLS)
- **Modo:** Multi-restaurante desde el inicio (`restaurant_id` en todas las tablas)

## Estructura

```
app_restaurante/
├── app/                    # FRONTEND — App Expo (React Native + TypeScript)
│   ├── src/
│   │   ├── app/            # Rutas (expo-router)
│   │   │   ├── (auth)/     # Login
│   │   │   ├── (admin)/    # Dashboard, productos, categorías, mesas
│   │   │   ├── (client)/   # Menú, carrito, checkout
│   │   │   └── (staff)/    # Cocina (KDS), mesero, caja
│   │   ├── lib/            # Cliente Supabase, API, React Query
│   │   ├── stores/         # Zustand (auth)
│   │   └── types/          # Tipos del dominio
│   ├── .env.local.example  # Plantilla de variables de entorno
│   └── package.json
│
└── supabase/               # BACKEND — Supabase (PostgreSQL + Auth + RLS + Realtime)
    ├── migrations/
    │   ├── 0001_schema.sql          # Esquema (15 tablas)
    │   ├── 0002_rls.sql             # Políticas RLS por restaurante
    │   ├── 0003_seed.sql             # Roles, permisos, restaurante demo, trigger de usuario
    │   └── 0004_backend_fixes.sql    # Realtime, order_number seguro, RPCs staff/admin
    └── config.toml                  # Configuración del Supabase CLI
```

## Orden de desarrollo (según decisión del usuario)

1. Admin + Menú (gestión de productos, categorías, mesas)
2. Cliente (QR → menú → carrito → pedido)
3. Cocina + Mesero (KDS en tiempo real + panel de mesero)

## Setup rápido

```bash
# 1. Instalar dependencias del frontend
cd app && npm install

# 2. Levantar la app
npx expo start
```

## Backend (Supabase)

### Opción A — Supabase CLI (recomendado)

```bash
# Instalar el CLI (una sola vez)
npm install -g supabase

# Login (te abre el navegador)
supabase login

# Linkear el proyecto remoto (necesitas el project ref de supabase.com)
cd supabase
supabase link --project-ref TU_PROJECT_REF

# Aplicar todas las migraciones
supabase db push

# O reiniciar la BD local con seed desde cero
supabase db reset --linked
```

### Opción B — SQL Editor manual

1. Crear un proyecto en https://supabase.com
2. Copiar `.env.local.example` a `.env.local` y completar con tus claves
3. Ejecutar las migraciones de `supabase/migrations/` en orden (0001 → 0004) en el SQL Editor
4. Las políticas RLS ya vienen incluidas en las migraciones

### Qué incluye la migración 0004_backend_fixes

- **Realtime**: las tablas orders, order_items, tables, payments y notifications se publican en `supabase_realtime` para que el KDS y el panel de mesero reciban cambios en vivo.
- **order_number seguro**: advisory lock por restaurante (sin race conditions).
- **Trigger automático**: `order_number` se asigna solo al insertar un pedido.
- **RPC `invite_staff_user`**: el admin invita mesero/cocina/cajero a su restaurante.
- **RPC `claim_restaurant_admin`**: permite reclamar la admin del primer restaurante (bootstrap, resuelve el problema de gallina-y-huevo del trigger de registro).
