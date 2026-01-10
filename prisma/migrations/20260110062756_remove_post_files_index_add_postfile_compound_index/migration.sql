-- AlterTable
ALTER TABLE `Post` ADD COLUMN `lat` DOUBLE NULL,
    ADD COLUMN `lng` DOUBLE NULL;

-- CreateTable
CREATE TABLE `File` (
    `id` VARCHAR(191) NOT NULL,
    `storage` VARCHAR(191) NOT NULL,
    `bucket` VARCHAR(191) NULL,
    `objectKey` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NULL,
    `sizeBytes` BIGINT NULL,
    `checksumSha256` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `durationSec` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostFile` (
    `postId` INTEGER NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `alt` VARCHAR(191) NULL,

    INDEX `PostFile_fileId_idx`(`fileId`),
    INDEX `PostFile_postId_role_sort_idx`(`postId`, `role`, `sort`),
    PRIMARY KEY (`postId`, `fileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Post_lat_lng_idx` ON `Post`(`lat`, `lng`);

-- AddForeignKey
ALTER TABLE `PostFile` ADD CONSTRAINT `PostFile_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostFile` ADD CONSTRAINT `PostFile_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
