-- AlterTable
ALTER TABLE `Post` ADD COLUMN `commentCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `trackbackCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `parentId` INTEGER NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NULL,
    `authorHomepage` VARCHAR(191) NULL,
    `authorIp` VARCHAR(45) NULL,
    `content` TEXT NOT NULL,
    `isSecret` BOOLEAN NOT NULL DEFAULT false,
    `isApproved` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Comment_postId_createdAt_idx`(`postId`, `createdAt`),
    INDEX `Comment_parentId_idx`(`parentId`),
    INDEX `Comment_authorEmail_idx`(`authorEmail`),
    INDEX `Comment_isApproved_isDeleted_idx`(`isApproved`, `isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trackback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `title` VARCHAR(191) NULL,
    `excerpt` TEXT NULL,
    `blogName` VARCHAR(191) NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Trackback_postId_createdAt_idx`(`postId`, `createdAt`),
    INDEX `Trackback_isApproved_isDeleted_idx`(`isApproved`, `isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trackback` ADD CONSTRAINT `Trackback_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
