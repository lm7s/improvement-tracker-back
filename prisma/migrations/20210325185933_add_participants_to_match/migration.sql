-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "teamId" TEXT;

-- AddForeignKey
ALTER TABLE "Participant" ADD FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
