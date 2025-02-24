-- CreateTable
CREATE TABLE "AcademicCalendarSettings" (
    "id" TEXT NOT NULL,
    "numTrimesters" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCalendarSettings_pkey" PRIMARY KEY ("id")
);
