-- AlterTable
ALTER TABLE `User` ADD COLUMN `totpConfirmedAt` DATETIME(3) NULL,
    ADD COLUMN `totpEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `totpSecretEnc` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PasskeyCredential` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `credentialId` LONGBLOB NOT NULL,
    `publicKey` LONGBLOB NOT NULL,
    `counter` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(191) NULL,
    `transports` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUsedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PasskeyCredential_credentialId_key`(`credentialId`),
    INDEX `PasskeyCredential_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PasskeyCredential` ADD CONSTRAINT `PasskeyCredential_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
