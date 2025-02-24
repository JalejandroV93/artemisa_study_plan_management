
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { Grade } from '@/types/school_settings';
const createGradeSchema = z.object({
  name: z.string().min(1).max(255),
  colombianGrade: z.number().int().min(1).max(11),
  sectionId: z.string().uuid(),
});

// GET /api/v1/grades - Get all grades (with optional sectionId filter)
export async function GET(request: Request) {
  const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId');

  try {
    const grades = await prisma.grade.findMany({
      where: {
        sectionId: sectionId ?? undefined, // Use undefined if sectionId is null
      },
      orderBy: {
        colombianGrade: 'asc', // Order by Colombian grade
      },
        include:{
            section: true,
            groups: true
        }
    });
    return NextResponse.json(grades as Grade[]); // Cast to your custom type
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}

// POST /api/v1/grades - Create a new grade
export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const body = await request.json();
    const { name, colombianGrade, sectionId } = createGradeSchema.parse(body);

    const newGrade = await prisma.grade.create({
      data: {
        name,
        colombianGrade,
        sectionId,
      },
    });

    return NextResponse.json(newGrade, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ error: 'Grade with that name already exists in the section.' }, { status: 409 });
      }
    return NextResponse.json({ error: 'Failed to create grade' }, { status: 500 });
  }
}