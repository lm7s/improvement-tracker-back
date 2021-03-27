-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthInfo" (
    "id" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "summonerId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileIconId" INTEGER NOT NULL,
    "summonerLevel" INTEGER NOT NULL,
    "userId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueInfo" (
    "id" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "leaguePoints" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "veteran" BOOLEAN NOT NULL,
    "inactive" BOOLEAN NOT NULL,
    "freshBlood" BOOLEAN NOT NULL,
    "hotStreak" BOOLEAN NOT NULL,
    "userId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "gameId" BIGINT NOT NULL,
    "platformId" TEXT NOT NULL,
    "creationDateGMT" TIMESTAMP(3) NOT NULL,
    "durationTime" INTEGER NOT NULL,
    "queueId" INTEGER NOT NULL,
    "mapId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "gameMode" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,

    PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "hasWon" BOOLEAN NOT NULL,
    "drewFirstBlood" BOOLEAN NOT NULL,
    "brokeFirstTower" BOOLEAN NOT NULL,
    "brokeFirstInhibitor" BOOLEAN NOT NULL,
    "killedFirstBaron" BOOLEAN NOT NULL,
    "killedFirstDragon" BOOLEAN NOT NULL,
    "towerKills" INTEGER NOT NULL,
    "inhibitorKills" INTEGER NOT NULL,
    "baronKills" INTEGER NOT NULL,
    "dragonKills" INTEGER NOT NULL,
    "riftHeraldKills" INTEGER NOT NULL,
    "matchId" BIGINT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL,
    "championId" INTEGER NOT NULL,
    "pickTurn" INTEGER NOT NULL,
    "teamId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "participantId" INTEGER NOT NULL,
    "championId" INTEGER NOT NULL,
    "spell1Id" INTEGER NOT NULL,
    "spell2Id" INTEGER NOT NULL,
    "statsId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" TEXT NOT NULL,
    "item0" INTEGER NOT NULL,
    "item1" INTEGER NOT NULL,
    "item2" INTEGER NOT NULL,
    "item3" INTEGER NOT NULL,
    "item4" INTEGER NOT NULL,
    "item5" INTEGER NOT NULL,
    "item6" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "participantId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "matchId" BIGINT,
    "userId" TEXT,
    "reflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthInfo_userId_unique" ON "AuthInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_unique" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueInfo_userId_unique" ON "LeagueInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_participantId_unique" ON "Stats"("participantId");

-- AddForeignKey
ALTER TABLE "AuthInfo" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueInfo" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD FOREIGN KEY ("matchId") REFERENCES "Match"("gameId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD FOREIGN KEY ("matchId") REFERENCES "Match"("gameId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
