/*
  Warnings:

  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `File` ADD COLUMN `storedName` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `File_storage_objectKey_idx` ON `File`(`storage`, `objectKey`);

-- CreateIndex
CREATE INDEX `File_createdAt_idx` ON `File`(`createdAt`);
