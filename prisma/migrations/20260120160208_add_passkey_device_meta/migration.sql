-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `authorPassword` VARCHAR(191) NOT NULL DEFAULT 'legacy-comment';

-- AlterTable
ALTER TABLE `PasskeyCredential` ADD COLUMN `backedUp` BOOLEAN NULL,
    ADD COLUMN `deviceType` VARCHAR(191) NULL;
