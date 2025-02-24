// src/app/api/v1/sections/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createSectionSchema = z.object({
  name: z.string().min(1).max(255),
});

// GET /api/v1/sections - Get all sections
export async function GET() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const sections = await prisma.section.findMany({
            orderBy: { name: 'asc' }, // Order alphabetically
        });
        return NextResponse.json(sections);
    } catch (error) {
        console.error("Error fetching sections:", error);
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
    }
}

// POST /api/v1/sections - Create a new section
export async function POST(request: Request) {
  const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  try {
    const body = await request.json();
    const { name } = createSectionSchema.parse(body);

    const newSection = await prisma.section.create({
      data: {
        name,
      },
    });

    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
     if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ error: 'Section name already exists.' }, { status: 409 });  // 409 Conflict
      }
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}