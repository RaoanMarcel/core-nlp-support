-- CreateEnum
CREATE TYPE "StatusAtendimento" AS ENUM ('PENDENTE', 'EM_ATENDIMENTO', 'APROVADO', 'REPROVADO', 'POSSIBILIDADE');

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "modulosAtuais" TEXT,
    "telefone" TEXT,
    "simplesNacional" TEXT,
    "situacaoCadastral" TEXT,
    "telefoneSecundario" TEXT,
    "email" TEXT,
    "atividadePrincipal" TEXT,
    "telefoneBackup" TEXT,
    "observacoes" TEXT,
    "novosModulos" TEXT[],
    "status" "StatusAtendimento" NOT NULL DEFAULT 'PENDENTE',
    "lockedBy" TEXT,
    "lockedAt" TIMESTAMP(3),
    "atendidoPor" TEXT,
    "dataAtendimento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "primeiroAcesso" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_cnpj_key" ON "Prospect"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "User_usuario_key" ON "User"("usuario");
