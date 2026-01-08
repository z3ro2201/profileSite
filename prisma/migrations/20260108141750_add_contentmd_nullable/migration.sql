/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `content`,
    ADD COLUMN `contentHtml` LONGTEXT NULL,
    ADD COLUMN `contentMd` LONGTEXT NULL,
    ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `state` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    MODIFY `categoryId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Post_state_createdAt_idx` ON `Post`(`state`, `createdAt`);

-- CreateIndex
CREATE INDEX `Post_authorId_createdAt_idx` ON `Post`(`authorId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `Post_categoryId_idx` ON `Post`(`categoryId`);
