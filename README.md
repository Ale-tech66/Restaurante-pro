# Restaurante Pro

Sistema profesional **multi-restaurante** de pedidos y gestión: 3 aplicaciones separadas sobre un backend Supabase compartido.

- **El backend determina el rol** (Admin, Mesero, Caja, Cocina, Gerente) y cada app redirige al panel correspondiente.
- Cada restaurante está aislado con `restaurant_id` + políticas RLS.
- La App Cliente nunca muestra administración; el backend valida permisos en cada consulta.

## Arquitectura

```
CLIENTE (QR / búsqueda) → MENÚ → PEDIDO → BACKEND → COCINA → MESERO → CAJA → PAGO
                                                                    ↓
                                                    INVENTARIO + REPORTES (admin)
```

| App | Tecnología | Usuarios |
|---|---|---|
| `apps/admin-desktop` | Vite 6 + React 19 + Electron 33 | Admin / Gerente (escritorio) |
| `apps/admin-mobile` | Expo SDK 54 (React Native 0.81) | Admin, Mesero, Caja, Cocina |
| `apps/client-mobile` | Expo SDK 54 (React Native 0.81) | Clientes (pedido anónimo vía QR o login) |
| `packages/shared` | TypeScript puro | Tipos, cliente Supabase, auth store y APIs compartidos |
| `supabase/` | PostgreSQL + RLS + Realtime | Backend (22 tablas, migraciones 0001–0006) |

### Estructura del monorepo

```
app_restaurante/
├── package.json              # Workspaces npm + scripts globales
├── apps/
│   ├── admin-desktop/        # Panel administrativo (Electron)
│   │   └── src/app/          # Login, Dashboard, Products, Categories, Tables,
│   │                         # Orders, Kitchen (KDS), Cashier, Inventory,
│   │                         # Users, Reports, Settings (12 pantallas)
│   ├── admin-mobile/         # Staff móvil (Expo Router)
│   │   └── src/app/
│   │       ├── (auth)/       # login, register, forgot-password
│   │       ├── (admin)/      # dashboard, products, categories, tables, orders,
│   │       │                 # kitchen, cashier, inventory, users, reports, settings
│   │       └── (staff)/      # cocina/kds, mesero/mesas, caja/pedidos
│   └── client-mobile/        # App cliente (Expo Router)
│       └── src/app/
│           ├── (auth)/       # login opcional
│           └── (client)/     # home, scan (QR con cámara), menu, product-detail,
│                             # cart, checkout, order-tracking, orders, profile
├── packages/shared/          # @restaurante-pro/shared
│   └── src/                  # types, supabase, authStore, adminApi, staffApi, clientApi
├── supabase/
│   ├── migrations/           # 0001 schema · 0002 rls · 0003 seed
│   │                         # 0004 backend_fixes · 0005 client_access · 0006 admin_features
│   └── config.toml
└── restaurantefinal.txt      # Especificación completa del sistema
```

## Requisitos

- Node.js ≥ 20
- npm ≥ 10
- Cuenta gratuita en [supabase.com](https://supabase.com)
- Para desktop: no se necesita nada extra (Electron se empaqueta solo)

## Setup rápido

```bash
# 1. Instalar TODAS las dependencias del monorepo (workspaces)
npm install

# 2. Configurar las variables de entorno de cada app
cp apps/admin-desktop/.env.example       apps/admin-desktop/.env.local
cp apps/admin-mobile/.env.local.example  apps/admin-mobile/.env.local
cp apps/client-mobile/.env.local.example apps/client-mobile/.env.local
# Edita cada archivo con la URL y anon key de tu proyecto Supabase
```

> Desktop usa `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
> Las apps móviles usan `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### Levantar cada app

```bash
# Desktop (web + Electron)
cd apps/admin-desktop && npm run dev          # web en el navegador
cd apps/admin-desktop && npm run electron:dev # ventana Electron

# Admin móvil
cd apps/admin-mobile && npx expo start

# Cliente móvil
cd apps/client-mobile && npx expo start
```

### Verificación y tests (desde la raíz)

```bash
npm run typecheck   # tsc --noEmit en las 4 workspaces
npm test            # jest/vitest en todas las apps
```

## Backend (Supabase)

### Opción A — Supabase CLI (recomendado)

```bash
npm install -g supabase
supabase login
cd supabase
supabase link --project-ref TU_PROJECT_REF
supabase db push            # aplica las 6 migraciones en orden
# o desde cero con seed incluido:
supabase db reset --linked
```

### Opción B — SQL Editor manual

1. Crear un proyecto en https://supabase.com
2. Ejecutar `supabase/migrations/*.sql` en orden (0001 → 0006) en el SQL Editor

### Qué incluye el backend

- **22 tablas** con aislamiento multi-restaurante (`restaurant_id`) y RLS por rol.
- **Realtime** en `orders`, `order_items`, `tables`, `payments`, `notifications` (KDS y mesero en vivo).
- **RPCs**: `invite_staff_user` (el admin invita personal) y `claim_restaurant_admin` (bootstrap del primer admin).
- **Seguridad**: triggers que validan permisos en el servidor; el cliente nunca confía en el frontend.
- Migraciones 0005–0006: acceso del cliente anónimo vía QR token y features admin extra.

## Empaquetar la app de escritorio

```bash
cd apps/admin-desktop
npm run electron:build:linux   # o :win / :mac según tu SO destino
```

## Roles y apps — reglas clave

1. El **mismo login** sirve para staff: el backend devuelve el rol y la app redirige al panel (admin, cocina, mesero o caja).
2. La **App Cliente es independiente**: entra sin cuenta escaneando el QR de la mesa (token anónimo) o con login opcional.
3. Ninguna pantalla de administración existe en la app cliente; aunque alguien la forzara, **RLS rechaza** las consultas.

## Estado del proyecto

- ✅ Typecheck completo del monorepo: 0 errores (`npm run typecheck`)
- ✅ Tests: shared 54 · desktop 28 · admin-mobile 22 · client-mobile 18 (**122 pasando**, `npm test`)
- ⏳ Pendiente: más tests de pantallas móviles (hoy cubren wrappers API, cart y auth)
