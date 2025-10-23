/*
  Warnings:

  - Made the column `maker` on table `Mark` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Mark` DROP FOREIGN KEY `fk_Mark_maker_Member`;

-- AlterTable
ALTER TABLE `Mark` MODIFY `title` VARCHAR(30) NOT NULL,
    MODIFY `maker` INTEGER UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `Mark` ADD CONSTRAINT `fk_Mark_maker_Member` FOREIGN KEY (`maker`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
