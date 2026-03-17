# tarjetacliente.vip

Programa de lealtad premium con tarjetas digitales para Apple Wallet y Google Wallet.

## Stack
- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Backend:** Supabase (Postgres + Auth + RLS)
- **IA:** Anthropic Claude (módulo MKT)
- **Deploy:** Vercel

---

## Configuración rápida

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-org/tarjetacliente-vip.git
cd tarjetacliente-vip
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo servidor) |
| `ANTHROPIC_API_KEY` | API key de Anthropic para MKT con IA |
| `NEXT_PUBLIC_APP_URL` | URL de producción (https://tarjetacliente.vip) |

### 3. Desarrollo local

```bash
npm run dev
# Abre http://localhost:3000
```

---

## Deploy en Vercel

```bash
npx vercel --prod
```

O conecta tu repositorio en [vercel.com](https://vercel.com) y agrega las variables de entorno en el dashboard.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Página de login
│   │   └── register/       # Registro de negocio
│   ├── (dashboard)/
│   │   ├── layout.tsx      # Layout con sidebar
│   │   ├── dashboard/      # Tabla de clientes
│   │   ├── tarjeta/        # Editor de tarjeta
│   │   ├── metricas/       # Métricas y gráficas
│   │   ├── encuesta/       # Gestión de encuestas
│   │   └── mkt/            # MKT con IA
│   ├── c/[slug]/           # Tarjeta pública del cliente
│   └── api/
│       ├── ai-mkt/         # Endpoint Anthropic
│       ├── stamp/          # Agregar sellos
│       ├── customer/       # Crear clientes
│       ├── survey/vote/    # Votar encuesta
│       └── wallet/
│           ├── apple/      # Apple Wallet (.pkpass)
│           └── google/     # Google Wallet (JWT)
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   └── DashboardClient.tsx
│   └── ui/
│       └── Toast.tsx
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server + service client
│       └── middleware.ts   # Auth middleware
└── types/
    └── index.ts            # Tipos TypeScript
```

---

## Base de datos (Supabase)

Las tablas ya están creadas con RLS habilitado:

| Tabla | Descripción |
|---|---|
| `businesses` | Negocio, plan, colores, slug |
| `loyalty_programs` | Configuración de sellos/puntos |
| `customers` | Clientes con QR token único |
| `loyalty_balances` | Sellos actuales por cliente |
| `transactions` | Historial earn/redeem |
| `wallet_passes` | Seguimiento passes wallet |
| `campaigns` | Campañas de marketing IA |
| `surveys` | Encuestas configurables |

### Funciones SQL creadas

- `add_stamp()` — Agrega sello, auto-canjea si alcanza el umbral
- `get_dashboard_stats()` — KPIs del negocio
- `get_stamps_by_day()` — Sellos por día (últimos 7 días)
- `cast_survey_vote()` — Registrar voto de encuesta
- `handle_new_user()` — Trigger: crea business + programa al registrarse

---

## Apple Wallet (.pkpass)

Para activar passes reales de Apple Wallet necesitas:

1. Cuenta de Apple Developer ($99/año)
2. Crear un **Pass Type ID** en developer.apple.com
3. Descargar el certificado `.p12` y convertirlo a `.pem`
4. Instalar `passkit-generator`: `npm install passkit-generator`
5. Completar las variables `APPLE_*` en `.env.local`
6. Descomentar el bloque de firma en `src/app/api/wallet/apple/route.ts`

## Google Wallet

Para activar passes reales de Google Wallet:

1. Google Cloud Project con **Google Wallet API** habilitada
2. Crear un **Issuer ID** en pay.google.com/business/console
3. Service Account con rol `Wallet Object Issuer`
4. Instalar `google-auth-library`: `npm install google-auth-library`
5. Completar `GOOGLE_WALLET_ISSUER_ID` en `.env.local`
6. Descomentar el bloque JWT en `src/app/api/wallet/google/route.ts`

---

## URL de tarjeta cliente

Cada negocio tiene una URL pública:
```
https://tarjetacliente.vip/c/{slug}
```

El cliente puede:
- Ver sus sellos en tiempo real
- Agregar la tarjeta a Apple/Google Wallet
- Registrarse con nombre y teléfono
- Responder la encuesta activa

---

## Módulo MKT con IA

El endpoint `/api/ai-mkt` usa Claude Sonnet para generar estrategias de marketing personalizadas basadas en las métricas reales del negocio. Las campañas generadas se guardan en la tabla `campaigns` con `ai_generated = true`.
// trigger deploy
