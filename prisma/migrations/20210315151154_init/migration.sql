/*
  Warnings:

  - Made the column `added` on table `videos` required. The migration will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "videos" ALTER COLUMN "added" SET NOT NULL,
ALTER COLUMN "added" SET DEFAULT CURRENT_TIMESTAMP;
