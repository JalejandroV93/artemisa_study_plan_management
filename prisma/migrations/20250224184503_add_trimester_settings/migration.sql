/*
  Warnings:

  - You are about to drop the column `numTrimesters` on the `AcademicCalendarSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[academicYear]` on the table `AcademicCalendarSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `AcademicCalendarSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `AcademicCalendarSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AcademicCalendarSettings" DROP COLUMN "numTrimesters",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "TrimesterSettings" (
    "id" TEXT NOT NULL,
    "academicCalendarSettingsId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrimesterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrimesterSettings_academicCalendarSettingsId_number_idx" ON "TrimesterSettings"("academicCalendarSettingsId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "TrimesterSettings_academicCalendarSettingsId_number_key" ON "TrimesterSettings"("academicCalendarSettingsId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCalendarSettings_academicYear_key" ON "AcademicCalendarSettings"("academicYear");

-- AddForeignKey
ALTER TABLE "TrimesterSettings" ADD CONSTRAINT "TrimesterSettings_academicCalendarSettingsId_fkey" FOREIGN KEY ("academicCalendarSettingsId") REFERENCES "AcademicCalendarSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
