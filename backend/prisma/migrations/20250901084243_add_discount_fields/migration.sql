-- AlterTable
ALTER TABLE `kos` ADD COLUMN `discountEndDate` DATETIME(3) NULL,
    ADD COLUMN `discountPercent` DOUBLE NULL DEFAULT 0;
