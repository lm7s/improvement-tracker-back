/*
  Warnings:

  - Added the required column `region` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "region" TEXT NOT NULL,
ALTER COLUMN "summonerLevel" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "Identity" (
    "id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);
