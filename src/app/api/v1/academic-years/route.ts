// src/app/api/v1/academic-years/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createAcademicYearSchema = z.object({
  academicYear: z.string().min(4).max(9), // e.g., "2024-2025", or "2024". Adjust max as needed.
  startDate: z.coerce.date(), // Coerce to Date, very important!
  endDate: z.coerce.date(),
  trimesters: z.array(
    z.object({
      number: z.number().int().min(1).max(4), // Trimester number (1, 2, 3, 4)
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
  ).min(1), // Must have at least one trimester
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const academicYears = await prisma.academicCalendarSettings.findMany({
      include: {
        trimesters: true, // Include the related trimesters
      },
      orderBy: {
        academicYear: 'desc', // Order by academic year, newest first
      },
    });
    return NextResponse.json(academicYears);
  } catch (error) {
    console.error("Error fetching academic years:", error);
    return NextResponse.json({ error: 'Failed to fetch academic years' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = createAcademicYearSchema.parse(body);

    const newAcademicYear = await prisma.$transaction(async (tx) => {
      const createdYear = await tx.academicCalendarSettings.create({
        data: {
          academicYear: validatedData.academicYear,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
        },
      });

      // Create the TrimesterSettings records *within* the transaction
      await tx.trimesterSettings.createMany({
        data: validatedData.trimesters.map((trimester) => ({
          academicCalendarSettingsId: createdYear.id, // Connect to the new year
          number: trimester.number,
          startDate: trimester.startDate,
          endDate: trimester.endDate,
        })),
      });

      return createdYear;
    });

    return NextResponse.json(newAcademicYear, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    // Handle unique constraint violations (e.g., academic year already exists)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Academic year already exists.' }, { status: 409 }); // 409 Conflict
    }
    console.error("Error creating academic year:", error);
    return NextResponse.json({ error: 'Failed to create academic year' }, { status: 500 });
  }
}