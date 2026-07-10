-- AlterTable
ALTER TABLE `projects` ADD COLUMN `thumbnailId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `projects_thumbnailId_idx` ON `projects`(`thumbnailId`);

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_thumbnailId_fkey` FOREIGN KEY (`thumbnailId`) REFERENCES `File`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
