/*
  Warnings:

  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `externalParticipantIdentifier` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operatorId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MessageSource" AS ENUM ('OPERATOR', 'EXTERNAL');

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Participant" DROP CONSTRAINT "Participant_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Participant" DROP CONSTRAINT "Participant_profileId_fkey";

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "externalParticipantIdentifier" TEXT NOT NULL,
ADD COLUMN     "operatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "senderId",
ADD COLUMN     "operatorSenderId" TEXT,
ADD COLUMN     "source" "public"."MessageSource" NOT NULL;

-- DropTable
DROP TABLE "public"."Participant";

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_operatorSenderId_fkey" FOREIGN KEY ("operatorSenderId") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
