/*
  Warnings:

  - The values [TERLAMBAT] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('BERJALAN', 'SELESAI', 'PERPANJANG');
ALTER TABLE "Transaction" ALTER COLUMN "status_transaksi" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "status_transaksi" TYPE "TransactionStatus_new" USING ("status_transaksi"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
ALTER TABLE "Transaction" ALTER COLUMN "status_transaksi" SET DEFAULT 'BERJALAN';
COMMIT;
