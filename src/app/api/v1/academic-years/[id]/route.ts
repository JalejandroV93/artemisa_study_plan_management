// src/app/api/v1/academic-years/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const updateAcademicYearSchema = z.object({
  academicYear: z.string().min(4).max(9).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
   trimesters: z.array(
    z.object({
      id: z.string().optional(), // Important: Allow ID for updates to existing trimesters
      number: z.number().int().min(1).max(4),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
  ).min(1).optional(),
});


export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const academicYear = await prisma.academicCalendarSettings.findUnique({
      where: { id: params.id },
      include: { trimesters: true }, // Include related trimesters
    });

    if (!academicYear) {
      return NextResponse.json({ error: 'Academic year not found' }, { status: 404 });
    }

    return NextResponse.json(academicYear);
  } catch (error) {
    console.error("Error fetching academic year:", error);
    return NextResponse.json({ error: 'Failed to fetch academic year' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const body = await request.json();
    const validatedData = updateAcademicYearSchema.parse(body);

      const updatedAcademicYear = await prisma.$transaction(async (tx) => {

        const updatedYear = await tx.academicCalendarSettings.update({
            where: { id: params.id },
            data: {
                academicYear: validatedData.academicYear,
                startDate: validatedData.startDate,
                endDate: validatedData.endDate,
            },
        });

        // Update or create trimesters
          if (validatedData.trimesters) {
              for (const trimesterData of validatedData.trimesters) {
                  if (trimesterData.id) {
                      // Update existing trimester
                      await tx.trimesterSettings.update({
                          where: { id: trimesterData.id },
                          data: {
                              number: trimesterData.number,
                              startDate: trimesterData.startDate,
                              endDate: trimesterData.endDate,
                          },
                      });
                  } else {
                      // Create new trimester (if you allow adding new trimesters on update)
                      await tx.trimesterSettings.create({
                          data: {
                              academicCalendarSettingsId: updatedYear.id,
                              number: trimesterData.number,
                              startDate: trimesterData.startDate,
                              endDate: trimesterData.endDate,
                          },
                      });
                  }
              }

              // Delete trimesters that are not in the updated data (optional)
              const existingTrimesterIds = validatedData.trimesters.map(t => t.id).filter(Boolean) as string[];

              await tx.trimesterSettings.deleteMany({
                where: {
                    academicCalendarSettingsId: updatedYear.id,
                    NOT: {
                        id: { in: existingTrimesterIds }
                    }
                }
            })

          }

        return updatedYear;
    });

    return NextResponse.json(updatedAcademicYear);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Academic year already exists.' }, { status: 409 });
    }
    console.error("Error updating academic year:", error);
    return NextResponse.json({ error: 'Failed to update academic year' }, { status: 500 });
  }
}



export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    // Because of `onDelete: Cascade`, deleting the AcademicCalendarSettings
    // will automatically delete related TrimesterSettings.
    await prisma.academicCalendarSettings.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Academic year deleted successfully' });
  } catch (error) {
    console.error("Error deleting academic year:", error);
    return NextResponse.json({ error: 'Failed to delete academic year' }, { status: 500 });
  }
}