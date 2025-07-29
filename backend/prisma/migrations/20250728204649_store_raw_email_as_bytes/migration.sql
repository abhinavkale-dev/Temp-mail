/*
  Warnings:

  - Changed the type of `raw` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "raw",
ADD COLUMN     "raw" BYTEA NOT NULL;
