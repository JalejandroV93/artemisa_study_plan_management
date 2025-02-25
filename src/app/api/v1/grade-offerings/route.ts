// src/app/api/v1/grade-offerings/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createGradeOfferingSchema = z.object({
  subjectId: z.string().uuid(),
  gradeId: z.string().uuid(),
  finalReport: z.string().optional(),
  // Trimesters are created *with* the GradeOffering, so we include them here.
  trimesters: z.array(
    z.object({
      number: z.number().int().min(1).max(4), // Assuming max 4 trimesters
      benchmarks: z.array(z.object({  //Simplified benchmark for creation
        description: z.string().min(1),
        learningEvidence: z.array(z.string()).optional(),
        thematicComponents: z.array(z.string()).optional()
      })).optional()
    })
  ).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
      const body = await request.json();
      const validatedData = createGradeOfferingSchema.parse(body);

      // Check if a GradeOffering already exists for this subject and grade
      const existingOffering = await prisma.gradeOffering.findUnique({
          where: {
              subjectId_gradeId: {
                  subjectId: validatedData.subjectId,
                  gradeId: validatedData.gradeId,
              },
          },
      });

      if (existingOffering) {
          return NextResponse.json({ error: 'A grade offering already exists for this subject and grade.' }, { status: 409 }); // 409 Conflict
      }
      
      const newGradeOffering = await prisma.$transaction(async (tx) => {
          const createdOffering = await tx.gradeOffering.create({
            data: {
              subjectId: validatedData.subjectId,
              gradeId: validatedData.gradeId,
              finalReport: validatedData.finalReport || "",
            },
          });
          //Create Trimesters if they were provided
          if (validatedData.trimesters && validatedData.trimesters.length > 0) {
              for (const trimesterData of validatedData.trimesters) {
                  const createdTrimester = await tx.trimester.create({
                      data: {
                          gradeOfferingId: createdOffering.id,
                          number: trimesterData.number,
                      }
                  });
                  //Create Benchmarks if they were provided
                  if (trimesterData.benchmarks && trimesterData.benchmarks.length > 0){
                      for (const benchmarkData of trimesterData.benchmarks) {
                          await tx.benchmark.create({
                              data:{
                                  trimesterId: createdTrimester.id,
                                  description: benchmarkData.description,
                                  learningEvidence: benchmarkData.learningEvidence || [],
                                  thematicComponents: benchmarkData.thematicComponents || [],
                              }
                          })
                      }
                  }

              }
          }

        return createdOffering;
      });
      return NextResponse.json(newGradeOffering, { status: 201 });
  } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.format() }, { status: 400 });
      }
      // Handle unique constraint violation (if subjectId and gradeId already have a GradeOffering)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          return NextResponse.json({ error: 'A grade offering already exists for this subject and grade.' }, { status: 409 });
      }
      console.error("Error creating grade offering:", error);
      return NextResponse.json({ error: 'Failed to create grade offering' }, { status: 500 });
    }
}
// Optional:  Add a GET route here to fetch GradeOfferings, if needed.
// You might filter by subjectId, gradeId, etc.