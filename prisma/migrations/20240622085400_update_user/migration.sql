/*
  Warnings:

  - You are about to drop the column `confirm` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "confirm",
ADD COLUMN     "activation_link" TEXT,
ADD COLUMN     "is_activated" BOOLEAN DEFAULT false,
ADD COLUMN     "resetpassword" TEXT;
