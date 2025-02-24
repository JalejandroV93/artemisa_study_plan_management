// src/app/api/v1/groups/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createGroupSchema = z.object({
  name: z.enum(["A", "B"]), // Only A or B
  gradeId: z.string().uuid(),
});

// GET /api/v1/groups (with optional gradeId filter)
export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  const { searchParams } = new URL(request.url);
  const gradeId = searchParams.get('gradeId');

  try {
    const groups = await prisma.group.findMany({
      where: {
        gradeId: gradeId ?? undefined,
      },
        include: {
            grade: true
        },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

// POST /api/v1/groups
export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const body = await request.json();
    const { name, gradeId } = createGroupSchema.parse(body);

    const newGroup = await prisma.group.create({
      data: {
        name,
        gradeId,
      },
    });

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
     if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ error: 'Group with that name already exists in the grade.' }, { status: 409 });
      }
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}