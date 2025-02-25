// src/app/api/v1/grade-offerings/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const updateGradeOfferingSchema = z.object({
  subjectId: z.string().uuid().optional(), //Usually shouldn't change
  gradeId: z.string().uuid().optional(),   //Usually shouldn't change
  finalReport: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try{
      const body = await request.json();
      const validatedData = updateGradeOfferingSchema.parse(body);

      const updatedGradeOffering = await prisma.gradeOffering.update({
          where: { id: params.id },
          data: validatedData,
      });

      return NextResponse.json(updatedGradeOffering);
  } catch (error) {
      if (error instanceof z.ZodError) {
          return NextResponse.json({ error: error.format() }, { status: 400 });
      }
      // Handle unique constraint violation (if subjectId and gradeId are changed to match an existing entry)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          return NextResponse.json({ error: 'A grade offering already exists for this subject and grade.' }, { status: 409 });
      }
      console.error("Error updating grade offering:", error);
      return NextResponse.json({ error: 'Failed to update grade offering' }, { status: 500 });
  }
}

// Optional: Add GET and DELETE routes here, following similar patterns
// to the subject routes.  DELETE would need a transaction to cascade
// delete related trimesters and benchmarks.