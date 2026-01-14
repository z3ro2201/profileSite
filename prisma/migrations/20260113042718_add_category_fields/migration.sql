/*
  Warnings:

  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Category`
  ADD COLUMN `order` INT NOT NULL DEFAULT 0,
  ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `updatedAt` DATETIME(3) NULL;

UPDATE `Category`
SET `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `updatedAt` IS NULL;

ALTER TABLE `Category`
  MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;