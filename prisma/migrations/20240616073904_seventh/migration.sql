/*
  Warnings:

  - Changed the type of `time` on the `Answer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `time` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `time` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "time",
ADD COLUMN     "time" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "time",
ADD COLUMN     "time" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "time",
ADD COLUMN     "time" INTEGER NOT NULL;
