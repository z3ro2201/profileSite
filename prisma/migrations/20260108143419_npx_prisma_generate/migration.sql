/*
  Warnings:

  - Made the column `contentMd` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Post` MODIFY `contentMd` LONGTEXT NOT NULL;
