# 🚛 Tanko — Monedero Electrónico Descentralizado para Flotillas

> **Hack+ Alebrije CDMX 2026** — Demo MVP  
> Sistema B2B para la gestión de combustible de flotillas de transporte, con contratos inteligentes (Escrow) sobre la red Stellar mediante **Trustless Work**.

---

## Índice

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura del Monorepo](#arquitectura-del-monorepo)
3. [Flujo de Datos](#flujo-de-datos)
4. [Tecnologías](#tecnologías)
5. [Instalación](#instalación)
6. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
7. [Ejecución](#ejecución)
8. [Guía de Uso (Demo)](#guía-de-uso-demo)
9. [Endpoints del Backend](#endpoints-del-backend)
10. [Estructura de Archivos](#estructura-de-archivos)
11. [Notas de la Demo](#notas-de-la-demo)

---

## Descripción del Proyecto

**Tanko** reemplaza el efectivo y las tarjetas corporativas clonables que actualmente usan las empresas de transporte para gestionar el combustible de sus conductores. En su lugar, utiliza **contratos inteligentes (Escrow)** en la blockchain de Stellar para garantizar que los fondos solo sean liberados cuando el jefe de flota aprueba una carga real.

### Actores del sistema

| Actor | Rol | Pantalla principal |
|---|---|---|
| **Jefe / Empresa** | Crea y aprueba escrows | `/dashboard` (Admin) |
| **Conductor** | Solicita fondos para cargar combustible | `/dashboard/conductor` |
| **Gasolinera (futura)** | Receptor del pago liberado | — |

---

## Arquitectura del Monorepo

El proyecto está organizado como un **monorepo npm workspaces** con dos paquetes independientes:

```
tanko-monorepo/
├── package.json          ← Raíz del monorepo (npm workspaces)
├── .env.example          ← Variables de entorno de referencia
├── .gitignore
├── README.md             ← Este archivo
│
├── frontend/             ← Paquete: Next.js 16 (puerto 3000)
│   ├── app/
│   │   ├── dashboard/    ← Vistas del admin y conductor
│   │   └── api/          ← Next.js API Routes (proxy interno)
│   ├── components/       ← UI con Radix + Tailwind CSS
│   ├── lib/              ← Clientes Stellar, Trustless Work, Prisma
│   ├── prisma/           ← Esquema y seed de la base de datos
│   └── providers/        ← WalletProvider (Freighter / Stellar)
│
└── backend/              ← Paquete: Express + TypeScript (puerto 3001)
    ├── src/
    │   ├── controllers/  ← Lógica HTTP (Escrow, Wallet, Funds)
    │   ├── routes/       ← Definición de endpoints REST
    │   ├── services/     ← TrustlessWork API, Stellar SDK
    │   ├── types/        ← Interfaces TypeScript compartidas
    │   └── utils/        ← Validadores Zod
    └── tests/            ← Unit + Integration tests (Jest)
```

### Diagrama de componentes

```mermaid
graph TB
    subgraph "Browser (Cliente)"
        FE["Next.js Frontend\nlocalhost:3000"]
    end

    subgraph "Backend Express\nlocalhost:3001"
        API["REST API\n/api/v1"]
        EC["EscrowController"]
        WC["WalletController"]
        FC["FundsController"]
        TW["TrustlessWork\nService"]
        ST["Stellar\nService"]
    end

    subgraph "Servicios Externos"
        TWA["Trustless Work API\ndev.api.trustlesswork.com"]
        SH["Stellar Horizon\nhorizon-testnet.stellar.org"]
    end

    subgraph "Base de Datos"
        DB[(PostgreSQL\nvía Prisma)]
    end

    FE -->|"HTTP POST/GET\nfetch()"| API
    API --> EC & WC & FC
    EC --> TW
    WC --> ST
    TW -->|"axios"| TWA
    ST -->|"stellar-sdk"| SH
    FE -->|"Prisma Client"| DB
```

---

## Flujo de Datos

### Flujo completo: Crear → Aprobar → Liberar un Escrow

```mermaid
sequenceDiagram
    actor Jefe
    actor Conductor
    participant FE as Frontend (Next.js)
    participant BE as Backend (Express)
    participant TW as Trustless Work API
    participant ST as Stellar Testnet

    Note over Jefe,ST: ── 1. CREAR ESCROW ──────────────────────────────

    Conductor->>FE: Ingresa litros a solicitar
    FE->>FE: Calcula monto (litros × precio/L)
    FE->>BE: POST /api/v1/escrow/single/create\n{ sender, approver, receiver, amount, ... }
    BE->>BE: Valida payload (Zod)
    BE->>TW: POST /escrow/single-release-escrow
    TW->>ST: Crea contrato inteligente
    ST-->>TW: contractId + unsignedXDR
    TW-->>BE: { success, data: { contractId, xdr } }
    BE-->>FE: 201 { success, data }
    FE->>FE: Muestra toast con contractId

    Note over Jefe,ST: ── 2. FONDEAR ESCROW ────────────────────────────

    Jefe->>FE: Aprueba la solicitud del conductor
    FE->>BE: POST /api/v1/escrow/single/fund\n{ contractId, rolePublicKey, ... }
    BE->>TW: POST /escrow/fund-escrow
    TW->>ST: Envía fondos al smart contract
    ST-->>TW: txHash confirmado
    TW-->>BE: { success, txHash }
    BE-->>FE: 200 OK

    Note over Jefe,ST: ── 3. LIBERAR FONDOS ────────────────────────────

    Jefe->>FE: Confirma que la carga fue realizada
    FE->>BE: POST /api/v1/escrow/single/release\n{ contractId, rolePublicKey, ... }
    BE->>TW: POST /escrow/release-funds
    TW->>ST: Libera fondos al receiver (gasolinera)
    ST-->>TW: tx confirmada
    TW-->>BE: { success }
    BE-->>FE: 200 OK
    FE->>FE: Actualiza historial del conductor ✓
```

### Flujo de autenticación del conductor (Wallet Stellar)

```mermaid
flowchart LR
    A([Conductor abre app]) --> B{¿Wallet conectada?}
    B -->|No| C[Clic en 'Conectar Wallet']
    C --> D[Freighter Extension]
    D --> E[Autoriza conexión]
    E --> F[Guarda address en localStorage]
    F --> G[WalletProvider actualiza contexto]
    B -->|Sí| G
    G --> H[Dashboard Conductor habilitado]
    H --> I[Puede solicitar fondos al Escrow]
```

### Diagrama de estados de un Escrow

```mermaid
stateDiagram-v2
    [*] --> Creado : POST /escrow/single/create
    Creado --> Fondeado : POST /escrow/single/fund
    Fondeado --> Aprobado : POST /escrow/single/approve
    Aprobado --> Liberado : POST /escrow/single/release
    Fondeado --> EnDisputa : POST /escrow/dispute
    EnDisputa --> Resuelto : POST /escrow/resolve-dispute
    Liberado --> [*]
    Resuelto --> [*]
```

---

## Tecnologías

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend framework | Next.js (App Router) | 16.2 |
| UI Components | Radix UI + Tailwind CSS 4 | — |
| Iconos | lucide-react | 0.564 |
| Notificaciones | Sonner | 1.7 |
| ORM | Prisma | 7.5 |
| Autenticación | NextAuth.js | 4.24 |
| Wallet Stellar | @creit.tech/stellar-wallets-kit | 2.0 |
| Backend framework | Express | 4.18 |
| Runtime TS backend | tsx watch | 4.7 |
| Blockchain | Stellar (Testnet) | — |
| Smart Contracts | Trustless Work API | dev |
| Validación | Zod | 3.22 |
| HTTP Client (backend) | Axios | 1.6 |
| Testing | Jest (backend) + Vitest (frontend) | — |

---

## Instalación

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** (para Prisma; opcional en modo demo)
- Extensión **Freighter** instalada en el navegador (para conectar wallet Stellar)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/tanko.git
cd tanko

# 2. Instala TODAS las dependencias del monorepo con un solo comando
#    (instala root + frontend + backend simultáneamente)
npm install

# 3. Configura las variables de entorno
cp .env.example backend/.env
# Edita backend/.env con tu API Key de Trustless Work

cp .env.example frontend/.env.local
# Edita frontend/.env.local con tu DATABASE_URL y NEXTAUTH_SECRET
```

---

## Configuración de Variables de Entorno

### `backend/.env`

```env
PORT=3001
NODE_ENV=development
TRUSTLESS_WORK_API_URL=https://dev.api.trustlesswork.com
TRUSTLESS_WORK_API_KEY=tu_api_key_aqui     # ← Requerida para crear escrows reales
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
```

> Obtén tu API Key en [https://app.trustlesswork.com](https://app.trustlesswork.com)

### `frontend/.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:3001
NEXTAUTH_SECRET=genera_con_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/tanko_db
```

---

## Ejecución

### Desarrollo (ambos servidores en paralelo)

```bash
# Desde la raíz del monorepo — inicia backend (3001) y frontend (3000) simultáneamente
npm run dev
```

La terminal mostrará los logs de ambos procesos con prefijos de color:
- `[BACKEND]` en magenta → Express + Trustless Work
- `[FRONTEND]` en cyan → Next.js

### Servidores por separado

```bash
# Solo el backend
npm run dev:backend

# Solo el frontend
npm run dev:frontend
```

### URLs de acceso

| Servicio | URL |
|---|---|
| Frontend (Dashboard Admin) | http://localhost:3000/dashboard |
| Frontend (Vista Conductor) | http://localhost:3000/dashboard/conductor |
| Backend (Health check) | http://localhost:3001/health |
| Backend (API REST) | http://localhost:3001/api/v1 |

---

## Guía de Uso (Demo)

### Flujo de demostración para el hackathon

#### Paso 1 — Verificar que ambos servidores están corriendo

```bash
npm run dev
# Espera ver: "TANKO-scrow Backend — Status: RUNNING — Port: 3001"
# Y: "Next.js ready on http://localhost:3000"
```

#### Paso 2 — Vista del Jefe: Crear un Escrow

1. Abre [http://localhost:3000/dashboard/consumos](http://localhost:3000/dashboard/consumos)
2. Da clic en el botón **"Crear Escrow (Trustless Work)"** (gradiente violeta)
3. Observa el spinner de carga mientras el frontend llama al backend
4. Aparecerá un **Toast** con la respuesta JSON del servidor (éxito o error)

#### Paso 3 — Vista del Conductor: Solicitar fondos

1. Abre [http://localhost:3000/dashboard/conductor](http://localhost:3000/dashboard/conductor)
2. Observa la tarjeta virtual con:
   - Dirección Stellar (clic para copiar)
   - Saldo disponible
   - Barra de límite máximo de escrow
3. Ingresa la cantidad de **litros** a cargar
4. El monto se calcula automáticamente (litros × $25/L)
5. Da clic en **"Solicitar fondos"**
6. El Toast muestra la respuesta del backend

#### Paso 4 — Explorar los otros módulos

| Módulo | URL | Descripción |
|---|---|---|
| Resumen general | `/dashboard` | KPIs + gráficas de consumo (Recharts) |
| Unidades | `/dashboard/unidades` | Gestión de camiones de la flota |
| Consumos | `/dashboard/consumos` | Historial de cargas + botón Escrow |
| Ubicaciones | `/dashboard/ubicaciones` | Mapa de gasolineras |
| Usuarios | `/dashboard/usuarios` | Administración de conductores |

### Datos de prueba incluidos

La demo incluye datos mock precargados para que el flujo sea completamente visible sin necesidad de base de datos ni wallet real:

- **8 consumos** de combustible con diferentes conductores, unidades y gasolineras
- **5 unidades** (Kenworth, Freightliner, Volvo, International, Peterbilt)
- **Conductor demo**: Juan Pérez García — dirección `GASENDER7K3X...`
- **Límite de escrow**: $5,000 MXN · **Disponible**: $3,200 MXN
- **Historial**: 3 solicitudes (2 completadas, 1 pendiente)

---

## Endpoints del Backend

Base URL: `http://localhost:3001/api/v1`

### Escrow — Single Release

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/escrow/single/create` | Crea un escrow de liberación única |
| `POST` | `/escrow/single/fund` | Fondea un escrow existente |
| `POST` | `/escrow/single/approve` | Aprueba el milestone del escrow |
| `POST` | `/escrow/single/release` | Libera los fondos al receiver |

### Escrow — Multi Release

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/escrow/multi/create` | Crea un escrow de liberación múltiple |
| `POST` | `/escrow/multi/fund` | Fondea el escrow multi-release |
| `POST` | `/escrow/multi/approve` | Aprueba un milestone específico |
| `POST` | `/escrow/multi/release` | Libera fondos de un milestone |

### Consultas y disputas

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/escrow?contractId=...` | Consulta el estado de un escrow |
| `POST` | `/escrow/dispute` | Abre una disputa |
| `POST` | `/escrow/resolve-dispute` | Resuelve una disputa activa |

### Wallet

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/wallet/balance` | Consulta balance de una address Stellar |
| `POST` | `/wallet/trustline` | Establece una trustline en Stellar |

### Health

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servidor y configuración |

### Ejemplo de payload: Crear Escrow

```json
POST http://localhost:3001/api/v1/escrow/single/create
Content-Type: application/json

{
  "signer": "GAPPROVER1234567890ABCDEFGHIJ",
  "engagementId": "TANKO-DEMO-001",
  "roles": {
    "sender":   "GASENDER1234567890ABCDEFGHIJ",
    "approver": "GAPPROVER1234567890ABCDEFGHIJ",
    "receiver": "GARECEIVER1234567890ABCDEFGHI"
  },
  "amount": "5000000",
  "description": "Carga de 50L de Diesel – Kenworth T680",
  "trustline": {
    "address":  "CBIELTK6YBZJU5UP2WWQ",
    "decimals": 10000000
  }
}
```

---

## Estructura de Archivos

```
tanko-monorepo/
│
├── package.json                    ← Monorepo root: workspaces + scripts
├── .env.example                    ← Plantilla de variables de entorno
├── .gitignore
├── README.md
│
├── frontend/                       ════════════════════════════
│   ├── package.json                ← "tanko" v0.1.0
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── prisma/
│   │   └── seed.ts                 ← Datos iniciales de la DB
│   │
│   ├── app/
│   │   ├── layout.tsx              ← Root layout + Toaster
│   │   ├── providers.tsx           ← SessionProvider + WalletProvider
│   │   ├── page.tsx                ← Landing page
│   │   │
│   │   ├── (auth)/login/           ← Página de login (NextAuth)
│   │   │
│   │   ├── api/                    ← Next.js API Routes (proxy/BFF)
│   │   │   ├── auth/[...nextauth]/ ← NextAuth handler
│   │   │   ├── stellar/balance/    ← Proxy → Stellar Horizon
│   │   │   ├── stellar/wallet/     ← Proxy → Stellar SDK
│   │   │   └── trustless/          ← Proxy → Trustless Work
│   │   │
│   │   └── dashboard/
│   │       ├── layout.tsx          ← Sidebar + header del dashboard
│   │       ├── page.tsx            ← Resumen con KPIs y gráficas
│   │       ├── consumos/           ← Historial + botón Crear Escrow ★
│   │       ├── conductor/          ← Wallet virtual del conductor ★
│   │       ├── unidades/           ← Gestión de flotilla
│   │       ├── usuarios/           ← Administración de conductores
│   │       ├── ubicaciones/        ← Mapa de gasolineras
│   │       ├── reportes/           ← Reportes exportables (Excel)
│   │       └── admin/              ← Panel administrativo
│   │
│   ├── components/
│   │   └── ui/                     ← Componentes Radix UI + shadcn
│   │
│   ├── lib/
│   │   ├── auth.ts                 ← Config NextAuth + Prisma adapter
│   │   ├── prisma.ts               ← Singleton de Prisma Client
│   │   ├── stellar/client.ts       ← Stellar SDK client
│   │   └── trustless/client.ts     ← Trustless Work HTTP client
│   │
│   └── providers/
│       └── wallet-provider.tsx     ← Contexto de wallet Stellar (client-only)
│
└── backend/                        ════════════════════════════
    ├── package.json                ← "tanko-scrow-backend" v1.0.0
    ├── tsconfig.json
    │
    ├── src/
    │   ├── index.ts                ← Entry point: Express app + CORS + listen
    │   │
    │   ├── config/
    │   │   └── index.ts            ← Carga .env y exporta config tipada
    │   │
    │   ├── routes/
    │   │   ├── escrow.routes.ts    ← /escrow/* endpoints
    │   │   ├── wallet.routes.ts    ← /wallet/* endpoints
    │   │   ├── funds.routes.ts     ← /funds/* endpoints
    │   │   └── helper.routes.ts    ← /helper/* endpoints
    │   │
    │   ├── controllers/
    │   │   ├── escrow.controller.ts ← CRUD escrows + validación Zod
    │   │   ├── wallet.controller.ts ← Balance + trustline
    │   │   └── funds.controller.ts  ← Gestión de fondos
    │   │
    │   ├── services/
    │   │   ├── trustlessWork.service.ts ← Todas las llamadas a TW API
    │   │   ├── stellar.service.ts       ← Sign, submit, validateKey
    │   │   ├── funds.service.ts         ← Lógica de negocio de fondos
    │   │   └── funds.store.ts           ← Store en memoria (demo)
    │   │
    │   ├── types/index.ts          ← Interfaces TypeScript del dominio
    │   └── utils/validators.ts     ← Esquemas Zod para cada endpoint
    │
    └── tests/
        ├── api.test.ts
        ├── mocks.ts
        ├── stellar.service.test.ts
        ├── trustlessWork.service.test.ts
        ├── validators.test.ts
        └── integration/
            └── funds.testnet.test.ts
```

---

## Notas de la Demo

### ⚠ Modo Demo vs Producción

| Aspecto | Demo (actual) | Producción |
|---|---|---|
| Datos | Mock hardcodeados en el frontend | Prisma + PostgreSQL |
| Addresses Stellar | Strings de prueba (inválidas) | Claves Stellar reales |
| Trustless Work | Requiere API Key válida | API Key de producción |
| Autenticación | Simulada | NextAuth con Prisma |
| CORS | `origin: true` (acepta todo) | Lista blanca de dominios |

### Cómo obtener una API Key de Trustless Work

1. Regístrate en [https://app.trustlesswork.com](https://app.trustlesswork.com)
2. Crea un nuevo proyecto
3. Copia la API Key y pégala en `backend/.env` como `TRUSTLESS_WORK_API_KEY`

### Cómo obtener una dirección Stellar de prueba

1. Instala la extensión [Freighter](https://www.freighter.app/) en tu navegador
2. Crea una nueva wallet — obtienes una keypair en testnet
3. Fondéala con el [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test)

---

*Proyecto desarrollado por el equipo **Alebrije** para Hack+ CDMX 2026.*
