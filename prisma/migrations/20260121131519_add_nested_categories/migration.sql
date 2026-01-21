-- AlterTable
ALTER TABLE `Category` ADD COLUMN `depth` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `parentId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Category_parentId_idx` ON `Category`(`parentId`);

-- CreateIndex
CREATE INDEX `Category_order_idx` ON `Category`(`order`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
