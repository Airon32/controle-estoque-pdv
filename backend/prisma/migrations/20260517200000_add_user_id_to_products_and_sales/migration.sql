-- AlterTable: add userId column to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';

-- AlterTable: add userId column to sales
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';
