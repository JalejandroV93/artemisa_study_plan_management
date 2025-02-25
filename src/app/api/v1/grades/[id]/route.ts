// src/app/api/v1/grades/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const updateGradeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  colombianGrade: z.number().int().min(1).max(11).optional(),
  sectionId: z.string().uuid().optional(),
});

// GET /api/v1/grades/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const grade = await prisma.grade.findUnique({
      where: { id: params.id },
        include: {
          groups: true,        // Include related groups
          gradeOfferings: true, // Include gradeOfferings
          section: true
        },
    });

    if (!grade) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    return NextResponse.json(grade);
  } catch (error) {
    console.error("Error fetching grade:", error);
    return NextResponse.json({ error: 'Failed to fetch grade' }, { status: 500 });
  }
}

// PUT /api/v1/grades/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const body = await request.json();
    const validatedData = updateGradeSchema.parse(body);

    const updatedGrade = await prisma.grade.update({
      where: { id: params.id },
      data: validatedData
    });

    return NextResponse.json(updatedGrade);
  } catch (error) {
      if (error instanceof z.ZodError) {
          return NextResponse.json({ error: error.format() }, { status: 400 });
      }
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ error: 'Grade with that name already exists in the section.' }, { status: 409 });
      }
    return NextResponse.json({ error: 'Failed to update grade' }, { status: 500 });
  }
}

// DELETE /api/v1/grades/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
try {
  // Transaction: Delete associated groups, enrollments and gradeOfferings first
  await prisma.$transaction([
    prisma.enrollment.deleteMany({ where: { gradeOffering: {gradeId: params.id} } }), // Delete associated Enrollments
    prisma.group.deleteMany({ where: { gradeId: params.id } }), // Delete Associated Groups
    prisma.gradeOffering.deleteMany({ where: { gradeId: params.id } }), // Delete Associated Grade Offerings
    prisma.grade.delete({ where: { id: params.id } }), // Finally delete the grade
  ]);

  return NextResponse.json({ message: 'Grade deleted successfully' });
} catch (error) {
  console.error("Error deleting grade:", error);
  return NextResponse.json({ error: 'Failed to delete grade' }, { status: 500 });
}
}