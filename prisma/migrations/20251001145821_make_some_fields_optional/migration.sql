/*
  Warnings:

  - You are about to drop the column `activate` on the `SlackInstallation` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionID` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SlackInstallation" DROP COLUMN "activate",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "stripeSubscriptionID",
ADD COLUMN     "stripeSubscriptionId" TEXT;
