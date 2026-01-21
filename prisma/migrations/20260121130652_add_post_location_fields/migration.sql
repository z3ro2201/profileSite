-- AlterTable
ALTER TABLE `Post` ADD COLUMN `address` VARCHAR(500) NULL,
    ADD COLUMN `map_only` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `place_name` VARCHAR(200) NULL;
