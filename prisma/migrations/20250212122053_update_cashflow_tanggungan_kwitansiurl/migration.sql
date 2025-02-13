/*
  Warnings:

  - You are about to drop the column `kwitansi_url` on the `CashFlow` table. All the data in the column will be lost.
  - You are about to drop the column `tanggungan` on the `CashFlow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CashFlow" DROP COLUMN "kwitansi_url",
DROP COLUMN "tanggungan";
