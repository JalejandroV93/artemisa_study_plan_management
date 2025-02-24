// src/app/api/v1/trimesters/[id]/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const updateTrimesterSchema = z.object({
  //You usually won't update gradeOfferingId or number, but include for completeness.
  gradeOfferingId: z.string().uuid().optional(),
  number: z.number().int().min(1).max(4).optional(),
  benchmarks: z.array(
    z.object({
      id: z.string().uuid(), // Important: Include the ID for updates.
      description: z.string().min(1),
      learningEvidence: z.array(z.string()).optional(),
      thematicComponents: z.array(z.string()).optional(),
    })
  ).optional(), // Allow updating benchmarks.
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = updateTrimesterSchema.parse(body);

    const updatedTrimester = await prisma.$transaction(async (tx) => {
      const trimester = await tx.trimester.update({
        where: { id: params.id },
        data: {
          // You might allow updating gradeOfferingId and number here,
          // but be *very* careful about data consistency if you do.
        },
        include: { benchmarks: true }, // Include existing benchmarks
      });

        // Update Benchmarks
        if (validatedData.benchmarks) {
          for (const benchmarkData of validatedData.benchmarks) {
            if (benchmarkData.id) {
              // Update existing benchmark
              await tx.benchmark.update({
                where: { id: benchmarkData.id },
                data: {
                  description: benchmarkData.description,
                  learningEvidence: benchmarkData.learningEvidence,
                  thematicComponents: benchmarkData.thematicComponents,
                },
              });
            } else {
              // Create new benchmark (if you want to allow that in the update)
              await tx.benchmark.create({
                data: {
                  trimesterId: trimester.id,
                  description: benchmarkData.description,
                  learningEvidence: benchmarkData.learningEvidence,
                  thematicComponents: benchmarkData.thematicComponents,
                },
              });
            }
          }

          // Delete benchmarks that are not in the updated data (optional, careful!)
            const existingBenchmarkIds = validatedData.benchmarks
            .map((b) => b.id)
            .filter(Boolean) as string[]; //remove undefined

            await tx.benchmark.deleteMany({
                where:{
                    trimesterId: trimester.id,
                    NOT: {
                        id: { in: existingBenchmarkIds },
                    },
                }
            })
        }


      return trimester;
    });


    return NextResponse.json(updatedTrimester);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    console.error("Error updating trimester:", error);
    return NextResponse.json({ error: 'Failed to update trimester' }, { status: 500 });
  }
}

// Optional: Add GET and DELETE routes.  DELETE should cascade-delete benchmarks.