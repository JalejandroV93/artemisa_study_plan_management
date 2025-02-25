/*
  Warnings:

  - A unique constraint covering the columns `[groupId,gradeOfferingId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subjectId,gradeId]` on the table `GradeOffering` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_groupId_gradeOfferingId_key" ON "Enrollment"("groupId", "gradeOfferingId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeOffering_subjectId_gradeId_key" ON "GradeOffering"("subjectId", "gradeId");
