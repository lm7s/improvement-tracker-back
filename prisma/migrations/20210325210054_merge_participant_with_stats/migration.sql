/*
  Warnings:

  - You are about to drop the column `statsId` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the `Stats` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `item0` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item1` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item2` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item3` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item4` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item5` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item6` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kills` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deaths` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assists` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stats" DROP CONSTRAINT "Stats_participantId_fkey";

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "statsId",
ADD COLUMN     "item0" INTEGER NOT NULL,
ADD COLUMN     "item1" INTEGER NOT NULL,
ADD COLUMN     "item2" INTEGER NOT NULL,
ADD COLUMN     "item3" INTEGER NOT NULL,
ADD COLUMN     "item4" INTEGER NOT NULL,
ADD COLUMN     "item5" INTEGER NOT NULL,
ADD COLUMN     "item6" INTEGER NOT NULL,
ADD COLUMN     "kills" INTEGER NOT NULL,
ADD COLUMN     "deaths" INTEGER NOT NULL,
ADD COLUMN     "assists" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Stats";
