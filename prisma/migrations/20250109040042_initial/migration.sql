-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('PRIA', 'WANITA');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('AMAN', 'FAVORIT', 'RISIKO', 'MASALAH');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('KENDARAAN', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SIMPAN', 'PAKAI');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('BERJALAN', 'SELESAI', 'TERLAMBAT');

-- CreateEnum
CREATE TYPE "CicilanStatus" AS ENUM ('AMAN', 'BERMASALAH', 'DIJUAL');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'BNI', 'BSI');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('FOTO', 'DOKUMEN');

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "address" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthdate" DATE,
    "status" "CustomerStatus" NOT NULL DEFAULT 'AMAN',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL DEFAULT 'KENDARAAN',
    "desc" TEXT,
    "year" SMALLINT,
    "value" MONEY,
    "brand" TEXT NOT NULL,
    "serial" TEXT,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "desc" TEXT,
    "type" "TransactionType" NOT NULL DEFAULT 'SIMPAN',
    "nilai_pinjaman" MONEY NOT NULL,
    "persen_tanggungan" MONEY NOT NULL,
    "waktu_pinjam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tgl_jatuh_tempo" DATE NOT NULL,
    "tanggungan_awal" MONEY NOT NULL,
    "tanggungan_akhir" MONEY NOT NULL,
    "waktu_kembali" TIMESTAMP NOT NULL,
    "status_transaksi" "TransactionStatus" NOT NULL DEFAULT 'BERJALAN',
    "status_cicilan" "CicilanStatus" NOT NULL DEFAULT 'AMAN',
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashFlow" (
    "id" SERIAL NOT NULL,
    "termin" INTEGER NOT NULL,
    "desc" TEXT,
    "amount" MONEY NOT NULL,
    "tanggungan" MONEY NOT NULL,
    "waktu_bayar" TIMESTAMP(3) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "kwitansi_url" TEXT,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "CashFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT,
    "value" TEXT NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPhone" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "phone_number" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_whatsapp" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemDocument" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "name" TEXT,
    "doc_type" "DocumentType" NOT NULL,
    "doc_url" TEXT,

    CONSTRAINT "ItemDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDocument" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "name" TEXT,
    "doc_type" "DocumentType" NOT NULL,
    "doc_url" TEXT,

    CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionDocument" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "name" TEXT,
    "doc_type" "DocumentType" NOT NULL,
    "doc_url" TEXT,

    CONSTRAINT "TransactionDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_nik_key" ON "Customer"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Item_serial_key" ON "Item"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlow" ADD CONSTRAINT "CashFlow_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPhone" ADD CONSTRAINT "CustomerPhone_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemDocument" ADD CONSTRAINT "ItemDocument_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDocument" ADD CONSTRAINT "TransactionDocument_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
