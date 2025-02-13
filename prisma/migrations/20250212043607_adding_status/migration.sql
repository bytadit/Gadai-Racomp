-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('MASUK', 'KELUAR', 'DIJUAL');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "item_status" "ItemStatus" NOT NULL DEFAULT 'MASUK';
