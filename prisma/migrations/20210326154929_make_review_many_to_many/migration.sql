/*
  Warnings:

  - The migration will change the primary key for the `Review` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Review` table. All the data in the column will be lost.
  - Made the column `matchId` on table `Review` required. The migration will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Review` required. The migration will fail if there are existing NULL values in that column.
  - Made the column `reflection` on table `Review` required. The migration will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Review" DROP CONSTRAINT "Review_pkey",
DROP COLUMN "id",
ALTER COLUMN "matchId" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "reflection" SET NOT NULL,
ALTER COLUMN "reflection" SET DEFAULT E'',
ADD PRIMARY KEY ("matchId", "userId");
