// src/app/api/v1/sections/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const updateSectionSchema = z.object({
  name: z.string().min(1).max(255),
});

// GET /api/v1/sections/[id] - Get a section by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const section = await prisma.section.findUnique({
      where: { id: params.id },
      include: { grades: true }, // Include related grades
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
  }
}

// PUT /api/v1/sections/[id] - Update a section
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const body = await request.json();
    const { name } = updateSectionSchema.parse(body);

    const updatedSection = await prisma.section.update({
      where: { id: params.id },
      data: {
        name,
      },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
   if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
     if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ error: 'Section name already exists.' }, { status: 409 });  // 409 Conflict
      }
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

// DELETE /api/v1/sections/[id] - Delete a section
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    // IMPORTANT:  Handle deletion with associated grades.  You *MUST* use a transaction.
    await prisma.$transaction([
      prisma.grade.deleteMany({ where: { sectionId: params.id } }), // Delete associated grades FIRST
      prisma.section.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}