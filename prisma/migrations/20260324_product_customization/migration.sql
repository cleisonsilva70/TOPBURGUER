-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "compositionText" TEXT,
ADD COLUMN "sizeOptionsJson" TEXT,
ADD COLUMN "optionalItemsJson" TEXT,
ADD COLUMN "allowCustomerNote" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "customerNote" TEXT;

-- AlterTable
ALTER TABLE "OrderItem"
ADD COLUMN "cartItemId" TEXT,
ADD COLUMN "customizationText" TEXT;
