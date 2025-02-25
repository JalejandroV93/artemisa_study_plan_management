// src/app/api/v1/subjects/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const updateSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  generalObjective: z.string().optional(),
  specificObjectives: z.array(z.string()).optional(), // Array of strings
  didactics: z.string().optional(),
  crossCuttingProjects: z.array(z.string().uuid()).optional(), // Array of *Project IDs* for connecting/disconnecting
  isActive: z.boolean().optional(),
});

// GET /api/v1/subjects/[id] (Get Single Subject)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      include: {
        crossCuttingProjects: true, // Simple include for related projects.
        gradeOfferings: {
          include: {
            trimesters: {
              include: {
                benchmarks: true,
              },
            },
            grade: {
              select: {
                name: true,
                id: true
              }
            },
            enrollments:{
              include:{
                group: {
                  select:{
                    name: true,
                    id: true
                  }
                }
              }
            }
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 });
  }
}

// PUT /api/v1/subjects/[id] (Update Subject)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = updateSubjectSchema.parse(body);

      const updatedSubject = await prisma.subject.update({
          where: { id: params.id },
          data: {
              name: validatedData.name,
              vision: validatedData.vision,
              mission: validatedData.mission,
              generalObjective: validatedData.generalObjective,
              specificObjectives: validatedData.specificObjectives, //  Update string[]
              didactics: validatedData.didactics,
              isActive: validatedData.isActive,
              ...(validatedData.crossCuttingProjects && { //Conditional Update for Many to Many
                crossCuttingProjects: {
                    set: validatedData.crossCuttingProjects.map(id => ({ id })), // set replaces all existing relations
                  },
              }),
          },
          include:{ // Include for return
              crossCuttingProjects: true
          }
      });


    return NextResponse.json(updatedSubject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Subject with that name already exists.' }, { status: 409 });
    }
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

// DELETE /api/v1/subjects/[id] (Delete Subject)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    // TRANSACTION:  Crucially important for data integrity.
      await prisma.$transaction([
        // Delete related data *before* deleting the subject.  Order matters!
        prisma.benchmark.deleteMany({ where: { trimester: { gradeOffering: { subjectId: params.id } } } }),
        prisma.trimester.deleteMany({ where: { gradeOffering: { subjectId: params.id } } }),
        prisma.enrollment.deleteMany({where: {gradeOffering: {subjectId: params.id}}}), // Enrollment
        prisma.gradeOffering.deleteMany({ where: { subjectId: params.id } }),  // Grade Offerings
        prisma.subject.delete({ where: { id: params.id } }),  // Finally, the subject
      ]);

    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}