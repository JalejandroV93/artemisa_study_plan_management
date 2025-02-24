// src/app/api/v1/groups/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const updateGroupSchema = z.object({
  name: z.enum(["A", "B"]).optional(),  // Can only update to A or B
  gradeId: z.string().uuid().optional(),
});

// GET /api/v1/groups/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const group = await prisma.group.findUnique({
      where: { id: params.id },
        include: { grade: true }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

// PUT /api/v1/groups/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const body = await request.json();
    const validatedData = updateGroupSchema.parse(body);

    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ error: 'Group with that name already exists in the grade.' }, { status: 409 });
      }
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

// DELETE /api/v1/groups/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
     // Ensure you delete associated enrollments before deleting the group
    await prisma.$transaction([
        prisma.enrollment.deleteMany({where: {groupId: params.id}}),
        prisma.group.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}