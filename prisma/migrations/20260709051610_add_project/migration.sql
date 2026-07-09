-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(16) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `subtitle` VARCHAR(500) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `color` VARCHAR(20) NOT NULL,
    `period` VARCHAR(50) NOT NULL,
    `contribution` VARCHAR(50) NOT NULL,
    `url` VARCHAR(500) NULL,
    `github` VARCHAR(500) NULL,
    `body` TEXT NOT NULL,
    `stack` JSON NOT NULL,
    `year` INTEGER NULL,
    `tags` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_slug_key`(`slug`),
    INDEX `projects_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
