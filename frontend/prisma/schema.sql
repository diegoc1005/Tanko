-- Tanko Database Schema
-- PostgreSQL
-- Generated from prisma/schema.prisma

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TYPE "Rol" AS ENUM ('ADMIN', 'CONDUCTOR');
CREATE TYPE "EstadoPeticion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'FIRMADA', 'COMPLETADA', 'FALLIDA');
CREATE TYPE "TipoTransaccion" AS ENUM ('DEPOSITO', 'RELEASE', 'FEE');
CREATE TYPE "EstadoTransaccion" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'FALLIDA');

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Empresas (Flotas de transporte)
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
    "nombre" TEXT NOT NULL,
    "rfc" TEXT,
    "stellarPublicKey" TEXT NOT NULL UNIQUE,
    "escrowContractId" TEXT,
    "feeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.003,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Usuarios (Admins y Conductores)
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'CONDUCTOR',
    "empresaId" TEXT,
    "stellarAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Conductores (Perfil específico)
CREATE TABLE "conductores" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
    "stellarPublicKey" TEXT NOT NULL UNIQUE,
    "limiteCredito" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "usuarioId" TEXT NOT NULL UNIQUE,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conductores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conductores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Ubicaciones (Gasolineras/Estaciones)
CREATE TABLE "ubicaciones" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ubicaciones_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Peticiones de Fondo
CREATE TABLE "peticiones_fondo" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
    "conductorId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "ubicacionId" TEXT,
    "montoSolicitado" DOUBLE PRECISION NOT NULL,
    "montoAprobado" DOUBLE PRECISION,
    "estado" "EstadoPeticion" NOT NULL DEFAULT 'PENDIENTE',
    "tipoCombustible" TEXT NOT NULL,
    "litros" DOUBLE PRECISION,
    "precioLitro" DOUBLE PRECISION,
    "motivo" TEXT,
    "engagementId" TEXT,
    "milestoneIndex" INTEGER,
    "txHash" TEXT,
    "xdrFirmado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "peticiones_fondo_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "conductores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "peticiones_fondo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "peticiones_fondo_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Transacciones
CREATE TABLE "transacciones" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
    "empresaId" TEXT NOT NULL,
    "peticionId" TEXT,
    "tipo" "TipoTransaccion" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "txHash" TEXT,
    "estado" "EstadoTransaccion" NOT NULL DEFAULT 'PENDIENTE',
    "feeMonto" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    CONSTRAINT "transacciones_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transacciones_peticionId_fkey" FOREIGN KEY ("peticionId") REFERENCES "peticiones_fondo"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Sessions (NextAuth)
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Verification Tokens (NextAuth)
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE ("identifier", "token")
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_empresaId_idx" ON "users"("empresaId");
CREATE INDEX "conductores_usuarioId_idx" ON "conductores"("usuarioId");
CREATE INDEX "conductores_empresaId_idx" ON "conductores"("empresaId");
CREATE INDEX "ubicaciones_empresaId_idx" ON "ubicaciones"("empresaId");
CREATE INDEX "peticiones_fondo_conductorId_idx" ON "peticiones_fondo"("conductorId");
CREATE INDEX "peticiones_fondo_empresaId_idx" ON "peticiones_fondo"("empresaId");
CREATE INDEX "peticiones_fondo_estado_idx" ON "peticiones_fondo"("estado");
CREATE INDEX "transacciones_empresaId_idx" ON "transacciones"("empresaId");
CREATE INDEX "transacciones_peticionId_idx" ON "transacciones"("peticionId");
CREATE INDEX "transacciones_tipo_idx" ON "transacciones"("tipo");

-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Para ejecutar este script:
-- 1. Asegúrate de tener PostgreSQL instalado y corriendo
-- 2. Crea una base de datos: CREATE DATABASE tanko;
-- 3. Conecta a la base de datos y ejecuta este script
-- 4. O usa Prisma: npx prisma db push

-- Para configurar la conexión en .env:
-- DATABASE_URL="postgresql://postgres:password@localhost:5432/tanko"
