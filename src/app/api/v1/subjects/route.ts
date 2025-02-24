// src/app/api/v1/subjects/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  vision: z.string().optional(),
  mission: z.string().optional(),
  generalObjective: z.string().optional(),
  specificObjectives: z.array(z.string()).optional(), // Array of strings
  didactics: z.string().optional(),
  crossCuttingProjects: z.array(z.string().uuid()).optional(),  // Array of *Project IDs* (UUIDs)
  isActive: z.boolean().optional(), // You might want a default in the schema itself.
});

// GET /api/v1/subjects (List Subjects)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gradeId = searchParams.get('gradeId'); // Optional filter
  // Add pagination parameters as needed.

  try {
    const subjects = await prisma.subject.findMany({
      where: {
        isActive: true, // Consider only active subjects, unless you have a specific need for inactive ones.
        gradeOfferings: gradeId ? { some: { gradeId } } : undefined, // Filter by grade if provided.
      },
      include: {
        gradeOfferings: { //Include how many gradeOfferings are active
          where: {
              gradeId: gradeId || undefined
          },
          select: {
            gradeId: true,
          }
        },
        crossCuttingProjects: true // Include related projects
      },
      orderBy: { name: 'asc' }, // Consistent ordering.
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

// POST /api/v1/subjects (Create Subject)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = createSubjectSchema.parse(body);

    const newSubject = await prisma.subject.create({
      data: {
        name: validatedData.name,
        vision: validatedData.vision,
        mission: validatedData.mission,
        generalObjective: validatedData.generalObjective,
        specificObjectives: validatedData.specificObjectives || [], //If there aren't specificObjectives, return an empty array
        didactics: validatedData.didactics,
        isActive: validatedData.isActive ?? true,  // Default to true if not provided
        crossCuttingProjects: { // Connect existing projects by their IDs.
          connect: validatedData.crossCuttingProjects?.map(id => ({ id })) || [],
        },
      },
      include: { // Include for return
        crossCuttingProjects: true
      }
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    //Unique constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Subject with that name already exists.' }, { status: 409 });
    }
    console.error("Error creating subject:", error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}